const express = require("express");
const { requireRole } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const { uploadVideoOptional } = require("../middleware/uploadVideo");
const {
  createSeller,
  listSellers,
  lockSeller,
  unlockSeller,
  deleteSeller,
  getTopupLeaderboard,
  listSellerProductPrices,
  setSellerProductPrice,
  deleteSellerProductPrice,
  getSellerTopupHistory,
  manualTopupSeller,
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
  deleteInventoryKey,
  getBankAccounts,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  getExchangeRate,
  updateExchangeRate,
  getResetRequests,
  approveResetRequest,
  rejectResetRequest,
  getDashboardStats,
  getAllOrders,
  listHacks,
  createHack,
  updateHack,
  deleteHack,
  uploadImage,
  uploadVideo,
  getProxyVipRequests,
  markProxyVipRequestProcessed,
  getPublicProxyProducts,
} = require("../controllers/adminController");

const router = express.Router();

// Public API - không cần auth (đặt TRƯỚC requireRole)
router.get("/products/proxy-public", getPublicProxyProducts);

// Yêu cầu admin cho các route còn lại
router.use(requireRole("admin"));

// Upload image & video routes
router.post("/upload-image", upload.single('image'), uploadImage);
router.post("/upload-video", uploadVideoOptional, uploadVideo);

// Sellers
router.post("/sellers", createSeller);
router.get("/sellers", listSellers);
router.put("/sellers/:id/lock", lockSeller);
router.put("/sellers/:id/unlock", unlockSeller);
router.delete("/sellers/:id", deleteSeller);
router.get("/sellers/:id/topup-history", getSellerTopupHistory);
router.post("/sellers/:id/topup", manualTopupSeller);

// Leaderboard
router.get("/leaderboard/topup", getTopupLeaderboard);

// Seller specific product prices
router.get("/seller-product-prices", listSellerProductPrices);
router.post("/seller-product-prices", setSellerProductPrice);
router.delete("/seller-product-prices/:id", deleteSellerProductPrice);

// Hack status management
router.get("/hacks", listHacks);
router.post("/hacks", createHack);
router.put("/hacks/:id", updateHack);
router.delete("/hacks/:id", deleteHack);

// Categories
router.post("/categories", createCategory);
router.get("/categories", listCategories);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

// Products
router.post("/products", createProduct);
router.get("/products", listProducts);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);
router.post("/products/:productId/inventory", addInventory);
router.get("/products/:id/keys", getProductKeys);
router.delete("/products/:productId/inventory/:keyId", deleteInventoryKey);

// Bank accounts management
router.get("/bank-accounts", getBankAccounts);
router.post("/bank-accounts", createBankAccount);
router.put("/bank-accounts/:id", updateBankAccount);
router.delete("/bank-accounts/:id", deleteBankAccount);

    // Exchange rate management
    router.get("/exchange-rate", getExchangeRate);
    router.put("/exchange-rate", updateExchangeRate);

    // Reset requests management
    router.get("/reset-requests", getResetRequests);
    router.put("/reset-requests/:id/approve", approveResetRequest);
    router.put("/reset-requests/:id/reject", rejectResetRequest);

    // Dashboard stats
    router.get("/dashboard-stats", getDashboardStats);

    // Orders history management
    router.get("/orders", getAllOrders);

// Proxy VIP requests
router.get("/proxyvip-requests", getProxyVipRequests);
router.put("/proxyvip-requests/:id/process", markProxyVipRequestProcessed);

    module.exports = { adminRouter: router };
