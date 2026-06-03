const mongoose = require("mongoose");

async function checkAllSellers() {
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
      .sort({ walletBalance: -1 })
      .toArray();

    console.log("═══════════════════════════════════════════════════════════════════════════════════════════════");
    console.log("                              PHÂN TÍCH TẤT CẢ SELLERS");
    console.log("═══════════════════════════════════════════════════════════════════════════════════════════════\n");

    const results = [];

    for (const seller of sellers) {
      const sellerId = seller._id;
      const email = seller.email;

      // Lấy payments
      const payments = await db.collection("payments")
        .find({ sellerId, status: "completed" })
        .toArray();

      // Lấy orders
      const orders = await db.collection("orders")
        .find({ sellerId })
        .toArray();

      // Tính toán
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

      const totalOrdersCost = orders.reduce((sum, o) => sum + (o.price || 0), 0);

      // Tính expected wallet
      const expectedWallet = totalDeposits + totalAdminTopup + totalAdminDeduct;
      const actualWallet = seller.walletBalance || 0;
      const difference = actualWallet - expectedWallet;

      // Tính orders so với deposits
      const ordersVsDeposits = totalDeposits + totalAdminTopup - totalOrdersCost;

      results.push({
        email,
        actualWallet,
        totalDeposits,
        totalAdminTopup,
        totalAdminDeduct,
        totalOrdersCost,
        expectedWallet,
        difference,
        ordersVsDeposits,
        orderCount: orders.length,
        paymentCount: payments.length
      });
    }

    // Sắp xếp theo walletBalance giảm dần
    results.sort((a, b) => b.actualWallet - a.actualWallet);

    // Hiển thị
    console.log("📊 TOP 20 SELLERS THEO WALLET:\n");
    console.log("No  | Email                          | Wallet    | Deposits  | Admin+    | Admin-    | Orders    | Expected  | Diff");
    console.log("----|--------------------------------|-----------|-----------|-----------|-----------|-----------|-----------|--------");

    let count = 0;
    for (const r of results) {
      count++;
      if (count > 20) break;

      const emailShort = r.email.length > 30 ? r.email.substring(0, 27) + "..." : r.email;
      console.log(
        `${String(count).padStart(3)} | ${emailShort.padEnd(30)} | ${r.actualWallet.toFixed(2).padStart(9)} | ` +
        `${r.totalDeposits.toFixed(2).padStart(9)} | ${r.totalAdminTopup.toFixed(2).padStart(9)} | ` +
        `${r.totalAdminDeduct.toFixed(2).padStart(9)} | ${r.totalOrdersCost.toFixed(2).padStart(9)} | ` +
        `${r.expectedWallet.toFixed(2).padStart(9)} | ${r.difference.toFixed(2).padStart(9)}`
      );
    }

    // Tìm bất thường
    console.log("\n\n═══════════════════════════════════════════════════════════════════════════════════════════════");
    console.log("                              ⚠️  PHÁT HIỆN BẤT THƯỜNG");
    console.log("═══════════════════════════════════════════════════════════════════════════════════════════════\n");

    // 1. Wallet âm
    const negativeWallet = results.filter(r => r.actualWallet < 0);
    if (negativeWallet.length > 0) {
      console.log("❌ SELLERS CÓ WALLET ÂM:");
      for (const r of negativeWallet) {
        console.log(`   ${r.email}: ${r.actualWallet.toFixed(2)} USD`);
      }
      console.log("");
    }

    // 2. Expected khác actual nhiều
    const bigDiff = results.filter(r => Math.abs(r.difference) > 1);
    if (bigDiff.length > 0) {
      console.log("⚠️  SELLERS CÓ CHÊNH LỆCH LỚN (Expected ≠ Actual > 1 USD):");
      for (const r of bigDiff) {
        const diff = r.difference > 0 ? "+" : "";
        console.log(`   ${r.email}:`);
        console.log(`      Actual: ${r.actualWallet.toFixed(2)} | Expected: ${r.expectedWallet.toFixed(2)} | Diff: ${diff}${r.difference.toFixed(2)} USD`);
      }
      console.log("");
    }

    // 3. Mua nhiều hơn nạp (wallet bị âm theo logic)
    const spentMore = results.filter(r => r.ordersVsDeposits < -0.01);
    if (spentMore.length > 0) {
      console.log("⚠️  SELLERS MUA NHIỀU HƠN NẠP (Orders > Deposits + AdminTopup):");
      for (const r of spentMore) {
        console.log(`   ${r.email}:`);
        console.log(`      Nạp: ${r.totalDeposits.toFixed(2)} + Admin: ${r.totalAdminTopup.toFixed(2)} = ${(r.totalDeposits + r.totalAdminTopup).toFixed(2)} USD`);
        console.log(`      Orders: ${r.totalOrdersCost.toFixed(2)} USD`);
        console.log(`      Thiếu: ${Math.abs(r.ordersVsDeposits).toFixed(2)} USD`);
      }
      console.log("");
    }

    // 4. Admin topup nhiều bất thường
    const highAdminTopup = results.filter(r => r.totalAdminTopup > 100);
    if (highAdminTopup.length > 0) {
      console.log("⚠️  SELLERS CÓ ADMIN TOPUP NHIỀU (> 100 USD):");
      for (const r of highAdminTopup) {
        console.log(`   ${r.email}: ${r.totalAdminTopup.toFixed(2)} USD`);
      }
      console.log("");
    }

    // 5. Không nạp tiền mà có wallet
    const noDepositButHasWallet = results.filter(r => r.totalDeposits === 0 && r.actualWallet > 0);
    if (noDepositButHasWallet.length > 0) {
      console.log("⚠️  SELLERS KHÔNG NẠP TIỀN MÀ CÓ WALLET (> 0):");
      for (const r of noDepositButHasWallet) {
        console.log(`   ${r.email}: ${r.actualWallet.toFixed(2)} USD (Admin topup: ${r.totalAdminTopup.toFixed(2)})`);
      }
      console.log("");
    }

    // Tổng kết
    console.log("\n═══════════════════════════════════════════════════════════════════════════════════════════════");
    console.log("                              📊 TỔNG KẾT");
    console.log("═══════════════════════════════════════════════════════════════════════════════════════════════\n");

    const totalWallets = results.reduce((sum, r) => sum + r.actualWallet, 0);
    const totalDeposits = results.reduce((sum, r) => sum + r.totalDeposits, 0);
    const totalAdminTopup = results.reduce((sum, r) => sum + r.totalAdminTopup, 0);
    const totalAdminDeduct = results.reduce((sum, r) => sum + r.totalAdminDeduct, 0);
    const totalOrders = results.reduce((sum, r) => sum + r.totalOrdersCost, 0);

    console.log(`👥 Tổng sellers: ${results.length}`);
    console.log(`💰 Tổng wallet: ${totalWallets.toFixed(2)} USD`);
    console.log(`📥 Tổng deposits: ${totalDeposits.toFixed(2)} USD`);
    console.log(`📤 Tổng admin topup: ${totalAdminTopup.toFixed(2)} USD`);
    console.log(`📤 Tổng admin deduct: ${totalAdminDeduct.toFixed(2)} USD`);
    console.log(`🛒 Tổng orders: ${totalOrders.toFixed(2)} USD`);

  } catch (error) {
    console.error("❌ Lỗi:", error.message);
  } finally {
    try {
      await mongoose.disconnect();
      console.log("\n👋 Đã ngắt kết nối MongoDB");
    } catch (e) { }
  }
}

checkAllSellers();
