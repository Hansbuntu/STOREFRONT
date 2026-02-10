import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requireDemoMode } from "../../middleware/demoMode";
import { demoCheckout } from "./orders.controller";

const router = Router();

router.post("/checkout", requireAuth, requireDemoMode, demoCheckout);

export default router;
