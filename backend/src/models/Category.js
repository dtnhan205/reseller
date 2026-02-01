const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    image: { type: String, trim: true } // URL to category image
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
module.exports = { Category };


