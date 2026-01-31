const express = require("express");
const { requireRole } = require("../middleware/auth");
const { topupWallet, purchase, listOrders, getProducts, getTopupHistory } = require("../controllers/sellerController");

const router = express.Router();

router.post("/wallet/topup", requireRole("seller"), topupWallet);
router.get("/wallet/topup-history", requireRole("seller"), getTopupHistory);
router.post("/purchase", requireRole("seller"), purchase);
router.get("/orders", requireRole("seller"), listOrders);
router.get("/products", requireRole("seller"), getProducts);

module.exports = { sellerRouter: router };


