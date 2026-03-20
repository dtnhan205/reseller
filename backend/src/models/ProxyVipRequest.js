const mongoose = require("mongoose");

const proxyVipRequestSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    gameId: {
      // Legacy field: previously required. Now optional because purchase returns license key instantly.
      type: String,
      required: false,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "processed"],
      default: "pending",
      index: true,
    },
    processedAt: {
      type: Date,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    licenseKey: {
      type: String,
      trim: true,
    },
    licenseDuration: {
      type: String,
      enum: ["1d", "1w", "1m", "1y"],
    },
    licenseSource: {
      type: String,
      enum: ["v1", "v2"],
      default: "v1",
    },
  },
  { timestamps: true }
);

const ProxyVipRequest = mongoose.model("ProxyVipRequest", proxyVipRequestSchema);

module.exports = { ProxyVipRequest };

