import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as AuthController from "./auth.controller";
import { requireAuth } from "../../middleware/auth";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

const phoneStartLimiter = rateLimit({
  windowMs: 60_000,
  limit: 3,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

const phoneVerifyLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});


router.post("/register", authLimiter, AuthController.register);
router.post("/login", authLimiter, AuthController.login);
router.get("/me", requireAuth, AuthController.me);
router.post(
  "/email/start",
  requireAuth,
  AuthController.startEmailVerification
);
router.get("/email/verify", AuthController.verifyEmail);
router.post(
  "/phone/start",
  requireAuth,
  phoneStartLimiter,
  AuthController.startPhoneVerification
);
router.post(
  "/phone/verify",
  requireAuth,
  phoneVerifyLimiter,
  AuthController.verifyPhoneOtp
);

export default router;
