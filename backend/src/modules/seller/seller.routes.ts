import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requireSeller } from "../../middleware/rbac";
import { rateLimit } from "../../middleware/rateLimit";
import {
  becomeSeller,
  getProfile,
  updateProfile,
  submitProfile,
  getSellerStatus,
} from "./seller.controller";

const router = Router();

router.post("/become", requireAuth, rateLimit({ windowMs: 60000, max: 10 }), becomeSeller);
router.get("/profile/me", requireAuth, requireSeller, getProfile);
router.put("/profile/me", requireAuth, requireSeller, updateProfile);
router.post(
  "/profile/submit",
  requireAuth,
  requireSeller,
  rateLimit({ windowMs: 60000, max: 5 }),
  submitProfile
);
router.get("/status", requireAuth, getSellerStatus);

export default router;
