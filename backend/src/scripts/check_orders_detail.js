const mongoose = require("mongoose");

async function checkOrdersDetail() {
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

    // Lấy orders
    const orders = await db.collection("orders")
      .find({ sellerId: user._id })
      .sort({ createdAt: 1 })
      .toArray();

    // Lấy payments
    const payments = await db.collection("payments")
      .find({ sellerId: user._id, status: "completed" })
      .sort({ completedAt: 1 })
      .toArray();

    console.log("═══════════════════════════════════════════════════════════════");
    console.log("PHÂN TÍCH SÂU: WALLET vs ORDERS vs PAYMENTS");
    console.log("═══════════════════════════════════════════════════════════════\n");

    // Tính tổng
    let totalOrders = 0;
    let totalDeposits = 0;
    let totalAdminDeduct = 0;

    for (const o of orders) {
      totalOrders += (o.price || 0);
    }

    for (const p of payments) {
      const usd = p.amountUSD || 0;
      if (usd > 0) totalDeposits += usd;
      else totalAdminDeduct += usd;
    }

    console.log("📊 TỔNG QUAN:");
    console.log(`   Total Orders Cost: ${totalOrders.toFixed(2)} USD (${orders.length} orders)`);
    console.log(`   Total Deposits: ${totalDeposits.toFixed(2)} USD`);
    console.log(`   Total Admin Deducts: ${totalAdminDeduct.toFixed(2)} USD`);
    console.log(`   Current Wallet: ${user.walletBalance.toFixed(2)} USD\n`);

    // Tính số dư cuối cùng theo lý thuyết
    const expectedWallet = totalDeposits + totalAdminDeduct - totalOrders;
    console.log("📐 TÍNH TOÁN:");
    console.log(`   Expected Wallet = Deposits + AdminDeduct - Orders`);
    console.log(`   Expected Wallet = ${totalDeposits.toFixed(2)} + ${totalAdminDeduct.toFixed(2)} - ${totalOrders.toFixed(2)}`);
    console.log(`   Expected Wallet = ${expectedWallet.toFixed(2)} USD`);
    console.log(`   Actual Wallet = ${user.walletBalance.toFixed(2)} USD`);
    console.log(`   Difference = ${(user.walletBalance - expectedWallet).toFixed(2)} USD\n`);

    // KIỂM TRA: Nếu orders KHÔNG trừ wallet thì sao?
    const ifOrdersNotDeducted = totalDeposits + totalAdminDeduct;
    console.log("🔍 GIẢ THUYẾT 1: Orders không trừ wallet");
    console.log(`   Wallet sẽ = Deposits + AdminDeduct = ${ifOrdersNotDeducted.toFixed(2)} USD`);
    console.log(`   Thực tế = ${user.walletBalance.toFixed(2)} USD`);
    console.log(`   Chênh lệch = ${(user.walletBalance - ifOrdersNotDeducted).toFixed(2)} USD\n`);

    // KIỂM TRA: Nếu orders trừ 1 phần thì sao?
    // Giả sử orders trừ X%, tính X
    const deductedRatio = (totalDeposits + totalAdminDeduct - user.walletBalance) / totalOrders * 100;
    console.log("🔍 GIẢ THUYẾT 2: Orders trừ ${deductedRatio.toFixed(1)}% giá trị");
    console.log(`   (${(totalDeposits + totalAdminDeduct - user.walletBalance).toFixed(2)} / ${totalOrders.toFixed(2)}) * 100 = ${deductedRatio.toFixed(1)}%\n`);

    // Kiểm tra orders đầu tiên - xem price có đúng không
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("CHI TIẾT 10 ORDERS ĐẦU TIÊN:");
    console.log("═══════════════════════════════════════════════════════════════\n");

    for (let i = 0; i < Math.min(10, orders.length); i++) {
      const o = orders[i];
      const product = await db.collection("products").findOne({ _id: o.productId });
      
      console.log(`Order ${i + 1}:`);
      console.log(`   ID: ${o._id}`);
      console.log(`   Product: ${product?.name || "Unknown"}`);
      console.log(`   Order Price: ${o.price} USD`);
      console.log(`   Product Price: ${product?.price || "Unknown"} USD`);
      console.log(`   Created: ${o.createdAt}`);
      
      if (product && o.price !== product.price) {
        console.log(`   ⚠️  GIÁ KHÁC NHAU!`);
      }
      console.log("");
    }

    // Kiểm tra orders gần đây
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("CHI TIẾT 10 ORDERS GẦN NHẤT:");
    console.log("═══════════════════════════════════════════════════════════════\n");

    for (let i = Math.max(0, orders.length - 10); i < orders.length; i++) {
      const o = orders[i];
      const product = await db.collection("products").findOne({ _id: o.productId });
      
      console.log(`Order ${i + 1}:`);
      console.log(`   ID: ${o._id}`);
      console.log(`   Product: ${product?.name || "Unknown"}`);
      console.log(`   Order Price: ${o.price} USD`);
      console.log(`   Product Price: ${product?.price || "Unknown"} USD`);
      console.log(`   Created: ${o.createdAt}`);
      
      if (product && o.price !== product.price) {
        console.log(`   ⚠️  GIÁ KHÁC NHAU!`);
      }
      console.log("");
    }

    // Kiểm tra tất cả orders có giá khác với product price không
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("TÌM ORDERS CÓ GIÁ KHÁC VỚI PRODUCT PRICE:");
    console.log("═══════════════════════════════════════════════════════════════\n");

    let mismatchedOrders = 0;
    let totalMismatchedDiff = 0;

    for (const o of orders) {
      const product = await db.collection("products").findOne({ _id: o.productId });
      if (product && o.price !== product.price) {
        mismatchedOrders++;
        const diff = (o.price || 0) - (product.price || 0);
        totalMismatchedDiff += diff;
        if (mismatchedOrders <= 5) {
          console.log(`   ⚠️  Order ${o._id}: Price ${o.price} vs Product ${product.price} (diff: ${diff.toFixed(2)})`);
        }
      }
    }

    console.log(`\n📊 Tổng orders có giá khác: ${mismatchedOrders}`);
    console.log(`📊 Tổng chênh lệch giá: ${totalMismatchedDiff.toFixed(2)} USD`);

  } catch (error) {
    console.error("❌ Lỗi:", error.message);
  } finally {
    try {
      await mongoose.disconnect();
      console.log("\n👋 Đã ngắt kết nối MongoDB");
    } catch (e) { }
  }
}

checkOrdersDetail();
