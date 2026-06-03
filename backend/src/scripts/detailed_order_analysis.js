const mongoose = require("mongoose");

async function detailedOrderAnalysis() {
  try {
    console.log("🔄 Đang kết nối MongoDB Atlas...\n");

    const uri = `mongodb://nhandtps40210:dtn280705reseller@ac-0evdfk1-shard-00-00.bk91ctf.mongodb.net:27017/Reseller?ssl=true&authSource=admin&directConnection=true`;

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20000,
    });

    console.log("✅ Đã kết nối MongoDB\n");

    const db = mongoose.connection.db;

    // Lấy tất cả sellers
    const sellers = await db.collection("users")
      .find({ role: "seller" })
      .toArray();

    console.log("═══════════════════════════════════════════════════════════════════════════════════════════════");
    console.log("                              PHÂN TÍCH CHI TIẾT: ORDERS vs WALLET DEDUCTION");
    console.log("═══════════════════════════════════════════════════════════════════════════════════════════════\n");

    // Lấy 1 seller có vấn đề để phân tích chi tiết
    const problemSeller = await db.collection("users")
      .findOne({ email: "loduy1817@gmail.com" });

    if (problemSeller) {
      console.log(`👤 PHÂN TÍCH CHI TIẾT: loduy1817@gmail.com\n`);
      console.log(`   Wallet hiện tại: ${problemSeller.walletBalance.toFixed(2)} USD\n`);

      // Lấy orders
      const orders = await db.collection("orders")
        .find({ sellerId: problemSeller._id })
        .sort({ createdAt: 1 })
        .toArray();

      // Lấy payments
      const payments = await db.collection("payments")
        .find({ sellerId: problemSeller._id, status: "completed" })
        .sort({ completedAt: 1 })
        .toArray();

      console.log(`📦 Số orders: ${orders.length}`);
      console.log(`📥 Số payments: ${payments.length}`);

      // Tính tổng
      const totalOrders = orders.reduce((sum, o) => sum + (o.price || 0), 0);
      let totalDeposits = 0;
      let totalAdminTopup = 0;
      let totalAdminDeduct = 0;

      for (const p of payments) {
        const usd = p.amountUSD || 0;
        if (usd > 0) {
          if (p.transferContent.includes("ADMIN_TOPUP")) {
            totalAdminTopup += usd;
          } else {
            totalDeposits += usd;
          }
        } else if (usd < 0) {
          totalAdminDeduct += usd;
        }
      }

      console.log(`\n📊 TỔNG QUAN:`);
      console.log(`   Orders: ${totalOrders.toFixed(2)} USD`);
      console.log(`   Deposits: ${totalDeposits.toFixed(2)} USD`);
      console.log(`   Admin Topup: ${totalAdminTopup.toFixed(2)} USD`);
      console.log(`   Admin Deduct: ${totalAdminDeduct.toFixed(2)} USD`);
      console.log(`   Wallet hiện tại: ${problemSeller.walletBalance.toFixed(2)} USD\n`);

      console.log(`📐 TÍNH TOÁN:`);
      console.log(`   Expected = Deposits + AdminTopup + AdminDeduct - Orders`);
      console.log(`   Expected = ${totalDeposits.toFixed(2)} + ${totalAdminTopup.toFixed(2)} + (${totalAdminDeduct.toFixed(2)}) - ${totalOrders.toFixed(2)}`);
      const expected = totalDeposits + totalAdminTopup + totalAdminDeduct - totalOrders;
      console.log(`   Expected = ${expected.toFixed(2)} USD`);
      console.log(`   Actual = ${problemSeller.walletBalance.toFixed(2)} USD`);
      console.log(`   Diff = ${(problemSeller.walletBalance - expected).toFixed(2)} USD\n`);

      // Tìm xem có orders nào được tạo mà không có payment deduction tương ứng
      console.log(`📋 10 ORDERS ĐẦU TIÊN:`);
      for (let i = 0; i < Math.min(10, orders.length); i++) {
        const o = orders[i];
        const product = await db.collection("products").findOne({ _id: o.productId });
        console.log(`   [${new Date(o.createdAt).toLocaleString("vi-VN")}] Order: ${o.price.toFixed(2)} USD | Product: ${product?.name || "?"}`);
      }
    }

    // Kiểm tra xem có payment loại nào khác không phải bank/admin deduct/topup không
    console.log("\n\n═══════════════════════════════════════════════════════════════════════════════════════════════");
    console.log("                              KIỂM TRA: CÓ LOẠI PAYMENT NÀO KHÁC?");
    console.log("═══════════════════════════════════════════════════════════════════════════════════════════════\n");

    // Lấy tất cả payments và phân loại
    const allPayments = await db.collection("payments").find({}).toArray();
    const paymentTypes = {};

    for (const p of allPayments) {
      const type = p.transferContent?.split("_")[0] || "unknown";
      if (!paymentTypes[type]) paymentTypes[type] = 0;
      paymentTypes[type]++;
    }

    console.log("📋 CÁC LOẠI PAYMENT:");
    for (const [type, count] of Object.entries(paymentTypes)) {
      console.log(`   ${type}: ${count} payments`);
    }

    // Kiểm tra xem có orders nào có order deduction payment không
    const deductionPayments = await db.collection("payments")
      .find({ 
        transferContent: { $not: /^(dtn|ADMIN)/ } 
      })
      .toArray();

    console.log(`\n📋 PAYMENTS KHÔNG PHẢI dtn HOẶC ADMIN (${deductionPayments.length}):`);
    for (const p of deductionPayments.slice(0, 10)) {
      const usd = p.amountUSD || 0;
      const type = usd > 0 ? "NẠP" : "TRỪ";
      console.log(`   [${type}] ${usd.toFixed(2)} USD | ${p.transferContent}`);
    }

    mongoose.disconnect();

  } catch (error) {
    console.error("❌ Lỗi:", error.message);
  }
}

detailedOrderAnalysis();
