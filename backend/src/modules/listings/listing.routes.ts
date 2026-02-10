import { Router } from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import * as ListingController from "./listing.controller";
import { requireAuth } from "../../middleware/auth";
import { requireVerifiedSellerOrAdmin } from "../../middleware/requireVerifiedSellerOrAdmin";
import { rateLimit } from "../../middleware/rateLimit";

const router = Router();

router.get("/", ListingController.list);
router.get("/:id", ListingController.getById);
router.post("/", requireAuth, requireVerifiedSellerOrAdmin, ListingController.create);
router.patch("/:id", requireAuth, ListingController.update);
router.delete("/:id", requireAuth, ListingController.remove);

const uploadsRoot = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(__dirname, "../../../uploads");
const uploadsDir = path.join(uploadsRoot, "listings");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const listingId = req.params.id;
    const listingDir = path.join(uploadsDir, listingId);
    fs.mkdirSync(listingDir, { recursive: true });
    cb(null, listingDir);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${timestamp}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error("Unsupported file type"));
  },
});

router.post(
  "/:id/images",
  requireAuth,
  rateLimit({ windowMs: 60000, max: 10 }),
  upload.array("images", 5),
  ListingController.addImages
);

router.delete(
  "/:id/images/:imageId",
  requireAuth,
  rateLimit({ windowMs: 60000, max: 30 }),
  ListingController.removeImage
);

router.delete(
  "/:id/images",
  requireAuth,
  rateLimit({ windowMs: 60000, max: 10 }),
  ListingController.clearImages
);

export default router;
