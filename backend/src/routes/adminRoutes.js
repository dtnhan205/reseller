const express = require("express");
const { requireRole } = require("../middleware/auth");
const {
  createSeller,
  listSellers,
  createCategory,
  listCategories,
  createProduct,
  listProducts,
  addInventory
} = require("../controllers/adminController");

const router = express.Router();

router.use(requireRole("admin"));

router.post("/sellers", createSeller);
router.get("/sellers", listSellers);

router.post("/categories", createCategory);
router.get("/categories", listCategories);

router.post("/products", createProduct);
router.get("/products", listProducts);
router.post("/products/:productId/inventory", addInventory);

module.exports = { adminRouter: router };


