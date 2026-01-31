const mongoose = require("mongoose");
const { HttpError } = require("../utils/httpError");
const { slugify } = require("../utils/slugify");
const { signToken } = require("../utils/jwt");
const { User } = require("../models/User");
const { Category } = require("../models/Category");
const { Product } = require("../models/Product");

async function createSeller(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) throw new HttpError(400, "Missing email or password");

  const normalizedEmail = String(email).toLowerCase().trim();
  const exists = await User.findOne({ email: normalizedEmail }).lean();
  if (exists) throw new HttpError(409, "Email already exists");

  const passwordHash = await User.hashPassword(String(password));
  const seller = await User.create({ email: normalizedEmail, passwordHash, role: "seller" });

  const token = signToken({ userId: seller._id.toString(), role: seller.role });

  res.status(201).json({
    token,
    user: {
      _id: seller._id,
      email: seller.email,
      role: seller.role,
      wallet: seller.walletBalance || 0,
      createdAt: seller.createdAt
    }
  });
}

async function createCategory(req, res) {
  const { name, slug } = req.body || {};
  if (!name) throw new HttpError(400, "Missing name");
  const finalSlug = slug ? slugify(slug) : slugify(name);
  if (!finalSlug) throw new HttpError(400, "Invalid slug");

  const exists = await Category.findOne({ slug: finalSlug }).lean();
  if (exists) throw new HttpError(409, "Category slug already exists");

  const category = await Category.create({ name: String(name).trim(), slug: finalSlug });
  res.status(201).json({ category });
}

async function listCategories(req, res) {
  const categories = await Category.find().sort({ createdAt: -1 }).lean();
  res.json(categories);
}

async function createProduct(req, res) {
  const { name, slug, price, categoryId } = req.body || {};
  if (!name || price == null || !categoryId) throw new HttpError(400, "Missing name, price, or categoryId");

  const finalSlug = slug ? slugify(slug) : slugify(name);
  if (!finalSlug) throw new HttpError(400, "Invalid slug");

  const category = await Category.findById(categoryId).lean();
  if (!category) throw new HttpError(404, "Category not found");

  const exists = await Product.findOne({ slug: finalSlug }).lean();
  if (exists) throw new HttpError(409, "Product slug already exists");

  const product = await Product.create({
    name: String(name).trim(),
    slug: finalSlug,
    price: Number(price),
    categoryId: new mongoose.Types.ObjectId(categoryId),
    totalQtyAvailable: 0,
    totalQtySold: 0,
    inventory: []
  });

  res.status(201).json({ product });
}

async function listProducts(req, res) {
  const products = await Product.find()
    .populate("categoryId", "name slug")
    .sort({ createdAt: -1 })
    .lean();
  // Transform để match frontend format
  const transformed = products.map((p) => ({
    _id: p._id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    category: p.categoryId,
    remainingQuantity: p.totalQtyAvailable || 0,
    soldQuantity: p.totalQtySold || 0,
    createdAt: p.createdAt,
  }));
  res.json(transformed);
}

async function addInventory(req, res) {
  const { productId } = req.params;
  const { keys } = req.body || {};
  if (!Array.isArray(keys) || keys.length === 0) throw new HttpError(400, "Missing keys array");

  const normalized = keys
    .map((x) => String(x || "").trim())
    .filter((x) => x.length > 0);

  if (normalized.length === 0) throw new HttpError(400, "No valid keys");

  const product = await Product.findById(productId);
  if (!product) throw new HttpError(404, "Product not found");

  for (const key of normalized) {
    product.inventory.push({
      value: key,
      qtyAvailable: 1,
      qtySold: 0,
      soldToSellerIds: []
    });
    product.totalQtyAvailable += 1;
  }

  await product.save();
  res.status(201).json({ product });
}

async function listSellers(req, res) {
  const sellers = await User.find({ role: "seller" })
    .select("-passwordHash")
    .sort({ createdAt: -1 })
    .lean();
  
  const transformed = sellers.map((seller) => ({
    _id: seller._id,
    email: seller.email,
    role: seller.role,
    wallet: seller.walletBalance || 0,
    createdAt: seller.createdAt
  }));
  
  res.json(transformed);
}

module.exports = {
  createSeller,
  createCategory,
  listCategories,
  createProduct,
  listProducts,
  addInventory,
  listSellers
};


