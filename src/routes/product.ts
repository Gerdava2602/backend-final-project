import { Router } from "express";
import {
  getProducts,
  getProduct,
  userCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product";
import { verifyToken } from "../utils/jwt";
const router = Router();

router.get("/", getProducts);
router.get("/:id", getProduct);
router.get("/categories/:id", userCategories);
router.post("/", verifyToken, createProduct);
router.put("/:id", verifyToken, updateProduct);
router.delete("/:id", verifyToken, deleteProduct);

export default router;