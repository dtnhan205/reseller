const mongoose = require("mongoose");

async function checkOrdersVsWallet() {
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

    // Lấy tất cả orders
    const orders = await db.collection("orders")
      .find({ sellerId: user._id })
      .sort({ createdAt: 1 })
      .toArray();

    // Lấy tất cả payments
    const payments = await db.collection("payments")
      .find({ sellerId: user._id })
      .sort({ createdAt: 1 })
      .toArray();

    // ═══════════════════════════════════════════════════════════════════
    // PHÂN TÍCH: So sánh thứ tự thời gian
    // ═══════════════════════════════════════════════════════════════════
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("PHÂN TÍCH THỨ TỰ: ORDERS vs PAYMENTS vs WALLET");
    console.log("═══════════════════════════════════════════════════════════════\n");

    // Timeline của tất cả giao dịch
    const timeline = [];

    for (const p of payments) {
      const usd = p.amountUSD || 0;
      if (p.status === "completed") {
        timeline.push({
          date: p.completedAt || p.createdAt,
          type: usd > 0 ? "DEPOSIT" : (usd < 0 ? "DEDUCT" : "OTHER"),
          amount: usd,
          description: p.transferContent.includes("ADMIN") ? `Admin: ${p.note || "action"}` : "Bank deposit",
          source: "Payment"
        });
      }
    }

    for (const o of orders) {
      const price = o.price || 0;
      timeline.push({
        date: o.createdAt,
        type: "PURCHASE",
        amount: -price,
        description: `Order: ${o._id}`,
        source: "Order"
      });
    }

    // Sort theo thời gian
    timeline.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Mô phỏng ví để tìm sai sót
    console.log("📋 MÔ PHỎNG VÍ (từng giao dịch):\n");

    let simulatedWallet = 0;
    let lastChecked = null;
    let mismatches = [];

    for (const t of timeline) {
      const oldWallet = simulatedWallet;
      simulatedWallet += t.amount;

      // Kiểm tra xem có sai sót không
      // (chúng ta không thể so sánh trực tiếp vì wallet bị ảnh hưởng bởi tất cả transactions)
      
      // Nhưng có thể kiểm tra: orders có trừ wallet thực sự không?
      // Bằng cách kiểm tra xem có payment nào bù trừ cho orders không
    }

    // ═══════════════════════════════════════════════════════════════════
    // KIỂM TRA: Orders có thực sự trừ wallet không?
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n═══════════════════════════════════════════════════════════════");
    console.log("KIỂM TRA: ORDERS CÓ TRỪ WALLET KHÔNG?");
    console.log("═══════════════════════════════════════════════════════════════\n");

    // Lấy order gần nhất
    const recentOrders = orders.slice(-10);
    console.log("📦 10 ĐƠN HÀNG GẦN NHẤT:\n");

    for (const o of recentOrders) {
      console.log(`   [${o.createdAt}] Order: ${o.price} USD | Keys: ${o.keys?.length || 0}`);
    }

    // Kiểm tra xem có payment nào trừ tiền mà không phải admin deduct không
    console.log("\n\n📋 CÁC PAYMENTS TRỪ TIỀN (không phải admin):");
    const nonAdminDeducts = payments.filter(p => 
      p.status === "completed" && 
      (p.amountUSD || 0) < 0 && 
      !p.transferContent.includes("ADMIN")
    );

    if (nonAdminDeducts.length > 0) {
      for (const p of nonAdminDeducts) {
        console.log(`   - ${p.amountUSD} USD | ${p.transferContent}`);
      }
    } else {
      console.log("   ✅ Không có payments trừ tiền ngoài admin.");
    }

    // ═══════════════════════════════════════════════════════════════════
    // TÍNH TOÁN: Nếu orders KHÔNG trừ wallet thì sao?
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n\n═══════════════════════════════════════════════════════════════");
    console.log("GIẢ THUYẾT: NẾU ORDERS KHÔNG TRỪ WALLET");
    console.log("═══════════════════════════════════════════════════════════════\n");

    const totalDeposits = payments
      .filter(p => p.status === "completed" && (p.amountUSD || 0) > 0)
      .reduce((sum, p) => sum + (p.amountUSD || 0), 0);

    const totalAdminDeducts = payments
      .filter(p => p.status === "completed" && (p.amountUSD || 0) < 0)
      .reduce((sum, p) => sum + (p.amountUSD || 0), 0);

    const totalOrdersCost = orders.reduce((sum, o) => sum + (o.price || 0), 0);

    console.log("📊 NẾU ORDERS KHÔNG TRỪ WALLET:");
    console.log(`   Wallet = Nạp tiền + Admin trừ`);
    console.log(`   Wallet = ${totalDeposits.toFixed(2)} + ${totalAdminDeducts.toFixed(2)}`);
    console.log(`   Wallet = ${(totalDeposits + totalAdminDeducts).toFixed(2)} USD`);
    console.log(`\n   💰 Wallet thực tế: ${user.walletBalance.toFixed(2)} USD`);

    const diff = user.walletBalance - (totalDeposits + totalAdminDeducts);
    console.log(`\n   ⚠️  Chênh lệch: ${diff.toFixed(2)} USD`);

    if (Math.abs(diff) < 0.01) {
      console.log("\n   ✅ KẾT LUẬN: ORDERS KHÔNG TRỪ WALLET! ĐÂY LÀ BUG!");
      console.log("   → Orders được tạo nhưng không trừ tiền wallet.");
    } else {
      console.log("\n   ❓ Có thể có nguyên nhân khác.");
    }

    // ═══════════════════════════════════════════════════════════════════
    // KIỂM TRA CODE: Xem logic mua hàng
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n\n═══════════════════════════════════════════════════════════════");
    console.log("KIỂM TRA CODE: sellerController.js purchase()");
    console.log("═══════════════════════════════════════════════════════════════\n");

    console.log("Trong code sellerController.js, function purchase():");
    console.log("1. Kiểm tra seller.walletBalance >= price");
    console.log("2. seller.walletBalance -= price");
    console.log("3. await seller.save()");
    console.log("\n→ Nếu orders được tạo mà wallet không bị trừ → CÓ BUG TRONG CODE!");

    // ═══════════════════════════════════════════════════════════════════
    // XEM ĐẦY ĐỦ WALLET HISTORY
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n\n═══════════════════════════════════════════════════════════════");
    console.log("WALLET SIMULATION (từng bước)");
    console.log("═══════════════════════════════════════════════════════════════\n");

    let simWallet = 0;
    console.log("Time                        | Action                    | Amount  | Wallet");
    console.log("----------------------------|---------------------------|---------|-------");

    for (const t of timeline.slice(0, 30)) { // Chỉ show 30 giao dịch đầu
      const oldSim = simWallet;
      simWallet += t.amount;
      
      const time = new Date(t.date).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
      
      const typeStr = t.type.padEnd(24);
      const amountStr = t.amount.toFixed(2).padStart(7);
      const walletStr = simWallet.toFixed(2);
      
      // Highlight nếu có vấn đề
      if (t.type === "PURCHASE" && t.amount < 0) {
        console.log(`${time} | ${typeStr} | ${amountStr} | ${walletStr} ← PURCHASE`);
      } else {
        console.log(`${time} | ${typeStr} | ${amountStr} | ${walletStr}`);
      }
    }

    console.log("\n... (còn nhiều giao dịch nữa)");
    console.log(`\n💰 Wallet cuối cùng (simulation): ${simWallet.toFixed(2)} USD`);
    console.log(`💰 Wallet thực tế: ${user.walletBalance.toFixed(2)} USD`);

  } catch (error) {
    console.error("❌ Lỗi:", error.message);
  } finally {
    try {
      await mongoose.disconnect();
      console.log("\n👋 Đã ngắt kết nối MongoDB");
    } catch (e) { }
  }
}

checkOrdersVsWallet();
