const mongoose = require("mongoose");

async function backfillOrderPayments() {
  try {
    console.log("🔄 Đang kết nối MongoDB Atlas...\n");

    // Kết nối với replicaSet
    const uri = `mongodb://nhandtps40210:dtn280705reseller@ac-0evdfk1-shard-00-00.bk91ctf.mongodb.net:27017,ac-0evdfk1-shard-00-01.bk91ctf.mongodb.net:27017,ac-0evdfk1-shard-00-02.bk91ctf.mongodb.net:27017/Reseller?ssl=true&authSource=admin&replicaSet=atlas-o6a3dd-shard-0&directConnection=false`;

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
    });

    // Require models
    require("../models/Payment");
    require("../models/Order");

    console.log("✅ Đã kết nối MongoDB\n");

    const db = mongoose.connection.db;
    const Payment = mongoose.model("Payment");

    // Lấy tất cả orders
    const orders = await db.collection("orders").find({}).toArray();

    console.log(`📦 Tổng orders: ${orders.length}\n`);

    // Lấy các order payments đã tồn tại
    const existingOrderPayments = await db.collection("payments")
      .find({ transferContent: { $regex: /^ORDER_/ } })
      .toArray();

    const existingOrderIds = new Set(existingOrderPayments.map(p => {
      const match = p.note?.match(/Order ID: ([a-f0-9]+)/);
      return match ? match[1] : null;
    }).filter(Boolean));

    console.log(`📋 Order payments đã tồn tại: ${existingOrderPayments.length}`);
    console.log(`📋 Orders cần tạo payment: ${orders.length - existingOrderIds.size}\n`);

    if (orders.length - existingOrderIds.size === 0) {
      console.log("✅ Không có orders nào cần tạo payment. Đã hoàn tất!");
      mongoose.disconnect();
      return;
    }

    // Tạo payment records cho các orders chưa có
    let created = 0;
    let skipped = 0;

    const batchSize = 100;
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      
      if (existingOrderIds.has(order._id.toString())) {
        skipped++;
        continue;
      }

      // Lấy thông tin product để có tên
      const product = await db.collection("products").findOne({ _id: order.productId });
      const productName = product?.name || order.productName || "Unknown";
      const price = order.price || 0;

      try {
        await Payment.create({
          sellerId: order.sellerId,
          amount: 0,
          amountUSD: -price,
          amountVND: 0,
          transferContent: `ORDER_BACKFILL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          bankAccountId: null,
          status: "completed",
          completedAt: order.purchasedAt || order.createdAt,
          expiresAt: order.purchasedAt || order.createdAt,
          note: `Purchase: ${productName} | Order ID: ${order._id}`
        });

        created++;
        if (created % 100 === 0) {
          console.log(`   Đã tạo: ${created} payments...`);
        }
      } catch (e) {
        console.log(`❌ Lỗi khi tạo payment cho order ${order._id}: ${e.message}`);
      }
    }

    console.log(`\n✅ HOÀN TẤT:`);
    console.log(`   Đã tạo: ${created} payments`);
    console.log(`   Đã bỏ qua: ${skipped} orders (đã có payment)`);

    mongoose.disconnect();

  } catch (error) {
    console.error("❌ Lỗi:", error.message);
  }
}

backfillOrderPayments();
