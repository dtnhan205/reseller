const mongoose = require("mongoose");

const inventoryItemSchema = new mongoose.Schema(
  {
    value: { type: String, required: true, trim: true }, // key hoặc link
    qtyAvailable: { type: Number, required: true, min: 0 },
    qtySold: { type: Number, default: 0, min: 0 },
    soldToSellerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { _id: true, timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    totalQtyAvailable: { type: Number, default: 0, min: 0 },
    totalQtySold: { type: Number, default: 0, min: 0 },
    inventory: { type: [inventoryItemSchema], default: [] },
    // proxyvip = 1: sản phẩm dạng Proxy VIP, các sản phẩm khác để null
    proxyvip: { type: Number, default: null },
    proxyvipConfig: {
      ip: { type: String, trim: true },
      port: { type: String, trim: true },
      aimLink: { type: String, trim: true },
      installText: { type: String, trim: true },
      installVideoUrl: { type: String, trim: true },
      source: { type: String, enum: ["v1", "v2", "v3"], default: "v1" },
      duration: { type: String, enum: ["1h", "2h", "1d", "1w", "1m", "1y"], default: "1m" },
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = { Product };


 