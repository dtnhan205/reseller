const mongoose = require("mongoose");

async function checkRaceCondition() {
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
    console.log(`💰 Current Wallet (hiện tại): ${user.walletBalance} USD\n`);

    // Lấy payments gần thời điểm 22:05 - 22:25
    const startTime = new Date("2026-06-01T15:00:00.000Z"); // 22:00 +7
    const endTime = new Date("2026-06-01T15:30:00.000Z");   // 22:30 +7

    const paymentsNearTime = await db.collection("payments")
      .find({ 
        sellerId: user._id,
        completedAt: { $gte: startTime, $lte: endTime }
      })
      .sort({ completedAt: 1 })
      .toArray();

    console.log("═══════════════════════════════════════════════════════════════");
    console.log("KIỂM TRA: RACE CONDITION HAY LOGIC BUG?");
    console.log("═══════════════════════════════════════════════════════════════\n");

    // Kiểm tra thứ tự thời gian
    console.log("📋 TẤT CẢ PAYMENTS TRONG KHOẢNG 22:00-22:30:\n");
    
    for (const p of paymentsNearTime) {
      const time = new Date(p.completedAt || p.createdAt);
      const timeStr = time.toLocaleTimeString("vi-VN", { 
        hour: "2-digit", minute: "2-digit", second: "2-digit" 
      });
      const dateStr = time.toLocaleDateString("vi-VN", { 
        day: "2-digit", month: "2-digit" 
      });
      const usd = p.amountUSD || 0;
      const type = usd > 0 ? "📥 NẠP" : "📤 TRỪ ";
      
      console.log(`[${timeStr} ${dateStr}] ${type} ${usd.toFixed(2).padStart(8)} USD`);
      console.log(`   Content: ${p.transferContent}`);
      console.log(`   Status: ${p.status}`);
      console.log("");
    }

    // Tính balance chính xác tại mỗi thời điểm
    console.log("\n═══════════════════════════════════════════════════════════════");
    console.log("TÍNH LẠI BALANCE TẠI MỖI THỜI ĐIỂM:");
    console.log("═══════════════════════════════════════════════════════════════\n");

    // Lấy tất cả payments trước thời điểm bắt đầu (22:00)
    const allPayments = await db.collection("payments")
      .find({ 
        sellerId: user._id,
        status: "completed"
      })
      .sort({ completedAt: 1 })
      .toArray();

    // Tính balance trước 22:00
    let balanceBefore2200 = 0;
    for (const p of allPayments) {
      const completedAt = p.completedAt || p.createdAt;
      if (completedAt < startTime) {
        balanceBefore2200 += (p.amountUSD || 0);
      }
    }

    console.log(`💰 Balance TRƯỚC 22:00 (từ lịch sử): ${balanceBefore2200.toFixed(2)} USD\n`);

    // Tính balance tại mỗi thời điểm
    let runningBalance = balanceBefore2200;
    console.log("Thời gian          | Type  | Amount    | Balance");
    console.log("-------------------|-------|-----------|------------");

    for (const p of paymentsNearTime) {
      const time = new Date(p.completedAt || p.createdAt);
      const timeStr = time.toLocaleTimeString("vi-VN", { 
        hour: "2-digit", minute: "2-digit", second: "2-digit" 
      });
      const usd = p.amountUSD || 0;
      const type = usd > 0 ? "NẠP " : "TRỪ ";
      
      if (p.status === "completed") {
        runningBalance += usd;
      }
      
      console.log(`${timeStr} | ${type} | ${usd.toFixed(2).padStart(8)} | ${runningBalance.toFixed(2)}`);
    }

    console.log("\n═══════════════════════════════════════════════════════════════");
    console.log("⚠️  KIỂM TRA: TRỪ 50 USD TỪ 11.20 USD - CÓ HỢP LỆ?");
    console.log("═══════════════════════════════════════════════════════════════\n");

    // Tính balance tại 22:05:27 (trước khi trừ 50)
    let balanceAt2205 = balanceBefore2200;
    for (const p of paymentsNearTime) {
      const time = new Date(p.completedAt || p.createdAt);
      if (time < new Date("2026-06-01T15:05:30.000Z")) { // 22:05:30 +7
        if (p.status === "completed") {
          balanceAt2205 += (p.amountUSD || 0);
        }
      } else {
        break;
      }
    }

    console.log(`💰 Balance tại 22:05 (trước khi trừ 50): ${balanceAt2205.toFixed(2)} USD`);
    console.log(`💰 Admin muốn trừ: 50.00 USD`);
    console.log("");

    if (balanceAt2205 >= 50) {
      console.log("✅ Balance đủ (>50) → Có thể trừ hợp lệ");
    } else {
      console.log(`❌ Balance KHÔNG đủ (${balanceAt2205.toFixed(2)} < 50) → KHÔNG nên trừ được!`);
      console.log("   → CÓ BUG! Kiểm tra balance KHÔNG hoạt động đúng!");
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

checkRaceCondition();
