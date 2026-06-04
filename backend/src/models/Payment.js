const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    // Âm = admin trừ tiền (ghi sổ); nạp/ngân hàng luôn >= 0
    amountUSD: {
      type: Number,
    },
    amountVND: {
      type: Number,
      required: true,
      min: 0,
    },
    transferContent: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    bankAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BankAccount",
      required: false, // Cho phép null cho manual topup
    },
    note: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "expired"],
      default: "pending",
    },
    completedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      // Tự động hết hạn sau 10 tiếng nếu chưa thanh toán
      default: function() {
        const date = new Date();
        date.setHours(date.getHours() + 10);
        return date;
      },
    },
    walletBeforeUSD: {
      type: Number,
    },
    walletAfterUSD: {
      type: Number,
    },
    walletBeforeVND: {
      type: Number,
    },
    walletAfterVND: {
      type: Number,
    },
    transactionType: {
      type: String,
      enum: ["topup", "purchase", "manual_topup", "manual_deduct", "adjustment"],
    },
    source: {
      type: String,
      trim: true,
    },
    // Dùng để lock payment khi đang xử lý, tránh 2 backend cùng xử lý 1 payment
    processingAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Index để tìm payment pending dễ dàng
paymentSchema.index({ status: 1, expiresAt: 1 });
// Index để lock payment khi xử lý
paymentSchema.index({ status: 1, processingAt: 1 });

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = { Payment };

