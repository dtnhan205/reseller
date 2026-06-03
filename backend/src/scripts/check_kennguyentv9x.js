// Script để kiểm tra nguyên nhân nạp tiền bất thường
// Chạy: node check_kennguyentv9x.js

// Kết nối database (sử dụng mongoose như server)
const mongoose = require("mongoose");

// Tạo model tạm
const UserSchema = new mongoose.Schema({}, { strict: false });
const PaymentSchema = new mongoose.Schema({}, { strict: false });
const ExchangeRateSchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.model("User", UserSchema);
const Payment = mongoose.model("Payment", PaymentSchema);
const ExchangeRate = mongoose.model("ExchangeRate", ExchangeRateSchema);

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Tìm user
    const user = await User.findOne({ email: "kennguyentv9x@gmail.com" });
    if (!user) {
      console.log("❌ Không tìm thấy user");
      return;
    }
    
    console.log(`\n=== USER: ${user.email} ===`);
    console.log(`Wallet: ${user.walletBalance} USD\n`);
    
    // Lấy payments
    const payments = await Payment.find({ sellerId: user._id }).sort({ createdAt: -1 });
    
    console.log(`=== ${payments.length} PAYMENTS ===\n`);
    
    let sumUSD = 0;
    let sumVND = 0;
    
    for (const p of payments) {
      const usd = p.amountUSD || 0;
      const vnd = p.amountVND || p.amount || 0;
      const status = p.status;
      const rate = (usd > 0 && vnd > 0) ? (vnd / usd).toFixed(0) : "-";
      
      if (status === "completed" && usd >= 0) {
        sumUSD += usd;
        sumVND += vnd;
      }
      
      console.log(`[${status}] USD: ${usd} | VND: ${vnd} | Rate: ${rate} | ${p.transferContent}`);
      if (p.note) console.log(`  → ${p.note}`);
    }
    
    console.log(`\n=== TỔNG KẾT ===`);
    console.log(`Tổng USD đã nạp (theo payment): ${sumUSD.toFixed(2)}`);
    console.log(`Tổng VND đã nạp (theo payment): ${sumVND.toLocaleString()}`);
    console.log(`Tỷ giá trung bình: ${(sumVND / sumUSD).toFixed(0)} VND/USD`);
    console.log(`Wallet hiện tại: ${user.walletBalance} USD`);
    
    // Kiểm tra exchange rate
    const rate = await ExchangeRate.findOne({});
    if (rate) {
      console.log(`\n=== TỶ GIÁ HIỆN TẠI: 1 USD = ${rate.usdToVnd} VND ===`);
    }
    
    // Tính xem nếu 129000 VND được nạp với tỷ giá nào thì ra bao nhiêu USD
    console.log(`\n=== KIỂM TRA ===`);
    console.log(`Nếu 129,000 VND ÷ 8,000 = ${(129000/8000).toFixed(2)} USD`);
    console.log(`Nếu 129,000 VND ÷ 25,000 = ${(129000/25000).toFixed(2)} USD`);
    console.log(`Nếu 129,000 VND ÷ 26,000 = ${(129000/26000).toFixed(2)} USD`);
    
  } catch (err) {
    console.error("Lỗi:", err.message);
  } finally {
    await mongoose.disconnect();
  }
}

check();
