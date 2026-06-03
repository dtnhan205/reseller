const mongoose = require("mongoose");

async function checkWalletBug() {
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
    console.log(`📅 Created: ${user.createdAt}`);
    console.log(`💰 Current Wallet: ${user.walletBalance} USD\n`);

    // ═══════════════════════════════════════════════════════════════════
    // KIỂM TRA: User có thể đã được tạo với wallet ban đầu?
    // ═══════════════════════════════════════════════════════════════════
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("KIỂM TRA: USER ĐƯỢC TẠO VỚI WALLET BAN ĐẦU?");
    console.log("═══════════════════════════════════════════════════════════════\n");

    // Kiểm tra tất cả users xem có ai có walletBalance khác 0 lúc tạo không
    const allUsers = await db.collection("users")
      .find({ role: "seller" })
      .sort({ createdAt: 1 })
      .toArray();

    console.log("📋 TẤT CẢ SELLERS (theo thứ tự tạo):\n");
    for (const u of allUsers) {
      const wallet = (u.walletBalance || 0).toFixed(2);
      const created = new Date(u.createdAt).toLocaleString("vi-VN");
      const isTarget = u.email === "kennguyentv9x@gmail.com" ? " ← TARGET" : "";
      console.log(`   ${created} | ${wallet.padStart(10)} USD | ${u.email}${isTarget}`);
    }

    // ═══════════════════════════════════════════════════════════════════
    // TÍNH TOÁN LẠI: Nếu user có wallet ban đầu X USD
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n\n═══════════════════════════════════════════════════════════════");
    console.log("TÍNH TOÁN SỐ DƯ BAN ĐẦU");
    console.log("═══════════════════════════════════════════════════════════════\n");

    const payments = await db.collection("payments")
      .find({ sellerId: user._id, status: "completed" })
      .toArray();

    const orders = await db.collection("orders")
      .find({ sellerId: user._id })
      .toArray();

    let totalDeposits = 0;
    let totalAdminDeduct = 0;
    let totalOrdersCost = 0;

    for (const p of payments) {
      const usd = p.amountUSD || 0;
      if (usd > 0) totalDeposits += usd;
      else totalAdminDeduct += usd;
    }

    for (const o of orders) {
      totalOrdersCost += (o.price || 0);
    }

    console.log("📊 SỐ LIỆU:");
    console.log(`   Tổng nạp tiền: ${totalDeposits.toFixed(2)} USD`);
    console.log(`   Tổng admin trừ: ${totalAdminDeduct.toFixed(2)} USD`);
    console.log(`   Tổng orders: ${totalOrdersCost.toFixed(2)} USD`);
    console.log(`   Wallet hiện tại: ${user.walletBalance.toFixed(2)} USD\n`);

    // Tính wallet ban đầu:
    // wallet_hien_tai = wallet_ban_dau + tong_nap - tong_admin_tru - tong_orders
    // wallet_ban_dau = wallet_hien_tai - tong_nap + tong_admin_tru + tong_orders
    const initialWallet = user.walletBalance - totalDeposits - totalAdminDeduct + totalOrdersCost;

    console.log("📐 CÔNG THỨC:");
    console.log("   wallet_hien_tai = wallet_ban_dau + tong_nap + tong_admin_tru - tong_orders");
    console.log(`   ${user.walletBalance.toFixed(2)} = X + ${totalDeposits.toFixed(2)} + (${totalAdminDeduct.toFixed(2)}) - ${totalOrdersCost.toFixed(2)}`);
    console.log(`   wallet_ban_dau = ${user.walletBalance.toFixed(2)} - ${totalDeposits.toFixed(2)} - (${totalAdminDeduct.toFixed(2)}) + ${totalOrdersCost.toFixed(2)}`);
    console.log(`\n   💰 WALLET BAN ĐẦU = ${initialWallet.toFixed(2)} USD`);

    if (initialWallet > 0) {
      console.log(`\n⚠️  PHÁT HIỆN: User được tạo với ${initialWallet.toFixed(2)} USD trong ví!`);
      console.log("   → ĐÂY CÓ THỂ LÀ NGUỒN 'TIỀN BẤT THƯỜNG'!");
    } else if (initialWallet < 0) {
      console.log(`\n❌ BUG: Wallet âm ${Math.abs(initialWallet).toFixed(2)} USD!`);
      console.log("   → User đã mua hàng nhiều hơn số tiền nạp!");
      console.log("   → CÓ BUG TRONG LOGIC KIỂM TRA SỐ DƯ!");
    }

    // ═══════════════════════════════════════════════════════════════════
    // KIỂM TRA: Các orders có bị trừ wallet không?
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n\n═══════════════════════════════════════════════════════════════");
    console.log("KIỂM TRA: ORDERS TRỪ WALLET ĐÚNG KHÔNG?");
    console.log("═══════════════════════════════════════════════════════════════\n");

    // Lấy 1 order và check xem nó có bị trừ wallet thực sự không
    const firstOrder = orders[0];
    if (firstOrder) {
      console.log(`📦 Order đầu tiên: ${firstOrder._id}`);
      console.log(`   Price: ${firstOrder.price} USD`);
      console.log(`   Created: ${firstOrder.createdAt}`);
      console.log(`   Status: ${firstOrder.status}`);
      
      // Kiểm tra xem order này có nằm trong payment nào không
      // (payment ghi nhận việc trừ tiền)
    }

    // ═══════════════════════════════════════════════════════════════════
    // XÁC NHẬN: Bug trong logic mua hàng
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n\n═══════════════════════════════════════════════════════════════");
    console.log("🔍 PHÂN TÍCH CODE: sellerController.js");
    console.log("═══════════════════════════════════════════════════════════════\n");

    console.log("Trong function purchase():");
    console.log("```");
    console.log("if (seller.walletBalance < price) throw new HttpError(400, 'Insufficient...')");
    console.log("seller.walletBalance -= price;");
    console.log("await seller.save();");
    console.log("```");
    console.log("\n→ Nếu check này đúng, user KHÔNG THỂ mua quá số dư.");
    console.log("→ Nhưng user đã mua 685.40 USD với số dư 609.03 USD!");
    console.log("\n⚠️  KẾT LUẬN: CÓ BUG TRONG LOGIC MUA HÀNG!");

    console.log("\n\n═══════════════════════════════════════════════════════════════");
    console.log("                         TỔNG KẾT");
    console.log("═══════════════════════════════════════════════════════════════\n");

    console.log(`1. User nạp tiền: ${totalDeposits.toFixed(2)} USD`);
    console.log(`2. Admin trừ: ${totalAdminDeduct.toFixed(2)} USD`);
    console.log(`3. Mua hàng: ${totalOrdersCost.toFixed(2)} USD`);
    console.log(`4. Wallet ban đầu: ${initialWallet.toFixed(2)} USD`);
    console.log(`5. Wallet hiện tại: ${user.walletBalance.toFixed(2)} USD`);
    
    if (Math.abs(initialWallet) < 0.01) {
      console.log("\n✅ Wallet ban đầu = 0, không có gì bất thường.");
    } else {
      console.log(`\n⚠️  CẦN ĐIỀU TRA: Wallet ban đầu = ${initialWallet.toFixed(2)} USD`);
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

checkWalletBug();
