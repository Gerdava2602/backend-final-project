import { Router } from "express";
import {
  getProducts,
  getProduct,
  userCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product";
const router = Router();

router.get("/", getProducts);
router.get("/:id", getProduct);
router.get("/categories", userCategories);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;