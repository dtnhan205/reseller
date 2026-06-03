const mongoose = require("mongoose");

async function checkOrders() {
  try {
    console.log("🔄 Đang kết nối MongoDB Atlas...\n");

    const uri = `mongodb://nhandtps40210:dtn280705reseller@ac-0evdfk1-shard-00-00.bk91ctf.mongodb.net:27017/Reseller?ssl=true&authSource=admin&directConnection=true`;

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20000,
    });

    console.log("✅ Đã kết nối MongoDB\n");

    const db = mongoose.connection.db;

    // 1. Tìm user
    const user = await db.collection("users").findOne({ email: "kennguyentv9x@gmail.com" });
    if (!user) {
      console.log("❌ Không tìm thấy user");
      return;
    }

    console.log(`=== USER: ${user.email} ===`);
    console.log(`Current wallet: ${user.walletBalance} USD\n`);

    // 2. Lấy orders của user
    const orders = await db.collection("orders")
      .find({ sellerId: user._id })
      .sort({ createdAt: -1 })
      .toArray();

    console.log(`=== LỊCH SỬ MUA HÀNG (${orders.length} orders) ===\n`);

    let totalSpent = 0;

    for (const o of orders) {
      const price = o.price || 0;
      totalSpent += price;

      const status = o.status || "unknown";
      const productName = o.productId ? "Product" : "Unknown";
      console.log(`[${status}] Price: ${price} USD | Created: ${o.createdAt}`);
      if (o.keys && o.keys.length > 0) {
        console.log(`   Keys: ${o.keys.length} key(s)`);
      }
    }

    console.log("\n=== TỔNG KẾT ===");
    console.log(`Tổng tiền đã nạp (từ payment): +680.93 USD`);
    console.log(`Tổng tiền đã trừ (admin): -71.90 USD`);
    console.log(`Tổng tiền đã mua (từ orders): -${totalSpent.toFixed(2)} USD`);
    console.log("─────────────────────────────");
    console.log(`Wallet theo tính toán: ${(680.93 - 71.90 - totalSpent).toFixed(2)} USD`);
    console.log(`Wallet thực tế: ${user.walletBalance.toFixed(2)} USD`);

  } catch (error) {
    console.error("❌ Lỗi:", error.message);
  } finally {
    try {
      await mongoose.disconnect();
      console.log("\n👋 Đã ngắt kết nối");
    } catch (e) { }
  }
}

checkOrders();
