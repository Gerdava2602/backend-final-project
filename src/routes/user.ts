import { Router } from "express";
import {
  deleteUser,
  getUser,
  login,
  signup,
  updateUser,
} from "../controllers/user";
import { verifyToken } from "../utils/jwt";

const router = Router();

router.get("/:id", getUser);
router.post("/signup", signup);
router.post("/login", login);
router.put("/:id", [verifyToken],updateUser);
router.delete("/:id", [verifyToken],deleteUser);

export default router;
