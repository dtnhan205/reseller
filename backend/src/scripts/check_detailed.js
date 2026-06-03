const mongoose = require("mongoose");

async function checkDetailedTransactions() {
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
    console.log(`💰 Current Wallet: ${user.walletBalance} USD\n`);

    // Tìm payment 129k (dtn306178)
    const payment129k = await db.collection("payments").findOne({ transferContent: "dtn306178" });
    if (payment129k) {
      console.log("═══════════════════════════════════════════════════════════════");
      console.log("PAYMENT 129K (dtn306178):");
      console.log("═══════════════════════════════════════════════════════════════");
      console.log(`   Amount USD: ${payment129k.amountUSD}`);
      console.log(`   Amount VND: ${payment129k.amountVND}`);
      console.log(`   Status: ${payment129k.status}`);
      console.log(`   Created: ${payment129k.createdAt}`);
      console.log(`   Completed: ${payment129k.completedAt}`);
      console.log("");
    }

    // Lấy payments gần thời điểm payment 129k (22:16-22:25)
    const startTime = new Date("2026-06-01T15:10:00.000Z"); // 22:10 UTC = 22:10 +7
    const endTime = new Date("2026-06-01T15:30:00.000Z");   // 22:30 UTC = 22:30 +7

    const paymentsNearTime = await db.collection("payments")
      .find({ 
        sellerId: user._id,
        completedAt: { $gte: startTime, $lte: endTime }
      })
      .sort({ completedAt: 1 })
      .toArray();

    console.log("═══════════════════════════════════════════════════════════════");
    console.log("PAYMENTS GẦN THỜI ĐIỂM 22:16-22:30 (22:10-22:30 UTC):");
    console.log("═══════════════════════════════════════════════════════════════\n");

    for (const p of paymentsNearTime) {
      const time = new Date(p.completedAt || p.createdAt).toLocaleString("vi-VN");
      const usd = p.amountUSD || 0;
      const type = usd > 0 ? "➕ NẠP" : "➖ TRỪ";
      console.log(`[${time}] ${type} ${usd.toFixed(2)} USD | ${p.transferContent}`);
    }

    // Lấy orders gần thời điểm đó
    const ordersNearTime = await db.collection("orders")
      .find({ 
        sellerId: user._id,
        createdAt: { $gte: startTime, $lte: endTime }
      })
      .sort({ createdAt: 1 })
      .toArray();

    console.log("\n═══════════════════════════════════════════════════════════════");
    console.log("ORDERS GẦN THỜI ĐIỂM 22:16-22:30:");
    console.log("═══════════════════════════════════════════════════════════════\n");

    for (const o of ordersNearTime) {
      const time = new Date(o.createdAt).toLocaleString("vi-VN");
      console.log(`[${time}] Mua: ${o.price} USD | Product: ${o.productName || o.productId}`);
    }

    // Lấy user wallet history gần đó (so sánh)
    // Tìm user ở các thời điểm khác nhau
    console.log("\n═══════════════════════════════════════════════════════════════");
    console.log("KIỂM TRA: CÓ THỂ CÓ NGUỒN TIỀN KHÁC KHÔNG?");
    console.log("═══════════════════════════════════════════════════════════════\n");

    // Lấy payment gần nhất trước payment 129k
    const paymentBefore = await db.collection("payments")
      .find({ 
        sellerId: user._id,
        completedAt: { $lt: payment129k.completedAt },
        status: "completed"
      })
      .sort({ completedAt: -1 })
      .limit(1)
      .toArray();

    if (paymentBefore.length > 0) {
      console.log(`Payment trước đó: ${paymentBefore[0].amountUSD} USD | ${paymentBefore[0].transferContent}`);
      console.log(`Thời gian: ${paymentBefore[0].completedAt}`);
    }

    // Lấy wallet balance trước payment 129k
    // (Tính toán lại từ tất cả payments trước payment 129k)
    const paymentsBefore129k = await db.collection("payments")
      .find({ 
        sellerId: user._id,
        completedAt: { $lt: payment129k.completedAt },
        status: "completed"
      })
      .toArray();

    let balanceBefore129k = 0;
    for (const p of paymentsBefore129k) {
      balanceBefore129k += (p.amountUSD || 0);
    }

    console.log(`\n📊 Wallet TRƯỚC KHI nạp 129k: ${balanceBefore129k.toFixed(2)} USD`);
    console.log(`📊 Nạp thêm: +${payment129k.amountUSD} USD`);
    console.log(`📊 Wallet SAU KHI nạp 129k: ${(balanceBefore129k + payment129k.amountUSD).toFixed(2)} USD`);
    
    // Nhưng nếu có ADMIN TRỪ giữa 2 payments?
    const adminDeductsBetween = paymentsNearTime.filter(p => 
      (p.amountUSD || 0) < 0 && p.transferContent.includes("ADMIN")
    );
    
    if (adminDeductsBetween.length > 0) {
      console.log(`\n⚠️  CÓ ADMIN TRỪ TRONG KHOẢNG THỜI GIAN NÀY!`);
      for (const p of adminDeductsBetween) {
        console.log(`   - ${p.amountUSD} USD | ${p.completedAt}`);
      }
    }

    // Tính toán chính xác
    const paymentsBefore = await db.collection("payments")
      .find({ 
        sellerId: user._id,
        completedAt: { $lte: payment129k.completedAt },
        status: "completed"
      })
      .toArray();

    let exactBalanceBefore = 0;
    for (const p of paymentsBefore) {
      exactBalanceBefore += (p.amountUSD || 0);
    }

    console.log(`\n📊 TÍNH TOÁN CHÍNH XÁC:`);
    console.log(`   Wallet trước payment 129k: ${exactBalanceBefore.toFixed(2)} USD`);
    console.log(`   Payment 129k: +${payment129k.amountUSD} USD`);
    console.log(`   = ${(exactBalanceBefore + payment129k.amountUSD).toFixed(2)} USD`);
    console.log(`\n💡 Nếu wallet tăng NHIỀU HƠN ${payment129k.amountUSD} USD → CÓ BUG!`);

  } catch (error) {
    console.error("❌ Lỗi:", error.message);
  } finally {
    try {
      await mongoose.disconnect();
      console.log("\n👋 Đã ngắt kết nối MongoDB");
    } catch (e) { }
  }
}

checkDetailedTransactions();
