const express = require("express");
const { requireRole } = require("../middleware/auth");
const { 
  topupWallet, 
  purchase, 
  listOrders, 
  getProducts, 
  getTopupHistory,
  getPayments,
  getPaymentDetail,
  deletePayment,
  getExchangeRate,
  createResetRequest,
  getResetRequests,
} = require("../controllers/sellerController");

const router = express.Router();

// Public route - Exchange rate
router.get("/exchange-rate", getExchangeRate);

router.post("/wallet/topup", requireRole("seller"), topupWallet);
router.get("/wallet/topup-history", requireRole("seller"), getTopupHistory);
router.post("/purchase", requireRole("seller"), purchase);
router.get("/orders", requireRole("seller"), listOrders);
router.get("/products", requireRole("seller"), getProducts);

// Payment routes
router.get("/payments", requireRole("seller"), getPayments);
router.get("/payments/:id", requireRole("seller"), getPaymentDetail);
router.delete("/payments/:id", requireRole("seller"), deletePayment);

// Reset requests
router.post("/reset-request", requireRole("seller"), createResetRequest);
router.get("/reset-requests", requireRole("seller"), getResetRequests);

module.exports = { sellerRouter: router };


