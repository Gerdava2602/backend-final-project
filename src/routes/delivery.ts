import { Router } from "express";
import { createDelivery, getDeliveries, getDelivery, updateDelivery } from "../controllers/Delivery";

const router = Router();

router.get("/", getDeliveries)
router.get("/:id", getDelivery)
router.post("/", createDelivery)
router.put("/:id", updateDelivery)

export default router;
