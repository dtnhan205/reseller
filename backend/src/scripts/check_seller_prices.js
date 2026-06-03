const mongoose = require("mongoose");

async function checkSellerPrices() {
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

    console.log(`👤 USER: ${user.email}\n`);

    // Lấy SellerProductPrices của user này
    const sellerPrices = await db.collection("sellerproductprices")
      .find({ sellerId: user._id })
      .toArray();

    // Lấy product IDs để lookup
    const productIds = sellerPrices.map(sp => sp.productId);
    const products = await db.collection("products")
      .find({ _id: { $in: productIds } })
      .toArray();
    
    const productMap = {};
    for (const p of products) {
      productMap[p._id.toString()] = p;
    }

    console.log("═══════════════════════════════════════════════════════════════");
    console.log("SELLER PRODUCT PRICES (Giá riêng của user này)");
    console.log("═══════════════════════════════════════════════════════════════\n");

    if (sellerPrices.length === 0) {
      console.log("❌ User không có giá riêng nào!\n");
    } else {
      console.log(`📋 Có ${sellerPrices.length} giá riêng:\n`);
      
      for (const sp of sellerPrices) {
        const product = productMap[sp.productId.toString()];
        console.log(`   Product: ${product?.name || sp.productId}`);
        console.log(`   Giá gốc: ${product?.price || "?"} USD`);
        console.log(`   Giá riêng: ${sp.price} USD`);
        if (product?.price) {
          const diff = sp.price - product.price;
          const pct = (diff / product.price * 100).toFixed(0);
          console.log(`   Chênh lệch: ${diff > 0 ? "+" : ""}${diff} USD (${diff > 0 ? "+" : ""}${pct}%)`);
        }
        console.log("");
      }
    }

    // Lấy orders và kiểm tra giá
    const orders = await db.collection("orders")
      .find({ sellerId: user._id })
      .toArray();

    console.log("\n═══════════════════════════════════════════════════════════════");
    console.log("TÍNH TOÁN LẠI VỚI SELLER PRICES");
    console.log("═══════════════════════════════════════════════════════════════\n");

    // Tạo map productId -> sellerPrice
    const sellerPriceMap = {};
    for (const sp of sellerPrices) {
      sellerPriceMap[sp.productId._id.toString()] = sp.price;
    }

    // Tính tổng theo giá gốc và giá riêng
    let totalOrderPrice = 0;
    let totalOriginalPrice = 0;
    let ordersWithSellerPrice = 0;

    for (const o of orders) {
      const orderPrice = o.price || 0;
      totalOrderPrice += orderPrice;

      // Lấy product price gốc
      const product = await db.collection("products").findOne({ _id: o.productId });
      const originalPrice = product?.price || 0;
      totalOriginalPrice += originalPrice;

      // Kiểm tra xem order này có dùng seller price không
      if (sellerPriceMap[o.productId.toString()] && 
          sellerPriceMap[o.productId.toString()] !== originalPrice) {
        ordersWithSellerPrice++;
      }
    }

    console.log(`📊 TỔNG GIÁ Orders (theo order.price): ${totalOrderPrice.toFixed(2)} USD`);
    console.log(`📊 TỔNG GIÁ Orders (theo product.price gốc): ${totalOriginalPrice.toFixed(2)} USD`);
    console.log(`📊 Số orders có seller price: ${ordersWithSellerPrice}\n`);

    // Tính lại expected wallet
    const payments = await db.collection("payments")
      .find({ sellerId: user._id, status: "completed" })
      .toArray();

    let totalDeposits = 0;
    let totalAdminDeduct = 0;
    for (const p of payments) {
      const usd = p.amountUSD || 0;
      if (usd > 0) totalDeposits += usd;
      else totalAdminDeduct += usd;
    }

    console.log(`💰 Tổng nạp: ${totalDeposits.toFixed(2)} USD`);
    console.log(`💰 Tổng admin trừ: ${totalAdminDeduct.toFixed(2)} USD`);
    console.log(`💰 Tổng orders (theo order.price): ${totalOrderPrice.toFixed(2)} USD`);
    console.log(`💰 Tổng orders (theo product.price): ${totalOriginalPrice.toFixed(2)} USD\n`);

    // Tính expected wallet
    const expectedWithOrderPrice = totalDeposits + totalAdminDeduct - totalOrderPrice;
    const expectedWithOriginalPrice = totalDeposits + totalAdminDeduct - totalOriginalPrice;

    console.log("📐 EXPECTED WALLET:");
    console.log(`   Với order.price: ${totalDeposits} + (${totalAdminDeduct}) - ${totalOrderPrice} = ${expectedWithOrderPrice.toFixed(2)} USD`);
    console.log(`   Với product.price: ${totalDeposits} + (${totalAdminDeduct}) - ${totalOriginalPrice} = ${expectedWithOriginalPrice.toFixed(2)} USD`);
    console.log(`   Thực tế: ${user.walletBalance.toFixed(2)} USD\n`);

    // Tìm orders có giá cao hơn product price
    console.log("\n═══════════════════════════════════════════════════════════════");
    console.log("ORDERS CÓ GIÁ CAO HƠN PRODUCT PRICE:");
    console.log("═══════════════════════════════════════════════════════════════\n");

    let highPriceOrders = [];
    for (const o of orders) {
      const product = await db.collection("products").findOne({ _id: o.productId });
      if (product && o.price > product.price) {
        highPriceOrders.push({
          orderId: o._id,
          productName: product.name,
          orderPrice: o.price,
          productPrice: product.price,
          diff: o.price - product.price
        });
      }
    }

    if (highPriceOrders.length > 0) {
      console.log(`⚠️  Có ${highPriceOrders.length} orders có giá CAO HƠN product price:\n`);
      
      let totalDiff = 0;
      for (const h of highPriceOrders) {
        console.log(`   ${h.productName}: Order ${h.orderPrice} vs Product ${h.productPrice} (+${h.diff.toFixed(2)})`);
        totalDiff += h.diff;
      }
      
      console.log(`\n📊 Tổng chênh lệch: +${totalDiff.toFixed(2)} USD`);
      console.log(`\n→ User đã TRẢ NHIỀU HƠN ${totalDiff.toFixed(2)} USD so với giá gốc!`);
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

checkSellerPrices();
