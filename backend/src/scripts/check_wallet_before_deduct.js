const mongoose = require("mongoose");

async function checkWalletBeforeDeduct() {
  try {
    console.log("🔄 Đang kết nối MongoDB Atlas...\n");

    const uri = `mongodb://nhandtps40210:dtn280705reseller@ac-0evdfk1-shard-00-00.bk91ctf.mongodb.net:27017/Reseller?ssl=true&authSource=admin&directConnection=true`;

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20000,
    });

    console.log("✅ Đã kết nối MongoDB\n");

    const db = mongoose.connection.db;

    const user = await db.collection("users").findOne({ email: "kennguyentv9x@gmail.com" });
    if (!user) {
      console.log("❌ Không tìm thấy user");
      return;
    }

    console.log(`👤 USER: ${user.email}`);
    console.log(`💰 Current Wallet: ${user.walletBalance} USD\n`);

    // Lấy TẤT CẢ payments của user (tất cả, không chỉ completed)
    const allPayments = await db.collection("payments")
      .find({ sellerId: user._id })
      .sort({ createdAt: 1 })
      .toArray();

    console.log("═══════════════════════════════════════════════════════════════");
    console.log("TIMELINE: 22:00 - 22:30 (THỜI ĐIỂM BẠN TRỪ TIỀN)");
    console.log("═══════════════════════════════════════════════════════════════\n");

    let runningBalance = 0;
    const timeline = [];

    for (const p of allPayments) {
      const completedAt = p.completedAt || p.createdAt;
      const time = new Date(completedAt);
      
      // Chỉ quan tâm thời điểm từ 22:00 trở đi
      if (time >= new Date("2026-06-01T15:00:00.000Z")) { // 22:00 +7
        const usd = p.amountUSD || 0;
        const status = p.status;
        const timeStr = time.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        
        if (status === "completed") {
          runningBalance += usd;
        }
        
        const type = usd > 0 ? "📥 NẠP" : (usd < 0 ? "📤 TRỪ " : "⚪ KHÁC");
        const balanceStr = runningBalance.toFixed(2).padStart(8);
        
        timeline.push({
          time: timeStr,
          type: type,
          usd: usd,
          balance: runningBalance,
          status: status,
          content: p.transferContent
        });
        
        console.log(`[${timeStr}] ${type} ${usd.toFixed(2).padStart(8)} USD | Balance: ${balanceStr} | ${p.transferContent}`);
      }
    }

    console.log("\n═══════════════════════════════════════════════════════════════");
    console.log("PHÂN TÍCH: ĐIỂM TRƯỚC KHI BẠN TRỪ TIỀN");
    console.log("═══════════════════════════════════════════════════════════════\n");

    // Tìm thời điểm TRƯỚC KHI bắt đầu trừ (22:14:47)
    const beforeDeductTime = new Date("2026-06-01T15:14:00.000Z"); // 22:14 +7

    // Tính balance tại thời điểm đó
    let balanceBeforeDeduct = 0;
    for (const p of allPayments) {
      const completedAt = p.completedAt || p.createdAt;
      if (completedAt < beforeDeductTime && p.status === "completed") {
        balanceBeforeDeduct += (p.amountUSD || 0);
      }
    }

    console.log(`📊 Wallet tại 22:14 (TRƯỚC KHI bạn trừ): ${balanceBeforeDeduct.toFixed(2)} USD`);
    console.log("");

    // Tính từng bước
    const step1_before = balanceBeforeDeduct;
    const step2_after50 = step1_before - 50;
    const step3_after5 = step2_after50 - 5;
    const step4_after1 = step3_after5 - 1;
    const step5_afterDeposit = step4_after1 + 5.16;
    const step6_after15 = step5_afterDeposit - 15;

    console.log("📐 TÍNH TOÁN TỪNG BƯỚC:");
    console.log("─────────────────────────────────────────────────────────────");
    console.log(`1. Wallet ban đầu:                   ${step1_before.toFixed(2)} USD`);
    console.log(`2. Trừ -50 USD:                     ${step2_after50.toFixed(2)} USD`);
    console.log(`3. Trừ -5 USD:                      ${step3_after5.toFixed(2)} USD`);
    console.log(`4. Trừ -1 USD:                      ${step4_after1.toFixed(2)} USD`);
    console.log(`5. Nạp +5.16 USD (129k):           ${step5_afterDeposit.toFixed(2)} USD`);
    console.log(`6. Trừ -15 USD:                    ${step6_after15.toFixed(2)} USD`);
    console.log("─────────────────────────────────────────────────────────────");
    console.log("");

    // Kiểm tra xem wallet có thực sự bị trừ hết không
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("⚠️  KIỂM TRA: BẠN CÓ THỰC SỰ TRỪ HẾT KHÔNG?");
    console.log("═══════════════════════════════════════════════════════════════\n");

    if (step4_after1 > 0) {
      console.log(`❌ SAU KHI TRỪ 3 LẦN (50+5+1=56 USD), wallet vẫn còn: ${step4_after1.toFixed(2)} USD`);
      console.log(`   → Bạn KHÔNG trừ hết tiền! Wallet còn ${step4_after1.toFixed(2)} USD.`);
    } else {
      console.log(`✅ Wallet sau khi trừ 3 lần: ${step4_after1.toFixed(2)} USD`);
    }

    console.log("");

    // Kiểm tra xem user có được cộng đúng 5.16 USD không
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("⚠️  KIỂM TRA: USER CÓ ĐƯỢC CỘNG ĐÚNG 5.16 USD KHÔNG?");
    console.log("═══════════════════════════════════════════════════════════════\n");

    // Tính lại balance tại thời điểm trước khi deposit
    const beforeDepositTime = new Date("2026-06-01T15:17:00.000Z"); // 22:17 +7
    
    let balanceBeforeDeposit = 0;
    for (const p of allPayments) {
      const completedAt = p.completedAt || p.createdAt;
      if (completedAt <= beforeDepositTime && p.status === "completed") {
        balanceBeforeDeposit += (p.amountUSD || 0);
      }
    }

    console.log(`📊 Wallet tại 22:17:00 (trước khi deposit): ${balanceBeforeDeposit.toFixed(2)} USD`);
    console.log(`📊 Wallet tại 22:17:15 (sau khi deposit): ${step5_afterDeposit.toFixed(2)} USD`);
    console.log(`📊 Số tiền được cộng thêm: +${(step5_afterDeposit - balanceBeforeDeposit).toFixed(2)} USD`);
    console.log(`📊 Expected: +5.16 USD`);

    if (Math.abs((step5_afterDeposit - balanceBeforeDeposit) - 5.16) > 0.01) {
      console.log(`\n⚠️  BUG! User được cộng ${(step5_afterDeposit - balanceBeforeDeposit).toFixed(2)} USD thay vì 5.16 USD!`);
      console.log(`   → Chênh lệch: ${(step5_afterDeposit - balanceBeforeDeposit - 5.16).toFixed(2)} USD`);
    } else {
      console.log(`\n✅ User được cộng đúng 5.16 USD`);
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

checkWalletBeforeDeduct();
