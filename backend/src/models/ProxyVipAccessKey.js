const mongoose = require("mongoose");

const proxyVipAccessKeySchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Chỉ lưu 1 document duy nhất
proxyVipAccessKeySchema.statics.getKey = async function() {
  let keyDoc = await this.findOne();
  if (!keyDoc) {
    keyDoc = await this.create({ value: "proxyvipdtn" });
  }
  return keyDoc;
};

proxyVipAccessKeySchema.statics.setKey = async function(value) {
  let keyDoc = await this.findOne();
  if (keyDoc) {
    keyDoc.value = value;
    await keyDoc.save();
  } else {
    keyDoc = await this.create({ value });
  }
  return keyDoc;
};

const ProxyVipAccessKey = mongoose.model("ProxyVipAccessKey", proxyVipAccessKeySchema);
module.exports = { ProxyVipAccessKey };
