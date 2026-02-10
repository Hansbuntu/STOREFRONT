import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import {
  listOrders,
  getOrderById,
  submitFulfillment,
  confirmOrder,
  refundOrder,
} from "./orders.controller";

const router = Router();

router.get("/", requireAuth, listOrders);
router.get("/:id", requireAuth, getOrderById);
router.post("/:id/fulfillment", requireAuth, submitFulfillment);
router.post("/:id/confirm", requireAuth, confirmOrder);
router.post("/:id/refund", requireAuth, refundOrder);

export default router;
