const mongoose = require("mongoose");
const { HttpError } = require("../utils/httpError");
const { User } = require("../models/User");
const { Product } = require("../models/Product");
const { SellerProductPrice } = require("../models/SellerProductPrice");
const { HackStatus } = require("../models/HackStatus");
const { Order } = require("../models/Order");
const { TopupTransaction } = require("../models/TopupTransaction");
const { Payment } = require("../models/Payment");
const { BankAccount } = require("../models/BankAccount");
const { ExchangeRate } = require("../models/ExchangeRate");
const { ResetRequest } = require("../models/ResetRequest");
const { ProxyVipRequest } = require("../models/ProxyVipRequest");
const { generateTransferContent } = require("../controllers/adminController");
const { createProxyVipLicenseKey, deriveDurationFromProductName, deriveSourceFromProductName } = require("../services/proxyVipKeyService");

async function topupWallet(req, res) {
  const { amountUSD } = req.body || {};
  const numUSD = Number(amountUSD);
  if (!Number.isFinite(numUSD) || numUSD <= 0) throw new HttpError(400, "Invalid amount");

  // Lấy tỷ giá hiện tại
  const exchangeRate = await ExchangeRate.getRate();
  const amountVND = Math.round(numUSD * exchangeRate.usdToVnd);

  const user = await User.findById(req.user._id);
  if (!user) throw new HttpError(404, "User not found");
  if (user.role !== "seller") throw new HttpError(403, "Only seller can topup");

  // Kiểm tra số lượng đơn chưa thanh toán (pending)
  const pendingPayments = await Payment.countDocuments({
    sellerId: req.user._id,
    status: "pending",
  });

  if (pendingPayments >= 3) {
    throw new HttpError(400, "Bạn đã có 3 đơn chưa thanh toán. Vui lòng thanh toán hoặc xóa đơn cũ trước khi tạo đơn mới.");
  }

  // Kiểm tra chống spam: không cho tạo payment mới nếu đã tạo payment PENDING trong 5 phút gần đây
  const fiveMinutesAgo = new Date();
  fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

  const recentPendingPayment = await Payment.findOne({
    sellerId: req.user._id,
    status: "pending",
    createdAt: { $gte: fiveMinutesAgo },
  }).sort({ createdAt: -1 });

  if (recentPendingPayment) {
    const paymentTime = new Date(recentPendingPayment.createdAt);
    const fiveMinutesAfterPayment = new Date(paymentTime.getTime() + 5 * 60000);
    const now = new Date();
    const timeRemainingMs = fiveMinutesAfterPayment.getTime() - now.getTime();

    if (timeRemainingMs > 0) {
      const timeRemainingSeconds = Math.ceil(timeRemainingMs / 1000);
      const timeRemainingMinutes = Math.ceil(timeRemainingMs / 60000);
      throw new HttpError(429, `Bạn đã tạo hóa đơn chưa thanh toán gần đây. Vui lòng đợi ${timeRemainingMinutes} phút nữa hoặc thanh toán/xóa đơn cũ trước khi tạo hóa đơn mới.`);
    }
  }

  // Lấy tài khoản ngân hàng active
  const bankAccount = await BankAccount.findOne({ isActive: true });
  if (!bankAccount) {
    throw new HttpError(404, "Hiện tại không có tài khoản ngân hàng nào hoạt động.");
  }

  // Tạo mã nội dung chuyển khoản unique
  const transferContent = await generateTransferContent();

  // Tạo payment
  const payment = await Payment.create({
    sellerId: user._id,
    amount: amountVND, // Lưu VNĐ để tương thích với code cũ
    amountUSD: numUSD,
    amountVND: amountVND,
    transferContent,
    bankAccountId: bankAccount._id,
  });

  // Populate bank account để trả về thông tin đầy đủ
  await payment.populate("bankAccountId");

  res.status(201).json(payment);
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
      if (product.proxyvip === 1) {
        throw new HttpError(400, "Cannot purchase Proxy VIP product via this endpoint");
      }

      // Nếu có giá riêng cho seller này thì dùng, không thì dùng giá chung
      const override = await SellerProductPrice.findOne({
        sellerId: seller._id,
        productId: product._id,
      }).session(session);

      const price = override ? override.price : product.price;
      if (seller.walletBalance < price) throw new HttpError(400, "Insufficient wallet balance");

      const idx = product.inventory.findIndex((it) => it.qtyAvailable > 0);
      if (idx === -1) throw new HttpError(400, "Out of stock");

      const inv = product.inventory[idx];
      const keyValue = inv.value; // Lưu key value trước khi xóa
      
      inv.qtyAvailable -= 1;
      inv.qtySold += 1;
      inv.soldToSellerIds.push(seller._id);

      // Nếu key đã hết (qtyAvailable = 0) thì xóa khỏi inventory
      if (inv.qtyAvailable === 0) {
        product.inventory.splice(idx, 1);
      }

      product.totalQtyAvailable = Math.max(0, (product.totalQtyAvailable || 0) - 1);
      product.totalQtySold = (product.totalQtySold || 0) + 1;

      seller.walletBalance -= price;

      createdOrder = await Order.create(
        [
          {
            sellerId: seller._id,
            productId: product._id,
            productName: product.name,
            keyValue: keyValue,
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
    const order = createdOrder?.[0];
    
    // Transform order to match frontend format
    const transformedOrder = order ? {
      _id: order._id,
      product: order.productId,
      productName: order.productName,
      key: order.keyValue, // Transform keyValue to key for frontend
      price: order.price,
      seller: order.sellerId,
      createdAt: order.purchasedAt || order.createdAt,
    } : null;
    
    res.status(201).json({ 
      order: transformedOrder,
      newBalance: updatedSeller?.walletBalance || 0
    });
  } finally {
    session.endSession();
  }
}

// Seller: mua Proxy VIP -> tạo license key ngay (không cần ID game)
async function createProxyVipRequest(req, res) {
  const { productId } = req.body || {};

  if (!productId) {
    throw new HttpError(400, "Missing productId");
  }

  const session = await mongoose.startSession();
  try {
    let createdRequest;
    let createdOrder;
    let createdLicenseKey;
    let licenseDuration;
    let licenseSource;

    await session.withTransaction(async () => {
      const seller = await User.findById(req.user._id).session(session);
      if (!seller) throw new HttpError(404, "Seller not found");
      if (seller.role !== "seller") throw new HttpError(403, "Only seller can create proxy vip request");

      const product = await Product.findById(productId).session(session);
      if (!product) throw new HttpError(404, "Product not found");
      if (product.proxyvip !== 1) {
        throw new HttpError(400, "Product is not Proxy VIP");
      }

      const override = await SellerProductPrice.findOne({
        sellerId: seller._id,
        productId: product._id,
      }).session(session);

      const price = override ? override.price : product.price;
      if (seller.walletBalance < price) throw new HttpError(400, "Insufficient wallet balance");

      // Create license key from key-server BEFORE charging, so if it fails the transaction aborts.
      const allowedDurations = new Set(["1h", "2h", "1d", "1w", "1m", "1y"]);
      const allowedSources = new Set(["v1", "v2", "v3"]);
      licenseDuration = product.proxyvipConfig?.duration
        ? String(product.proxyvipConfig.duration).trim().toLowerCase()
        : deriveDurationFromProductName(product.name);
      if (!allowedDurations.has(licenseDuration)) {
        licenseDuration = "1m";
      }
      licenseSource = product.proxyvipConfig?.source
        ? String(product.proxyvipConfig.source).trim().toLowerCase()
        : deriveSourceFromProductName(product.name);
      if (!allowedSources.has(licenseSource)) {
        licenseSource = "v1";
      }
      createdLicenseKey = await createProxyVipLicenseKey(licenseDuration, licenseSource);

      seller.walletBalance -= price;
      product.totalQtySold = (product.totalQtySold || 0) + 1;

      createdOrder = await Order.create(
        [
          {
            sellerId: seller._id,
            productId: product._id,
            productName: product.name,
            keyValue: createdLicenseKey, // lưu key vào lịch sử mua
            price,
            purchasedAt: new Date(),
          },
        ],
        { session }
      );

      createdRequest = await ProxyVipRequest.create(
        [
          {
            sellerId: seller._id,
            productId: product._id,
            status: "processed",
            processedAt: new Date(),
            licenseKey: createdLicenseKey,
            licenseDuration: licenseDuration,
            licenseSource: licenseSource,
          },
        ],
        { session }
      );

      await product.save({ session });
      await seller.save({ session });
    });

    const updatedSeller = await User.findById(req.user._id);
    const request = createdRequest?.[0];
    const order = createdOrder?.[0];

    const transformedOrder = order
      ? {
          _id: order._id,
          product: order.productId,
          productName: order.productName,
          key: order.keyValue,
          price: order.price,
          seller: order.sellerId,
          createdAt: order.purchasedAt || order.createdAt,
        }
      : null;

    res.status(201).json({
      request: request
        ? {
            _id: request._id,
            sellerId: request.sellerId,
            productId: request.productId,
            status: request.status,
            createdAt: request.createdAt,
            licenseKey: request.licenseKey,
            licenseDuration: request.licenseDuration,
            licenseSource: request.licenseSource,
          }
        : null,
      order: transformedOrder,
      newBalance: updatedSeller?.walletBalance || 0,
    });
  } finally {
    session.endSession();
  }
}

async function listOrders(req, res) {
  if (req.user.role !== "seller") throw new HttpError(403, "Only seller");
  const orders = await Order.find({ sellerId: req.user._id })
    .populate("productId", "proxyvip name")
    .sort({ purchasedAt: -1 })
    .lean();
  
  // Lấy tất cả ProxyVipRequest của seller này để map với orders
  const ProxyVipRequest = require("../models/ProxyVipRequest").ProxyVipRequest;
  const proxyVipRequests = await ProxyVipRequest.find({ sellerId: req.user._id })
    .sort({ createdAt: -1 })
    .lean();
  
  // Map request mới nhất theo productId + licenseKey (order.keyValue giờ lưu licenseKey)
  // Key format: `${productId}_${licenseKey}`
  const proxyVipRequestMap = new Map();
  proxyVipRequests.forEach((req) => {
    const licKey = req.licenseKey || "";
    const key = `${req.productId.toString()}_${licKey}`;
    // Chỉ lưu request mới nhất cho mỗi key
    if (!proxyVipRequestMap.has(key)) {
      proxyVipRequestMap.set(key, req);
    }
  });
  
  // Transform để match frontend format
  const transformed = orders.map((o) => {
    const product = o.productId;
    const isProxyVip = product && product.proxyvip === 1;
    let proxyvipStatus = null;
    
    if (isProxyVip) {
      // Tìm ProxyVipRequest tương ứng với order này (match theo licenseKey)
      const key = `${product._id.toString()}_${o.keyValue}`;
      const proxyVipReq = proxyVipRequestMap.get(key);
      if (proxyVipReq) {
        proxyvipStatus = proxyVipReq.status; // "pending" hoặc "processed"
      } else {
        // Nếu không tìm thấy request, mặc định là pending
        proxyvipStatus = "pending";
      }
    }
    
    return {
      _id: o._id,
      product: o.productId,
      productName: o.productName,
      key: o.keyValue,
      price: o.price,
      seller: o.sellerId,
      createdAt: o.purchasedAt || o.createdAt,
      proxyvipStatus: proxyvipStatus, // null nếu không phải Proxy VIP, "pending" hoặc "processed" nếu là Proxy VIP
    };
  });
  res.json(transformed);
}

async function getProducts(req, res) {
  try {
    console.log('Seller getProducts: User:', req.user?.email, 'Role:', req.user?.role);
    // Chỉ select các field cần thiết, loại bỏ inventory để bảo mật
    let products = await Product.find({ $or: [{ status: "active" }, { status: { $exists: false } }, { status: null }] })
      .select('-inventory') // Loại bỏ inventory để không trả về keys
      .populate("categoryId", "name slug image status")
      .sort({ createdAt: -1 })
      .lean();

    products = products.filter(
      (p) => !(p.categoryId && p.categoryId.status === "inactive")
    );
    
    console.log('Seller getProducts: Found', products.length, 'products in database');

    // Lấy danh sách giá riêng cho seller hiện tại (nếu có)
    const productIds = products.map((p) => p._id);
    const overrides = await SellerProductPrice.find({
      sellerId: req.user._id,
      productId: { $in: productIds },
    })
      .lean();

    const overrideMap = new Map(
      overrides.map((o) => [String(o.productId), o.price])
    );
    
    // Transform để match frontend format - đảm bảo không có inventory
    const transformed = products.map((p) => ({
      _id: p._id,
      name: p.name,
      slug: p.slug,
      // Nếu có giá override cho seller thì dùng, không thì dùng giá chung
      price: overrideMap.get(String(p._id)) ?? p.price,
      category: p.categoryId || null, // Map categoryId to category for frontend, handle null
      remainingQuantity: p.totalQtyAvailable || 0,
      soldQuantity: p.totalQtySold || 0,
      createdAt: p.createdAt,
      proxyvip: p.proxyvip ?? null,
      proxyvipConfig: p.proxyvipConfig || null,
      status: p.status || "active",
      // KHÔNG bao gồm inventory để bảo mật
    }));
    
    console.log('Seller getProducts: Returning', transformed.length, 'products');
    console.log('Seller getProducts: Sample product:', transformed[0] || 'No products');
    
    res.json(transformed);
  } catch (error) {
    console.error('Seller getProducts error:', error);
    console.error('Error stack:', error.stack);
    throw new HttpError(500, `Failed to fetch products: ${error.message}`);
  }
}

async function getTopupHistory(req, res) {
  if (req.user.role !== "seller") throw new HttpError(403, "Only seller");
  
  // Lấy cả TopupTransaction (cũ) và Payment (mới)
  const [oldTransactions, payments] = await Promise.all([
    TopupTransaction.find({ sellerId: req.user._id })
      .sort({ createdAt: -1 })
      .lean(),
    Payment.find({ sellerId: req.user._id })
      .populate("bankAccountId")
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  // Transform để match frontend format
  const oldTransformed = oldTransactions.map((t) => ({
    _id: t._id,
    seller: t.sellerId,
    amount: t.amount, // VND (backward compatibility)
    amountUSD: t.amountUSD || (t.amount / 25000), // USD - fallback nếu không có
    createdAt: t.createdAt,
    type: "manual", // Đánh dấu là nạp thủ công (cũ)
  }));

  const paymentTransformed = payments.map((p) => ({
    _id: p._id,
    seller: p.sellerId,
    amount: p.amount, // VND (backward compatibility)
    amountUSD: p.amountUSD != null ? p.amountUSD : p.amount / 25000, // USD (âm = admin trừ tiền)
    createdAt: p.createdAt,
    type: "payment", // Đánh dấu là payment (mới)
    transferContent: p.transferContent,
    status: p.status,
    bankAccount: p.bankAccountId,
    expiresAt: p.expiresAt,
    completedAt: p.completedAt,
  }));

  // Gộp và sắp xếp theo thời gian
  const allTransactions = [...oldTransformed, ...paymentTransformed].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  res.json(allTransactions);
}

// GET /api/payments - Seller: Xem danh sách payments
async function getPayments(req, res) {
  if (req.user.role !== "seller") throw new HttpError(403, "Only seller");
  const payments = await Payment.find({ sellerId: req.user._id })
    .populate("bankAccountId")
    .sort({ createdAt: -1 })
    .lean();
  res.json(payments);
}

// GET /api/payments/:id - Seller: Xem chi tiết payment
async function getPaymentDetail(req, res) {
  if (req.user.role !== "seller") throw new HttpError(403, "Only seller");
  const { id } = req.params;
  const payment = await Payment.findOne({
    _id: id,
    sellerId: req.user._id,
  }).populate("bankAccountId");

  if (!payment) {
    throw new HttpError(404, "Không tìm thấy hóa đơn.");
  }

  res.json(payment);
}

// DELETE /api/payments/:id - Seller: Xóa payment (chỉ được xóa đơn pending)
async function deletePayment(req, res) {
  if (req.user.role !== "seller") throw new HttpError(403, "Only seller");
  const { id } = req.params;
  const payment = await Payment.findOne({
    _id: id,
    sellerId: req.user._id,
  });

  if (!payment) {
    throw new HttpError(404, "Không tìm thấy hóa đơn.");
  }

  // Chỉ cho phép xóa đơn pending hoặc expired
  if (payment.status === "completed") {
    throw new HttpError(400, "Không thể xóa đơn đã thanh toán.");
  }

  await Payment.findByIdAndDelete(id);
  res.json({ message: "Đã xóa hóa đơn thành công." });
}

// GET /api/exchange-rate - Public: Lấy tỷ giá hiện tại
async function getExchangeRate(req, res) {
  const rate = await ExchangeRate.getRate();
  res.json({ usdToVnd: rate.usdToVnd });
}

// ---- Hack Status (Seller) ----

// GET /api/hacks - seller: list all hacks
async function listHacks(req, res) {
  const hacks = await HackStatus.find().sort({ createdAt: -1 }).lean();
  res.json(hacks);
}

// GET /api/hacks/:id - seller: hack detail
async function getHackDetail(req, res) {
  const { id } = req.params;
  const hack = await HackStatus.findById(id).lean();
  if (!hack) throw new HttpError(404, "Hack not found");
  res.json(hack);
}

// POST /api/reset-request - Seller: Tạo yêu cầu reset key
async function createResetRequest(req, res) {
  const { orderId } = req.body || {};
  if (!orderId) throw new HttpError(400, "Missing orderId");

  if (req.user.role !== "seller") throw new HttpError(403, "Only seller can request reset");

  // Lấy order và populate product để lấy category
  const order = await Order.findById(orderId)
    .populate({
      path: "productId",
      populate: { path: "categoryId", select: "name" },
    })
    .lean();

  if (!order) throw new HttpError(404, "Order not found");
  if (order.sellerId.toString() !== req.user._id.toString()) {
    throw new HttpError(403, "You can only request reset for your own orders");
  }

  // Kiểm tra xem đã có request pending chưa
  const existingRequest = await ResetRequest.findOne({
    orderId: order._id,
    status: "pending",
  });

  if (existingRequest) {
    throw new HttpError(400, "You already have a pending reset request for this order");
  }

  // Giới hạn tối đa 3 lần reset đã duyệt cho mỗi order
  const approvedResetCount = await ResetRequest.countDocuments({
    orderId: order._id,
    status: "approved",
  });

  if (approvedResetCount >= 3) {
    throw new HttpError(400, "Reset limit reached (maximum 3 times)");
  }

  // Lấy category name
  const categoryName =
    order.productId?.categoryId?.name || "Unknown Category";

  // Tạo reset request
  const resetRequest = await ResetRequest.create({
    orderId: order._id,
    sellerId: req.user._id,
    categoryName,
    productName: order.productName,
    key: order.keyValue,
    requestedBy: req.user.email,
  });

  res.status(201).json(resetRequest);
}

// GET /api/reset-requests - Seller: Xem danh sách yêu cầu reset của mình
async function getResetRequests(req, res) {
  if (req.user.role !== "seller") throw new HttpError(403, "Only seller");

  const requests = await ResetRequest.find({ sellerId: req.user._id })
    .populate("orderId", "productName keyValue")
    .sort({ createdAt: -1 })
    .lean();

  res.json(requests);
}

module.exports = { 
  topupWallet, 
  purchase, 
  listOrders, 
  getProducts, 
  getTopupHistory,
  getPayments,
  getPaymentDetail,
  deletePayment,
  getExchangeRate,
  listHacks,
  getHackDetail,
  createResetRequest,
  getResetRequests,
  createProxyVipRequest,
};


