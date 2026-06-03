const mongoose = require("mongoose");

async function checkSeller() {
  try {
    console.log("🔄 Đang kết nối MongoDB Atlas (direct connection)...\n");

    // Direct connection với 1 host duy nhất
    const uri = `mongodb://nhandtps40210:dtn280705reseller@ac-0evdfk1-shard-00-00.bk91ctf.mongodb.net:27017/Reseller?ssl=true&authSource=admin&directConnection=true`;

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20000,
      socketTimeoutMS: 45000,
    });

    console.log("✅ Đã kết nối MongoDB\n");

    const db = mongoose.connection.db;

    // 1. Tìm user
    const user = await db.collection("users").findOne({ email: "kennguyentv9x@gmail.com" });
    if (!user) {
      console.log("❌ Không tìm thấy user kennguyentv9x@gmail.com");
      return;
    }

    console.log("=== THÔNG TIN USER ===");
    console.log(`Email: ${user.email}`);
    console.log(`Wallet Balance: ${user.walletBalance} USD`);
    console.log(`Role: ${user.role}`);
    console.log(`Created: ${user.createdAt}`);
    console.log("");

    // 2. Lấy tất cả payments của user
    const payments = await db.collection("payments")
      .find({ sellerId: user._id })
      .sort({ createdAt: -1 })
      .toArray();

    console.log(`=== LỊCH SỬ NẠP TIỀN (${payments.length} payments) ===\n`);

    let totalPositive = 0;
    let totalNegative = 0;

    for (const p of payments) {
      const usdAmount = p.amountUSD || 0;
      const vndAmount = p.amountVND || p.amount || 0;
      const status = p.status;

      if (status === "completed") {
        if (usdAmount >= 0) {
          totalPositive += usdAmount;
        } else {
          totalNegative += usdAmount;
        }
      }

      const rate = (usdAmount > 0 && vndAmount > 0) ? (vndAmount / usdAmount).toFixed(0) : "N/A";
      console.log(`[${status}] USD: ${usdAmount} | VND: ${vndAmount} | Rate: ${rate} | ${p.transferContent}`);
      console.log(`   Created: ${p.createdAt} | Completed: ${p.completedAt || "-"}`);
      if (p.note) console.log(`   Note: ${p.note}`);
      console.log("");
    }

    console.log("=== TỔNG KẾT ===");
    console.log(`Tổng nạp tiền (USD dương): +${totalPositive.toFixed(2)} USD`);
    console.log(`Tổng trừ tiền (USD âm): ${totalNegative.toFixed(2)} USD`);
    console.log(`Wallet hiện tại: ${user.walletBalance} USD`);
    console.log(`Tính toán: ${totalPositive.toFixed(2)} + (${totalNegative.toFixed(2)}) = ${(totalPositive + totalNegative).toFixed(2)} USD`);
    console.log("");

    // 3. Kiểm tra ExchangeRate
    const exchangeRate = await db.collection("exchangerates").findOne({});
    if (exchangeRate) {
      console.log("=== TỶ GIÁ HIỆN TẠI ===");
      console.log(`1 USD = ${exchangeRate.usdToVnd} VND`);
      console.log(`Updated: ${exchangeRate.updatedAt || exchangeRate.createdAt}`);
      console.log("");
    }

    // 4. Phân tích - tìm payment "129k"
    console.log("=== PHÂN TÍCH ===");
    const completedPayments = payments.filter(p => p.status === "completed" && (p.amountUSD || 0) > 0);

    // Tìm payments gần 129k VND
    const payments129k = completedPayments.filter(p => {
      const vnd = p.amountVND || p.amount || 0;
      return vnd >= 125000 && vnd <= 135000;
    });

    if (payments129k.length > 0) {
      console.log("⚠️  CÁC PAYMENTS GẦN 129,000 VND:");
      for (const p of payments129k) {
        const vnd = p.amountVND || p.amount || 0;
        const usd = p.amountUSD || 0;
        const rate = vnd / usd;
        console.log(`  - ${usd.toFixed(2)} USD = ${vnd.toLocaleString()} VND (tỷ giá: ${rate.toFixed(0)} VND/USD)`);
        console.log(`    Content: ${p.transferContent}`);
        console.log(`    Created: ${p.createdAt}`);
      }
      console.log("");
    }

    // Tính tổng theo amountVND (để so sánh)
    const sumVND = completedPayments.reduce((sum, p) => sum + (p.amountVND || p.amount || 0), 0);
    const sumUSD = completedPayments.reduce((sum, p) => sum + (p.amountUSD || 0), 0);
    const avgRate = sumUSD > 0 ? sumVND / sumUSD : 0;

    console.log("=== SO SÁNH TỔNG ===");
    console.log(`Tổng amountVND: ${sumVND.toLocaleString()} VND`);
    console.log(`Tổng amountUSD: ${sumUSD.toFixed(2)} USD`);
    console.log(`Tỷ giá trung bình thực tế: ${avgRate.toFixed(0)} VND/USD`);
    console.log(`Tỷ giá mặc định: 25,000 VND/USD`);
    console.log("");
    console.log(`→ Nếu tỷ giá trung bình << 25,000 → TỶ GIÁ ĐÃ BỊ THAY ĐỔI trước đó!`);

  } catch (error) {
    console.error("❌ Lỗi:", error.message);
  } finally {
    try {
      await mongoose.disconnect();
      console.log("\n👋 Đã ngắt kết nối MongoDB");
    } catch (e) { }
  }
}

checkSeller();
