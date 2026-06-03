const mongoose = require("mongoose");

async function comprehensiveCheck() {
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

    console.log("═══════════════════════════════════════════════════════════════");
    console.log("                    PHÂN TÍCH TOÀN DIỆN");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log(`\n👤 USER: ${user.email}`);
    console.log(`📅 Created: ${user.createdAt}`);
    console.log(`💰 Current Wallet: ${user.walletBalance} USD\n`);

    // ═══════════════════════════════════════════════════════════════════
    // 1. PAYMENTS - Tất cả nạp tiền (bao gồm cả manual topup)
    // ═══════════════════════════════════════════════════════════════════
    const payments = await db.collection("payments")
      .find({ sellerId: user._id })
      .sort({ createdAt: 1 })
      .toArray();

    console.log("═══════════════════════════════════════════════════════════════");
    console.log("1️⃣  NGUỒN TIỀN VÀO (TỪ PAYMENTS)");
    console.log("═══════════════════════════════════════════════════════════════");

    let totalIn = 0;
    let bankDeposits = 0;     // Nạp qua ngân hàng
    let manualTopups = 0;      // Admin nạp thủ công
    let otherIn = 0;

    const bankDepositList = [];
    const manualTopupList = [];

    for (const p of payments) {
      const usdAmount = p.amountUSD || 0;
      const status = p.status;

      if (status === "completed" && usdAmount > 0) {
        totalIn += usdAmount;

        // Phân loại theo transferContent
        if (p.transferContent.includes("ADMIN_TOPUP")) {
          manualTopups += usdAmount;
          manualTopupList.push(p);
        } else if (p.transferContent.includes("dtn")) {
          bankDeposits += usdAmount;
          bankDepositList.push(p);
        } else {
          otherIn += usdAmount;
        }
      }
    }

    console.log(`\n📥 TỔNG TIỀN VÀO (từ payments): ${totalIn.toFixed(2)} USD`);
    console.log(`   ├─ Nạp qua ngân hàng: ${bankDeposits.toFixed(2)} USD (${bankDepositList.length} giao dịch)`);
    console.log(`   ├─ Admin nạp thủ công: ${manualTopups.toFixed(2)} USD (${manualTopupList.length} lần)`);
    console.log(`   └─ Khác: ${otherIn.toFixed(2)} USD`);

    if (manualTopupList.length > 0) {
      console.log("\n⚠️  ADMIN NẠP THỦ CÔNG:");
      for (const p of manualTopupList) {
        console.log(`   - ${p.amountUSD} USD | ${p.note || "Không có ghi chú"} | ${p.completedAt || p.createdAt}`);
      }
    }

    // ═══════════════════════════════════════════════════════════════════
    // 2. ADMIN DEDUCTIONS - Tiền bị trừ bởi admin
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n\n═══════════════════════════════════════════════════════════════");
    console.log("2️⃣  TIỀN RA (ADMIN TRỪ)");
    console.log("═══════════════════════════════════════════════════════════════");

    let totalAdminDeduct = 0;
    const adminDeductList = [];

    for (const p of payments) {
      const usdAmount = p.amountUSD || 0;
      if (p.status === "completed" && usdAmount < 0) {
        totalAdminDeduct += usdAmount; // Âm
        adminDeductList.push(p);
      }
    }

    console.log(`\n📤 TỔNG ADMIN TRỪ: ${totalAdminDeduct.toFixed(2)} USD (${adminDeductList.length} lần)`);
    if (adminDeductList.length > 0) {
      for (const p of adminDeductList) {
        console.log(`   - ${p.amountUSD} USD | ${p.note || "Không có ghi chú"} | ${p.completedAt || p.createdAt}`);
      }
    }

    // ═══════════════════════════════════════════════════════════════════
    // 3. ORDERS - Tiền mua hàng
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n\n═══════════════════════════════════════════════════════════════");
    console.log("3️⃣  TIỀN MUA HÀNG (ORDERS)");
    console.log("═══════════════════════════════════════════════════════════════");

    const orders = await db.collection("orders")
      .find({ sellerId: user._id })
      .toArray();

    let totalSpentOnOrders = 0;
    for (const o of orders) {
      totalSpentOnOrders += (o.price || 0);
    }

    console.log(`\n🛒 TỔNG CHI TIÊU: ${totalSpentOnOrders.toFixed(2)} USD (${orders.length} đơn hàng)`);

    // ═══════════════════════════════════════════════════════════════════
    // 4. EXCHANGE RATE HISTORY
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n\n═══════════════════════════════════════════════════════════════");
    console.log("4️⃣  LỊCH SỬ TỶ GIÁ");
    console.log("═══════════════════════════════════════════════════════════════");

    const exchangeRates = await db.collection("exchangerates")
      .find({})
      .sort({ createdAt: 1 })
      .toArray();

    if (exchangeRates.length > 0) {
      console.log("\n💱 LỊCH SỬ THAY ĐỔI TỶ GIÁ:");
      for (const r of exchangeRates) {
        console.log(`   - 1 USD = ${r.usdToVnd} VND | Updated: ${r.updatedAt || r.createdAt}`);
      }
    } else {
      console.log("\n💱 Tỷ giá mặc định: 25,000 VND/USD");
    }

    // ═══════════════════════════════════════════════════════════════════
    // 5. TỔNG HỢP VÀ KIỂM TRA SAI SÓT
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n\n═══════════════════════════════════════════════════════════════");
    console.log("5️⃣  TỔNG HỢP SỐ DƯ");
    console.log("═══════════════════════════════════════════════════════════════");

    const calculatedBalance = totalIn + totalAdminDeduct - totalSpentOnOrders;

    console.log("\n📊 CÔNG THỨC TÍNH:");
    console.log(`   Wallet = Nạp tiền + Admin trừ - Mua hàng`);
    console.log(`   Wallet = ${totalIn.toFixed(2)} + (${totalAdminDeduct.toFixed(2)}) - ${totalSpentOnOrders.toFixed(2)}`);
    console.log(`   Wallet = ${calculatedBalance.toFixed(2)} USD`);

    console.log(`\n💰 WALLET HIỆN TẠI: ${user.walletBalance.toFixed(2)} USD`);

    const difference = user.walletBalance - calculatedBalance;
    console.log("\n═══════════════════════════════════════════════════════════════");
    console.log("⚖️  SO SÁNH:");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log(`   Wallet tính được: ${calculatedBalance.toFixed(2)} USD`);
    console.log(`   Wallet thực tế:   ${user.walletBalance.toFixed(2)} USD`);
    console.log(`   ═══════════════════════════════════════════════════════`);
    
    if (Math.abs(difference) < 0.01) {
      console.log("   ✅ KHỚP! Wallet hoàn toàn chính xác.");
    } else if (difference > 0) {
      console.log(`   ⚠️  SAI SÓT: Wallet thực tế NHIỀU HƠN ${difference.toFixed(2)} USD`);
      console.log("   → CÓ THỂ CÓ NGUỒN TIỀN KHÔNG ĐƯỢC GHI NHẬN!");
    } else {
      console.log(`   ⚠️  SAI SÓT: Wallet thực tế ÍT HƠN ${Math.abs(difference).toFixed(2)} USD`);
      console.log("   → CÓ THỂ CÓ GIAO DỊCH BỊ TRỪ NHƯNG CHƯA GHI NHẬN!");
    }

    // ═══════════════════════════════════════════════════════════════════
    // 6. KIỂM TRA CÁC PAYMENTS BỊ XỬ LÝ TRÙNG
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n\n═══════════════════════════════════════════════════════════════");
    console.log("6️⃣  KIỂM TRA PAYMENTS TRÙNG LẶP");
    console.log("═══════════════════════════════════════════════════════════════");

    // Tìm các payments có cùng transferContent
    const transferContents = {};
    const duplicateContents = [];

    for (const p of payments) {
      if (transferContents[p.transferContent]) {
        duplicateContents.push({
          content: p.transferContent,
          payments: [transferContents[p.transferContent], p]
        });
      } else {
        transferContents[p.transferContent] = p;
      }
    }

    if (duplicateContents.length > 0) {
      console.log(`\n⚠️  PHÁT HIỆN ${duplicateContents.length} TRANSFER CONTENT TRÙNG LẶP!`);
      for (const dup of duplicateContents) {
        console.log(`\n   Content: ${dup.content}`);
        for (const p of dup.payments) {
          console.log(`   - Status: ${p.status} | USD: ${p.amountUSD} | ${p.completedAt || p.createdAt}`);
        }
      }
    } else {
      console.log("\n✅ Không có transfer content trùng lặp.");
    }

    // Kiểm tra xem có payment nào bị xử lý 2 lần không (cùng transferContent, cùng số tiền, 2 lần completed)
    const completedByContent = {};
    for (const p of payments) {
      if (p.status === "completed" && p.amountUSD > 0) {
        const key = `${p.transferContent}_${p.amountUSD}`;
        if (completedByContent[key]) {
          console.log(`\n⚠️  CẢNH BÁO: Payment TRÙNG! ${p.transferContent} đã completed 2 lần!`);
          console.log(`   Lần 1: ${completedByContent[key].completedAt}`);
          console.log(`   Lần 2: ${p.completedAt}`);
        } else {
          completedByContent[key] = p;
        }
      }
    }

    console.log("\n═══════════════════════════════════════════════════════════════");
    console.log("                         KẾT LUẬN");
    console.log("═══════════════════════════════════════════════════════════════");

  } catch (error) {
    console.error("❌ Lỗi:", error.message);
  } finally {
    try {
      await mongoose.disconnect();
      console.log("\n👋 Đã ngắt kết nối MongoDB");
    } catch (e) { }
  }
}

comprehensiveCheck();
