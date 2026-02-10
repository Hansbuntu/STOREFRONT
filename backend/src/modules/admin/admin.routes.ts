import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../../middleware/auth";
import { requireAdmin } from "../../middleware/rbac";
import {
  listSellers,
  getSeller,
  approveSeller,
  rejectSeller,
  pauseListing,
  enableListing,
  listAdminActions,
  listAdminListings,
} from "./admin.controller";

const router = Router();

const adminLimiter = rateLimit({
  windowMs: 60_000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

router.use(adminLimiter);

router.get("/sellers", requireAuth, requireAdmin, listSellers);
router.get("/sellers/:userId", requireAuth, requireAdmin, getSeller);
router.patch("/sellers/:userId/approve", requireAuth, requireAdmin, approveSeller);
router.patch("/sellers/:userId/reject", requireAuth, requireAdmin, rejectSeller);

router.get("/actions", requireAuth, requireAdmin, listAdminActions);
router.get("/listings", requireAuth, requireAdmin, listAdminListings);

router.patch("/listings/:id/pause", requireAuth, requireAdmin, pauseListing);
router.patch("/listings/:id/enable", requireAuth, requireAdmin, enableListing);

export default router;
