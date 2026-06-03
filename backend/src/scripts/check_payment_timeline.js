const mongoose = require("mongoose");

async function checkPaymentTimeline() {
  try {
    console.log("🔄 Đang kết nối MongoDB Atlas...\n");

    const uri = `mongodb://nhandtps40210:dtn280705reseller@ac-0evdfk1-shard-00-00.bk91ctf.mongodb.net:27017/Reseller?ssl=true&authSource=admin&directConnection=true`;

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20000,
    });

    console.log("✅ Đã kết nối MongoDB\n");

    const db = mongoose.connection.db;

    // Tìm user
    const user = await db.collection("users").findOne({ email: "kennguyentv9x@gmail.com" });
    if (!user) {
      console.log("❌ Không tìm thấy user");
      return;
    }

    console.log(`👤 USER: ${user.email}`);
    console.log(`📅 User Created: ${user.createdAt}`);
    console.log(`💰 Current Wallet: ${user.walletBalance} USD\n`);

    // Lấy tất cả payments
    const payments = await db.collection("payments")
      .find({ sellerId: user._id })
      .sort({ createdAt: 1 })
      .toArray();

    console.log("═══════════════════════════════════════════════════════════════");
    console.log("LỊCH SỬ PAYMENTS (từ lúc tạo đến giờ)");
    console.log("═══════════════════════════════════════════════════════════════\n");

    let runningBalance = 0;
    let firstDepositFound = false;
    let firstDepositTime = null;
    let initialBalanceBeforeFirstDeposit = 0;

    console.log("No  | Time                        | Type    | Amount   | Balance  | Note");
    console.log("----|----------------------------|---------|----------|----------|---------------------------");

    for (let i = 0; i < payments.length; i++) {
      const p = payments[i];
      const usd = p.amountUSD || 0;
      const status = p.status;
      const time = new Date(p.completedAt || p.createdAt).toLocaleString("vi-VN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });

      let type = "";
      let note = "";

      if (status === "completed") {
        if (usd > 0) {
          if (p.transferContent.includes("ADMIN_TOPUP")) {
            type = "ADMIN+";
            note = p.note || "Manual topup";
          } else {
            type = "BANK+";
            note = "Bank deposit";
            
            // Đánh dấu đây là lần nạp đầu tiên
            if (!firstDepositFound) {
              firstDepositFound = true;
              firstDepositTime = p.completedAt || p.createdAt;
              initialBalanceBeforeFirstDeposit = runningBalance;
            }
          }
          runningBalance += usd;
        } else if (usd < 0) {
          type = "ADMIN-";
          note = p.note || "Manual deduction";
          runningBalance += usd;
        }
      } else {
        type = status.toUpperCase();
        note = "Pending/Expired";
      }

      const typeStr = type.padEnd(7);
      const amountStr = usd.toFixed(2).padStart(8);
      const balanceStr = runningBalance.toFixed(2).padStart(8);
      note = (note || "").substring(0, 25);

      console.log(`${String(i + 1).padStart(3)} | ${time} | ${typeStr} | ${amountStr} | ${balanceStr} | ${note}`);
    }

    console.log("\n═══════════════════════════════════════════════════════════════");
    console.log("PHÂN TÍCH");
    console.log("═══════════════════════════════════════════════════════════════\n");

    console.log(`📅 User được tạo: ${user.createdAt}`);
    console.log(`📅 Lần nạp tiền đầu tiên: ${firstDepositTime || "Không có"}`);
    
    if (firstDepositFound) {
      const timeDiff = new Date(firstDepositTime) - new Date(user.createdAt);
      const minutesDiff = Math.round(timeDiff / 60000);
      console.log(`⏱️  Thời gian từ lúc tạo đến lần nạp đầu: ${minutesDiff} phút`);
    }

    console.log(`\n💰 Số dư TRƯỚC lần nạp đầu tiên: ${initialBalanceBeforeFirstDeposit.toFixed(2)} USD`);

    if (initialBalanceBeforeFirstDeposit > 0) {
      console.log(`\n⚠️  PHÁT HIỆN: User có số dư ${initialBalanceBeforeFirstDeposit.toFixed(2)} USD TRƯỚC KHI nạp tiền lần đầu!`);
      console.log("   → ĐÂY LÀ NGUỒN 'TIỀN BẤT THƯỜNG'!");
      console.log("   → Có thể do: Admin nạp thủ công trước đó, HOẶC seed data test");
    }

    // Tìm xem có admin topup nào trước bank deposit đầu tiên không
    const adminTopups = payments.filter(p => 
      p.status === "completed" && 
      (p.amountUSD || 0) > 0 && 
      p.transferContent.includes("ADMIN_TOPUP")
    );

    if (adminTopups.length > 0) {
      console.log("\n📋 LỊCH SỬ ADMIN TOPUP:");
      for (const p of adminTopups) {
        console.log(`   - ${p.amountUSD} USD | ${p.completedAt || p.createdAt} | ${p.note}`);
      }
    }

    // Kiểm tra user dtn@gmail.com (có 669.40 USD)
    console.log("\n\n═══════════════════════════════════════════════════════════════");
    console.log("SO SÁNH VỚI USER KHÁC: dtn@gmail.com");
    console.log("═══════════════════════════════════════════════════════════════\n");

    const dtnUser = await db.collection("users").findOne({ email: "dtn@gmail.com" });
    if (dtnUser) {
      const dtnPayments = await db.collection("payments")
        .find({ sellerId: dtnUser._id, status: "completed" })
        .sort({ createdAt: 1 })
        .toArray();

      let dtnDeposits = 0;
      let dtnAdminTopup = 0;
      let dtnDeducts = 0;

      for (const p of dtnPayments) {
        const usd = p.amountUSD || 0;
        if (usd > 0) {
          if (p.transferContent.includes("ADMIN_TOPUP")) {
            dtnAdminTopup += usd;
          } else {
            dtnDeposits += usd;
          }
        } else if (usd < 0) {
          dtnDeducts += usd;
        }
      }

      console.log(`👤 dtn@gmail.com:`);
      console.log(`   Current wallet: ${dtnUser.walletBalance.toFixed(2)} USD`);
      console.log(`   Bank deposits: ${dtnDeposits.toFixed(2)} USD`);
      console.log(`   Admin topups: ${dtnAdminTopup.toFixed(2)} USD`);
      console.log(`   Admin deducts: ${dtnDeducts.toFixed(2)} USD`);
      console.log(`   Tính toán: ${(dtnDeposits + dtnAdminTopup + dtnDeducts).toFixed(2)} USD`);
    }

  } catch (error) {
    console.error("❌ Lỗi:", error.message);
  } finally {
    try {
      await mongoose.disconnect();
      console.log("\n👋 Đã ngắt kết nối MongoDB");
    } catch (e) { }
  }
}

checkPaymentTimeline();
