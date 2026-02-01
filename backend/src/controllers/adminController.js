const mongoose = require("mongoose");
const { HttpError } = require("../utils/httpError");
const { slugify } = require("../utils/slugify");
const { signToken } = require("../utils/jwt");
const { User } = require("../models/User");
const { Category } = require("../models/Category");
const { Product } = require("../models/Product");
const { BankAccount } = require("../models/BankAccount");
const { ExchangeRate } = require("../models/ExchangeRate");
const { Payment } = require("../models/Payment");
const { ResetRequest } = require("../models/ResetRequest");

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
  const { name, slug, image } = req.body || {};
  if (!name) throw new HttpError(400, "Missing name");
  const finalSlug = slug ? slugify(slug) : slugify(name);
  if (!finalSlug) throw new HttpError(400, "Invalid slug");

  const exists = await Category.findOne({ slug: finalSlug }).lean();
  if (exists) {
    throw new HttpError(409, `Category "${exists.name}" already exists with slug "${finalSlug}"`);
  }

  const categoryData = { name: String(name).trim(), slug: finalSlug };
  if (image) {
    categoryData.image = String(image).trim();
  }

  const category = await Category.create(categoryData);
  res.status(201).json({ category });
}

async function listCategories(req, res) {
  const categories = await Category.find().sort({ createdAt: -1 }).lean();
  res.json(categories);
}

async function updateCategory(req, res) {
  const { id } = req.params;
  const { name, image } = req.body || {};
  
  const category = await Category.findById(id);
  if (!category) throw new HttpError(404, "Category not found");

  if (name) {
    const finalSlug = slugify(name);
    if (!finalSlug) throw new HttpError(400, "Invalid slug");
    
    // Check if slug already exists for another category
    const exists = await Category.findOne({ slug: finalSlug, _id: { $ne: id } }).lean();
    if (exists) {
      throw new HttpError(409, `Category "${exists.name}" already exists with slug "${finalSlug}"`);
    }
    
    category.name = String(name).trim();
    category.slug = finalSlug;
  }
  
  if (image !== undefined) {
    category.image = image ? String(image).trim() : undefined;
  }

  await category.save();
  res.json(category);
}

async function deleteCategory(req, res) {
  const { id } = req.params;
  
  const category = await Category.findById(id);
  if (!category) throw new HttpError(404, "Category not found");

  // Check if any products are using this category
  const productsCount = await Product.countDocuments({ categoryId: id });
  if (productsCount > 0) {
    throw new HttpError(400, `Cannot delete category. ${productsCount} product(s) are using this category.`);
  }

  await Category.findByIdAndDelete(id);
  res.json({ message: "Category deleted successfully" });
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
  // Chỉ select các field cần thiết, loại bỏ inventory để bảo mật
  const products = await Product.find()
    .select('-inventory') // Loại bỏ inventory để không trả về keys
    .populate("categoryId", "name slug image")
    .sort({ createdAt: -1 })
    .lean();
  // Transform để match frontend format - đảm bảo không có inventory
  const transformed = products.map((p) => ({
    _id: p._id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    category: p.categoryId,
    remainingQuantity: p.totalQtyAvailable || 0,
    soldQuantity: p.totalQtySold || 0,
    createdAt: p.createdAt,
    // KHÔNG bao gồm inventory để bảo mật
  }));
  res.json(transformed);
}

async function updateProduct(req, res) {
  const { id } = req.params;
  const { name, price, categoryId } = req.body || {};
  
  const product = await Product.findById(id);
  if (!product) throw new HttpError(404, "Product not found");

  if (name) {
    const finalSlug = slugify(name);
    if (!finalSlug) throw new HttpError(400, "Invalid slug");
    
    // Check if slug already exists for another product
    const exists = await Product.findOne({ slug: finalSlug, _id: { $ne: id } }).lean();
    if (exists) throw new HttpError(409, "Product slug already exists");
    
    product.name = String(name).trim();
    product.slug = finalSlug;
  }
  
  if (price != null) {
    product.price = Number(price);
  }
  
  if (categoryId) {
    const category = await Category.findById(categoryId).lean();
    if (!category) throw new HttpError(404, "Category not found");
    product.categoryId = new mongoose.Types.ObjectId(categoryId);
  }

  await product.save();
  
  // Populate category for response
  await product.populate("categoryId", "name slug image");
  
  // Transform to match frontend format
  res.json({
    _id: product._id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    category: product.categoryId,
    remainingQuantity: product.totalQtyAvailable || 0,
    soldQuantity: product.totalQtySold || 0,
    createdAt: product.createdAt,
  });
}

async function deleteProduct(req, res) {
  const { id } = req.params;
  
  const product = await Product.findById(id);
  if (!product) throw new HttpError(404, "Product not found");

  // Check if product has been sold
  if (product.totalQtySold > 0) {
    throw new HttpError(400, `Cannot delete product. ${product.totalQtySold} item(s) have been sold.`);
  }

  await Product.findByIdAndDelete(id);
  res.json({ message: "Product deleted successfully" });
}

async function getProductKeys(req, res) {
  const { id } = req.params;
  
  const product = await Product.findById(id).lean();
  if (!product) throw new HttpError(404, "Product not found");

  // Chỉ trả về các keys còn lại (qtyAvailable > 0)
  const availableKeys = (product.inventory || [])
    .filter(item => item.qtyAvailable > 0)
    .map(item => ({
      _id: item._id,
      value: item.value,
      qtyAvailable: item.qtyAvailable,
      createdAt: item.createdAt
    }));

  res.json({
    productId: product._id,
    productName: product.name,
    totalAvailable: product.totalQtyAvailable || 0,
    keys: availableKeys
  });
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
  
  // Tính tổng nạp tiền cho mỗi seller
  const sellersWithStats = await Promise.all(
    sellers.map(async (seller) => {
      const totalTopup = await Payment.aggregate([
        { $match: { sellerId: seller._id, status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amountUSD" } } }
      ]);
      
      const totalTopupAmount = totalTopup.length > 0 ? totalTopup[0].total : 0;
      
      return {
        _id: seller._id,
        email: seller.email,
        role: seller.role,
        wallet: seller.walletBalance || 0,
        totalTopup: totalTopupAmount,
        createdAt: seller.createdAt
      };
    })
  );
  
  res.json(sellersWithStats);
}

// GET /api/admin/sellers/:id/topup-history - Admin: Xem lịch sử nạp tiền của seller
async function getSellerTopupHistory(req, res) {
  const { id } = req.params;
  
  const seller = await User.findById(id);
  if (!seller) throw new HttpError(404, "Seller not found");
  if (seller.role !== "seller") throw new HttpError(400, "User is not a seller");
  
  const payments = await Payment.find({ sellerId: id })
    .populate("bankAccountId", "bankName accountNumber accountHolder")
    .sort({ createdAt: -1 })
    .lean();
  
  res.json(payments);
}

// POST /api/admin/sellers/:id/topup - Admin: Nạp tiền thủ công cho seller
async function manualTopupSeller(req, res) {
  const { id } = req.params;
  const { amountUSD, note } = req.body || {};
  
  const numUSD = Number(amountUSD);
  if (!Number.isFinite(numUSD) || numUSD <= 0) {
    throw new HttpError(400, "Invalid amount");
  }
  
  const seller = await User.findById(id);
  if (!seller) throw new HttpError(404, "Seller not found");
  if (seller.role !== "seller") throw new HttpError(400, "User is not a seller");
  
  // Cập nhật số dư wallet
  seller.walletBalance = (seller.walletBalance || 0) + numUSD;
  await seller.save();
  
  // Tạo payment record để lưu lịch sử (status: completed, không cần bank account)
  const payment = await Payment.create({
    sellerId: seller._id,
    amount: 0, // Không có VND cho manual topup
    amountUSD: numUSD,
    amountVND: 0,
    transferContent: `ADMIN_TOPUP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    bankAccountId: null, // Không có bank account cho manual topup
    status: "completed",
    completedAt: new Date(),
    expiresAt: new Date(), // Set ngay để không bị xóa
    note: note || "Manual topup by admin",
  });
  
  res.status(201).json({
    payment,
    newBalance: seller.walletBalance,
    message: `Successfully topped up ${numUSD} USD to seller ${seller.email}`
  });
}

// Helper: Tạo mã nội dung chuyển khoản unique (dtnxxxxx)
async function generateTransferContent() {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
    const transferContent = `dtn${randomNum}`;

    const { Payment } = require("../models/Payment");
    const existing = await Payment.findOne({ transferContent });
    if (!existing) {
      return transferContent;
    }

    attempts++;
  }

  throw new HttpError(500, "Không thể tạo mã nội dung chuyển khoản duy nhất.");
}

// GET /api/admin/bank-accounts - Admin: Lấy danh sách tài khoản ngân hàng
async function getBankAccounts(req, res) {
  const accounts = await BankAccount.find({}).sort({ createdAt: -1 });
  res.json(accounts);
}

// POST /api/admin/bank-accounts - Admin: Thêm tài khoản ngân hàng
async function createBankAccount(req, res) {
  const { bankName, accountNumber, accountHolder, apiUrl } = req.body || {};
  
  if (!bankName || !accountNumber || !accountHolder) {
    throw new HttpError(400, "Vui lòng điền đầy đủ thông tin.");
  }

  const account = await BankAccount.create({
    bankName: String(bankName).trim(),
    accountNumber: String(accountNumber).trim(),
    accountHolder: String(accountHolder).trim(),
    apiUrl: apiUrl ? String(apiUrl).trim() : "",
  });

  res.status(201).json(account);
}

// PUT /api/admin/bank-accounts/:id - Admin: Cập nhật tài khoản ngân hàng
async function updateBankAccount(req, res) {
  const { id } = req.params;
  const { bankName, accountNumber, accountHolder, apiUrl, isActive } = req.body || {};

  const update = {};
  if (bankName) update.bankName = String(bankName).trim();
  if (accountNumber) update.accountNumber = String(accountNumber).trim();
  if (accountHolder) update.accountHolder = String(accountHolder).trim();
  if (apiUrl !== undefined) update.apiUrl = String(apiUrl).trim();
  if (typeof isActive !== "undefined") update.isActive = Boolean(isActive);

  const account = await BankAccount.findByIdAndUpdate(id, update, { new: true });

  if (!account) {
    throw new HttpError(404, "Không tìm thấy tài khoản ngân hàng.");
  }

  res.json(account);
}

// DELETE /api/admin/bank-accounts/:id - Admin: Xóa tài khoản ngân hàng
async function deleteBankAccount(req, res) {
  const { id } = req.params;
  const account = await BankAccount.findByIdAndDelete(id);

  if (!account) {
    throw new HttpError(404, "Không tìm thấy tài khoản ngân hàng.");
  }

  res.json({ message: "Đã xóa tài khoản ngân hàng." });
}

// GET /api/admin/exchange-rate - Admin: Lấy tỷ giá hiện tại
async function getExchangeRate(req, res) {
  const rate = await ExchangeRate.getRate();
  res.json({ usdToVnd: rate.usdToVnd });
}

// PUT /api/admin/exchange-rate - Admin: Cập nhật tỷ giá
async function updateExchangeRate(req, res) {
  const { usdToVnd } = req.body || {};
  
  if (!usdToVnd || typeof usdToVnd !== "number" || usdToVnd <= 0) {
    throw new HttpError(400, "Tỷ giá phải là số dương.");
  }

  const rate = await ExchangeRate.setRate(usdToVnd);
  res.json({ usdToVnd: rate.usdToVnd });
}

// GET /api/admin/reset-requests - Admin: Xem tất cả yêu cầu reset
async function getResetRequests(req, res) {
  const requests = await ResetRequest.find()
    .populate("sellerId", "email")
    .populate("orderId", "productName keyValue")
    .populate("processedBy", "email")
    .sort({ createdAt: -1 })
    .lean();

  res.json(requests);
}

// PUT /api/admin/reset-requests/:id/approve - Admin: Duyệt yêu cầu reset
async function approveResetRequest(req, res) {
  const { id } = req.params;

  const request = await ResetRequest.findById(id);
  if (!request) throw new HttpError(404, "Reset request not found");

  if (request.status !== "pending") {
    throw new HttpError(400, "Request is not pending");
  }

  request.status = "approved";
  request.processedAt = new Date();
  request.processedBy = req.user._id;
  await request.save();

  res.json(request);
}

// PUT /api/admin/reset-requests/:id/reject - Admin: Từ chối yêu cầu reset
async function rejectResetRequest(req, res) {
  const { id } = req.params;

  const request = await ResetRequest.findById(id);
  if (!request) throw new HttpError(404, "Reset request not found");

  if (request.status !== "pending") {
    throw new HttpError(400, "Request is not pending");
  }

  request.status = "rejected";
  request.processedAt = new Date();
  request.processedBy = req.user._id;
  await request.save();

  res.json(request);
}

module.exports = {
  createSeller,
  createCategory,
  listCategories,
  updateCategory,
  deleteCategory,
  createProduct,
  listProducts,
  updateProduct,
  deleteProduct,
  addInventory,
  getProductKeys,
  listSellers,
  getSellerTopupHistory,
  manualTopupSeller,
  getBankAccounts,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  generateTransferContent,
  getExchangeRate,
  updateExchangeRate,
  getResetRequests,
  approveResetRequest,
  rejectResetRequest,
};


