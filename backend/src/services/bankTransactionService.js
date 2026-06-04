const axios = require("axios");
const { Payment } = require("../models/Payment");
const { User } = require("../models/User");

/**
 * Lấy lịch sử giao dịch từ API ngân hàng
 */
async function fetchBankTransactions(bankAccount) {
  try {
    if (!bankAccount.apiUrl || !bankAccount.apiUrl.trim()) {
      console.warn(`[BankTransactionService] Bank account ${bankAccount._id} chưa có API URL`);
      return [];
    }

    const apiUrl = bankAccount.apiUrl.trim();

    const response = await axios.get(apiUrl, {
      timeout: 10000,
    });

    if (response.data.code !== "00") {
      console.warn("[BankTransactionService] API returned error:", response.data.des);
      return [];
    }

    const transactions = response.data.transactions || [];

    return transactions.map((txn) => {
      const amountStr = (txn.Amount || "0").replace(/,/g, "");
      const amount = parseInt(amountStr) || 0;
      const isIncoming = txn.CD === "+" || txn.DorCCode === "C";
      const transactionId = String(txn.Reference || txn.SeqNo || "").trim();
      const description = String(txn.Description || txn.Remark || "").trim();

      return {
        transactionID: transactionId,
        amount: amount,
        content: description,
        description: description,
        date: txn.tranDate || txn.TransactionDate || "",
        time: txn.PCTime || txn.PostingTime || "",
        type: isIncoming ? "IN" : "OUT",
      };
    });
  } catch (error) {
    console.error("[BankTransactionService] Error fetching bank transactions:", error.message);
    if (error.response) {
      console.error("[BankTransactionService] Response status:", error.response.status);
      console.error("[BankTransactionService] Response data:", error.response.data);
    }
    return [];
  }
}

/**
 * Kiểm tra và cập nhật thanh toán từ lịch sử giao dịch
 *
 * Logic an toàn chống race condition:
 * 1. KHÔNG claim payment trước khi biết có giao dịch khớp hay không
 * 2. Trước tiên scan API bank để xem có giao dịch khớp không
 * 3. Chỉ khi CÓ giao dịch khớp → dùng findOneAndUpdate atomic để claim + xử lý trong 1 bước
 * 4. Không lock/unlock vòng lặp — payment không bị đụng đến nếu chưa có giao dịch
 */
async function checkAndUpdatePayments() {
  const now = new Date();

  try {
    // 1. Xóa payment đã hết hạn
    const deletedCount = await Payment.deleteMany({
      status: "pending",
      expiresAt: { $lte: now },
    });
    if (deletedCount.deletedCount > 0) {
      console.log(`[BankTransactionService] Đã xóa ${deletedCount.deletedCount} payment(s) đã hết hạn`);
    }

    // 2. Lấy danh sách bank account active
    const { BankAccount } = require("../models/BankAccount");
    const bankAccounts = await BankAccount.find({ isActive: true }).lean();
    if (bankAccounts.length === 0) {
      return { checked: 0, updated: 0, deleted: deletedCount.deletedCount || 0 };
    }

    let updated = 0;

    // 3. Xử lý từng bank account
    for (const bankAccount of bankAccounts) {
      // 3a. Fetch giao dịch từ API bank
      const transactions = await fetchBankTransactions(bankAccount);
      if (transactions.length === 0) continue;

      console.log(`[BankTransactionService] Bank ${bankAccount.bankName}: lấy được ${transactions.length} giao dịch`);

      // 3b. Tìm payment pending của bank account này
      // Chỉ lấy payment có: status=pending, chưa hết hạn, và chưa được xử lý
      const pendingPayments = await Payment.find({
        bankAccountId: bankAccount._id,
        status: "pending",
        expiresAt: { $gt: now },
      }).lean();

      if (pendingPayments.length === 0) continue;

      console.log(`[BankTransactionService] Bank ${bankAccount.bankName}: ${pendingPayments.length} payment(s) đang chờ`);

      // 3c. Với mỗi payment, kiểm tra xem có giao dịch ngân hàng khớp không
      for (const payment of pendingPayments) {
        const paymentAmountVND = Number(payment.amountVND || payment.amount || 0);
        const paymentContent = String(payment.transferContent || "").trim().toLowerCase();

        // Tìm giao dịch khớp (chỉ xem, KHÔNG claim gì cả)
        const matchingTxn = transactions.find((txn) => {
          if (txn.type !== "IN") return false;
          const txnAmount = typeof txn.amount === "string"
            ? parseInt(txn.amount.replace(/,/g, ""))
            : txn.amount;
          if (txnAmount !== paymentAmountVND) return false;
          const txnDesc = (txn.description || "").toLowerCase();
          if (!txnDesc.includes(paymentContent)) return false;
          return true;
        });

        if (!matchingTxn) {
          // Không có giao dịch khớp → KHÔNG làm gì cả, để payment yên
          continue;
        }

        console.log(`[BankTransactionService] Tìm thấy giao dịch khớp cho payment ${payment._id} (${paymentAmountVND} VND)`);

        // 3d. CÓ giao dịch khớp → ATOMIC CLAIM + COMPLETE trong 1 MongoDB transaction
        // Điều kiện: _id đúng, status vẫn là "pending" (chưa bị backend khác xử lý)
        const usdAmount = Number(payment.amountUSD ?? (paymentAmountVND / 25000));

        const session = await require("mongoose").startSession();
        try {
          await session.withTransaction(async () => {
            // Bước 1: Kiểm tra chắc chắn payment chưa completed (double-check trong transaction)
            const existingCompleted = await Payment.findOne({
              _id: payment._id,
              status: "completed",
            }).session(session);
            if (existingCompleted) {
              console.log(`[BankTransactionService] Payment ${payment._id} đã completed trước đó, bỏ qua`);
              return;
            }

            // Bước 2: Claim payment = mark completed trong 1 atomic findOneAndUpdate
            // Nếu backend khác đã claim rồi thì operation này trả về null → abort
            const claimed = await Payment.findOneAndUpdate(
              {
                _id: payment._id,
                status: "pending",
              },
              {
                $set: {
                  status: "completed",
                  completedAt: now,
                },
              },
              { new: true, session }
            );

            if (!claimed) {
              console.log(`[BankTransactionService] Payment ${payment._id} đã bị backend khác claim, bỏ qua`);
              return;
            }

            // Bước 3: Atomic wallet update ($inc)
            const seller = await User.findOneAndUpdate(
              { _id: payment.sellerId },
              { $inc: { walletBalance: usdAmount } },
              { new: true, session }
            );

            if (!seller) {
              console.error(`[BankTransactionService] Không tìm thấy seller ${payment.sellerId}`);
              // Seller không tồn tại → abort transaction, payment quay về pending
              throw new Error(`Seller ${payment.sellerId} not found`);
            }

            // Bước 4: Ghi wallet balance vào payment record
            const walletBeforeUSD = Number(seller.walletBalance || 0) - usdAmount;
            const walletAfterUSD = Number(seller.walletBalance || 0);

            await Payment.findByIdAndUpdate(
              payment._id,
              {
                walletBeforeUSD,
                walletAfterUSD,
                walletBeforeVND: Math.round(walletBeforeUSD * 25000),
                walletAfterVND: Math.round(walletAfterUSD * 25000),
              },
              { session }
            );

            updated++;
            console.log(
              `✓ Payment ${payment._id} (${paymentAmountVND} VND → ${usdAmount} USD) ` +
              `đã xử lý. Seller ${payment.sellerId}: ` +
              `${walletBeforeUSD.toFixed(2)} → ${walletAfterUSD.toFixed(2)} USD`
            );
          });
        } catch (err) {
          // Transaction bị abort (rollback hoàn toàn) nếu có lỗi
          // Payment sẽ quay về pending → cron sau sẽ thử lại
          if (err.message.includes("Seller")) {
            console.error(`[BankTransactionService] Lỗi xử lý payment ${payment._id}: ${err.message}`);
          } else {
            console.error(`[BankTransactionService] Transaction thất bại cho payment ${payment._id}: ${err.message}`);
          }
        } finally {
          session.endSession();
        }
      }
    }

    return {
      checked: updated,
      updated,
      deleted: deletedCount.deletedCount || 0,
    };
  } catch (error) {
    console.error("[BankTransactionService] Error checking payments:", error);
    return { checked: 0, updated: 0, deleted: 0, error: error.message };
  }
}

module.exports = {
  fetchBankTransactions,
  checkAndUpdatePayments,
};
