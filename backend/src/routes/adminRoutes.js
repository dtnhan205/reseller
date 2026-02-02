const express = require("express");
const { requireRole } = require("../middleware/auth");
const {
  createSeller,
  listSellers,
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
  getBankAccounts,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  getExchangeRate,
  updateExchangeRate,
  getResetRequests,
  approveResetRequest,
  rejectResetRequest,
  getAllOrders,
} = require("../controllers/adminController");

const router = express.Router();

router.use(requireRole("admin"));

router.post("/sellers", createSeller);
router.get("/sellers", listSellers);
router.get("/sellers/:id/topup-history", getSellerTopupHistory);
router.post("/sellers/:id/topup", manualTopupSeller);

router.post("/categories", createCategory);
router.get("/categories", listCategories);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

router.post("/products", createProduct);
router.get("/products", listProducts);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);
router.post("/products/:productId/inventory", addInventory);
router.get("/products/:id/keys", getProductKeys);

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

    // Orders history management
    router.get("/orders", getAllOrders);

    module.exports = { adminRouter: router };


