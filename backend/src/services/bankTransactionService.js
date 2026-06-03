const axios = require("axios");
const { Payment } = require("../models/Payment");
const { User } = require("../models/User");

/**
 * Lấy lịch sử giao dịch từ API ngân hàng
 * Sử dụng API từ BankAccount.apiUrl
 */
async function fetchBankTransactions(bankAccount) {
  try {
    // Kiểm tra xem bank account có API URL chưa
    if (!bankAccount.apiUrl || !bankAccount.apiUrl.trim()) {
      console.warn(`[BankTransactionService] Bank account ${bankAccount._id} chưa có API URL`);
      return [];
    }

    const apiUrl = bankAccount.apiUrl.trim();
    
    const response = await axios.get(apiUrl, {
      timeout: 10000, // 15 giây timeout
    });

    // Parse response từ sieuthicode.net API hoặc tương tự
    // Format response:
    // {
    //   "mid": "14",
    //   "code": "00",
    //   "des": "success",
    //   "transactions": [
    //     {
    //       "tranDate": "02/04/2024",
    //       "TransactionDate": "02/04/2024",
    //       "Reference": "5243 - 51972",
    //       "CD": "-",
    //       "Amount": "10,000",
    //       "Description": "MBVCB.5655475306.subgiare118064...",
    //       "PCTime": "160258",
    //       "DorCCode": "D",
    //       "EffDate": "2024-04-02",
    //       "PostingDate": "2024-04-02",
    //       "PostingTime": "160258",
    //       "Remark": "...",
    //       "SeqNo": "51972",
    //       "TnxCode": "74",
    //       "Teller": "5243"
    //     }
    //   ],
    //   "nextIndex": "1"
    // }

    if (response.data.code !== "00") {
      console.warn("[BankTransactionService] API returned error:", response.data.des);
      return [];
    }

    const transactions = response.data.transactions || [];

    // Transform transactions để phù hợp với format hệ thống
    return transactions.map((txn) => {
      // Parse amount từ string "10,000" sang number
      const amountStr = (txn.Amount || "0").replace(/,/g, "");
      const amount = parseInt(amountStr) || 0;
      
      // Xác định type: "C" hoặc "CD" = "+" là tiền vào, "D" hoặc "DorCCode" = "D" là tiền ra
      const isIncoming = txn.CD === "+" || txn.DorCCode === "C";
      const transactionId = String(txn.Reference || txn.SeqNo || "").trim();
      const description = String(txn.Description || txn.Remark || "").trim();
      
      return {
        transactionID: transactionId,
        amount: amount,
        content: description,
        description: description,
        date: txn.tranDate || txn.TransactionDate || "", // "02/04/2024"
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
 */
async function checkAndUpdatePayments() {
  try {
    const now = new Date();

    // Lấy tất cả payment pending
    const pendingPayments = await Payment.find({
      status: "pending",
      expiresAt: { $gt: now }, // Chưa hết hạn
    }).populate("bankAccountId");

    if (pendingPayments.length === 0) {
      // Vẫn cần kiểm tra và xóa các payment đã hết hạn
      const deletedCount = await Payment.deleteMany({
        status: "pending",
        expiresAt: { $lte: now },
      });
      return { checked: 0, updated: 0, deleted: deletedCount.deletedCount || 0 };
    }

    console.log(`[BankTransactionService] Tìm thấy ${pendingPayments.length} payment(s) đang chờ thanh toán`);

    let checked = 0;
    let updated = 0;

    // Group payments theo bank account
    const paymentsByBank = {};
    for (const payment of pendingPayments) {
      const bankId = payment.bankAccountId._id.toString();
      if (!paymentsByBank[bankId]) {
        paymentsByBank[bankId] = [];
      }
      paymentsByBank[bankId].push(payment);
    }

    // Check từng bank account
    for (const [bankId, payments] of Object.entries(paymentsByBank)) {
      const bankAccount = payments[0].bankAccountId;
      
      if (!bankAccount.apiUrl || !bankAccount.apiUrl.trim()) {
        console.warn(`[BankTransactionService] Bank account ${bankAccount.bankName} (${bankAccount.accountNumber}) chưa có API URL, bỏ qua ${payments.length} payment(s)`);
        continue;
      }

      console.log(`[BankTransactionService] Đang kiểm tra ${payments.length} payment(s) cho bank ${bankAccount.bankName} (${bankAccount.accountNumber})`);
      
      // Lấy lịch sử giao dịch từ API URL của bank account
      const transactions = await fetchBankTransactions(bankAccount);
      const completedContentSet = new Set(
        (await Payment.find({
          bankAccountId: bankAccount._id,
          status: "completed",
          amountUSD: { $gt: 0 },
        }).select("transferContent amount amountVND amountUSD")).map((payment) => {
          const normalizedContent = String(payment.transferContent || "").trim().toLowerCase();
          const normalizedAmount = Number(payment.amountVND || payment.amount || 0);
          return `${normalizedAmount}::${normalizedContent}`;
        })
      );

      console.log(`[BankTransactionService] Lấy được ${transactions.length} giao dịch từ API`);

      checked += payments.length;

      // Kiểm tra từng payment
      for (const payment of payments) {
        // Tìm giao dịch khớp với payment
        // Chỉ lấy giao dịch loại "IN" (tiền vào)
        const matchingTransaction = transactions.find((txn) => {
          // Kiểm tra số tiền và nội dung chuyển khoản
          // amount từ API là string, cần so sánh với number
          const txnAmount = typeof txn.amount === "string" ? parseInt(txn.amount.replace(/,/g, "")) : txn.amount;
          // So sánh với amountVND (ưu tiên) hoặc amount (fallback)
          const paymentAmount = payment.amountVND || payment.amount;
          const matchesAmount = txnAmount === paymentAmount;
          
          // Kiểm tra nội dung chuyển khoản trong description
          const matchesContent = txn.description && 
            txn.description.toLowerCase().includes(payment.transferContent.toLowerCase());
          
          // Chỉ match giao dịch tiền vào
          const isIncoming = txn.type === "IN";
          
          console.log(`[BankTransactionService] Checking transaction: amount=${txnAmount}, paymentAmount=${paymentAmount}, matchesAmount=${matchesAmount}, matchesContent=${matchesContent}, isIncoming=${isIncoming}, content="${txn.description}", transferContent="${payment.transferContent}"`);
          
          return matchesAmount && matchesContent && isIncoming;
        });

        if (matchingTransaction) {
          const transferContentKey = `${Number(payment.amountVND || payment.amount || 0)}::${String(payment.transferContent || "").trim().toLowerCase()}`;

          if (completedContentSet.has(transferContentKey)) {
            console.log(`[BankTransactionService] - Payment ${payment._id} (${payment.transferContent}, ${payment.amount} VNĐ) đã được ghi nhận trước đó, bỏ qua cộng wallet`);
            payment.status = "completed";
            payment.completedAt = payment.completedAt || new Date();
            await payment.save();
            continue;
          }

          // Tìm thấy giao dịch khớp, cộng tiền vào wallet (USD)
          const seller = await User.findById(payment.sellerId);
          if (seller) {
            // Cộng USD vào wallet (wallet lưu USD)
            const usdAmount = Number(payment.amountUSD || (payment.amount / 25000)); // Fallback nếu không có amountUSD
            seller.walletBalance = Number(seller.walletBalance || 0) + usdAmount;
            await seller.save();
          }

          // Cập nhật trạng thái payment
          payment.status = "completed";
          payment.completedAt = new Date();
          await payment.save();
          completedContentSet.add(transferContentKey);

          updated++;
          console.log(`[BankTransactionService] ✓ Payment ${payment._id} (${payment.transferContent}, ${payment.amount} VNĐ) đã được xác minh và cộng tiền vào wallet cho seller ${payment.sellerId}`);
        } else {
          console.log(`[BankTransactionService] - Payment ${payment._id} (${payment.transferContent}, ${payment.amount} VNĐ) chưa tìm thấy giao dịch khớp`);
        }
      }
    }

    // Xóa các payment đã hết hạn (quá 15 phút)
    const deletedCount = await Payment.deleteMany({
      status: "pending",
      expiresAt: { $lte: now },
    });

    if (deletedCount.deletedCount > 0) {
      console.log(`[BankTransactionService] Đã xóa ${deletedCount.deletedCount} payment(s) đã hết hạn (quá 15 phút)`);
    }

    return { checked, updated, deleted: deletedCount.deletedCount || 0 };
  } catch (error) {
    console.error("Error checking payments:", error);
    return { checked: 0, updated: 0, deleted: 0, error: error.message };
  }
}

module.exports = {
  fetchBankTransactions,
  checkAndUpdatePayments,
};