const mongoose = require("mongoose");
const { HttpError } = require("../utils/httpError");
const { User } = require("../models/User");
const { Product } = require("../models/Product");
const { Order } = require("../models/Order");
const { TopupTransaction } = require("../models/TopupTransaction");

async function topupWallet(req, res) {
  const { amount } = req.body || {};
  const num = Number(amount);
  if (!Number.isFinite(num) || num <= 0) throw new HttpError(400, "Invalid amount");

  const user = await User.findById(req.user._id);
  if (!user) throw new HttpError(404, "User not found");
  if (user.role !== "seller") throw new HttpError(403, "Only seller can topup");

  user.walletBalance += num;
  await user.save();
  
  await TopupTransaction.create({ sellerId: user._id, amount: num });
  
  res.json({ newBalance: user.walletBalance });
}

async function purchase(req, res) {
  const { productId } = req.body || {};
  if (!productId) throw new HttpError(400, "Missing productId");

  const session = await mongoose.startSession();
  try {
    let createdOrder;

    await session.withTransaction(async () => {
      const seller = await User.findById(req.user._id).session(session);
      if (!seller) throw new HttpError(404, "Seller not found");
      if (seller.role !== "seller") throw new HttpError(403, "Only seller can purchase");

      const product = await Product.findById(productId).session(session);
      if (!product) throw new HttpError(404, "Product not found");

      const price = product.price;
      if (seller.walletBalance < price) throw new HttpError(400, "Insufficient wallet balance");

      const idx = product.inventory.findIndex((it) => it.qtyAvailable > 0);
      if (idx === -1) throw new HttpError(400, "Out of stock");

      const inv = product.inventory[idx];
      inv.qtyAvailable -= 1;
      inv.qtySold += 1;
      inv.soldToSellerIds.push(seller._id);

      product.totalQtyAvailable = Math.max(0, (product.totalQtyAvailable || 0) - 1);
      product.totalQtySold = (product.totalQtySold || 0) + 1;

      seller.walletBalance -= price;

      createdOrder = await Order.create(
        [
          {
            sellerId: seller._id,
            productId: product._id,
            productName: product.name,
            keyValue: inv.value,
            price,
            purchasedAt: new Date()
          }
        ],
        { session }
      );

      await product.save({ session });
      await seller.save({ session });
    });

    const updatedSeller = await User.findById(req.user._id);
    res.status(201).json({ 
      order: createdOrder?.[0],
      newBalance: updatedSeller?.walletBalance || 0
    });
  } finally {
    session.endSession();
  }
}

async function listOrders(req, res) {
  if (req.user.role !== "seller") throw new HttpError(403, "Only seller");
  const orders = await Order.find({ sellerId: req.user._id })
    .sort({ purchasedAt: -1 })
    .lean();
  // Transform để match frontend format
  const transformed = orders.map((o) => ({
    _id: o._id,
    product: o.productId,
    productName: o.productName,
    key: o.keyValue,
    price: o.price,
    seller: o.sellerId,
    createdAt: o.purchasedAt || o.createdAt,
  }));
  res.json(transformed);
}

async function getProducts(req, res) {
  try {
    const products = await Product.find()
      .populate("categoryId", "name slug")
      .lean();
    // Transform để match frontend format
    const transformed = products.map((p) => ({
      _id: p._id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      category: p.categoryId || null, // Map categoryId to category for frontend, handle null
      remainingQuantity: p.totalQtyAvailable || 0,
      soldQuantity: p.totalQtySold || 0,
      createdAt: p.createdAt,
    }));
    console.log('Seller getProducts: Returning', transformed.length, 'products');
    res.json(transformed);
  } catch (error) {
    console.error('Seller getProducts error:', error);
    console.error('Error stack:', error.stack);
    throw new HttpError(500, `Failed to fetch products: ${error.message}`);
  }
}

async function getTopupHistory(req, res) {
  if (req.user.role !== "seller") throw new HttpError(403, "Only seller");
  const transactions = await TopupTransaction.find({ sellerId: req.user._id })
    .sort({ createdAt: -1 })
    .lean();
  // Transform để match frontend format
  const transformed = transactions.map((t) => ({
    _id: t._id,
    seller: t.sellerId,
    amount: t.amount,
    createdAt: t.createdAt,
  }));
  res.json(transformed);
}

module.exports = { topupWallet, purchase, listOrders, getProducts, getTopupHistory };


