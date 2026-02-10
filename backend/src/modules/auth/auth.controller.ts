import { Request, Response } from "express";
import { ZodError, z } from "zod";
import * as AuthService from "./auth.service";
import { User } from "../../models/User";
import crypto from "crypto";

const emailStartSchema = z.object({});

const phoneStartSchema = z.object({
  phone: z.string().min(7).max(20),
});

const phoneVerifySchema = z.object({
  phone: z.string().min(7).max(20),
  code: z.string().min(4).max(8),
});

const EMAIL_TOKEN_TTL_MINUTES = 15;
const PHONE_OTP_TTL_MINUTES = 10;
const PHONE_OTP_LOCK_MINUTES = 15;
const PHONE_OTP_MAX_ATTEMPTS = 5;
const PHONE_OTP_MIN_RESEND_SECONDS = 60;

function hashValue(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalizePhone(input: string): string | null {
  const trimmed = input.replace(/\s+/g, "");
  if (/^\+?[1-9]\d{7,14}$/.test(trimmed)) {
    return trimmed.startsWith("+") ? trimmed : `+${trimmed}`;
  }
  if (/^0\d{9}$/.test(trimmed)) {
    return `+233${trimmed.slice(1)}`;
  }
  if (/^233\d{9}$/.test(trimmed)) {
    return `+${trimmed}`;
  }
  return null;
}

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

export async function register(req: Request, res: Response) {
  try {
    const result = await AuthService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({
        error: { message: "Validation failed", details: err.flatten() },
      });
      return;
    }
    const status = (err as any).status || 500;
    res.status(status).json({ error: { message: (err as Error).message } });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const result = await AuthService.login(req.body);
    res.json(result);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({
        error: { message: "Validation failed", details: err.flatten() },
      });
      return;
    }
    const status = (err as any).status || 500;
    res.status(status).json({ error: { message: (err as Error).message } });
  }
}

export async function me(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ error: { message: "Unauthorized" } });
    return;
  }

  const user = await User.findByPk(req.user.id);
  if (!user) {
    res.status(404).json({ error: { message: "User not found" } });
    return;
  }

  res.json({ user: AuthService.serializeUser(user) });
}

export async function startEmailVerification(req: Request, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }

    emailStartSchema.parse(req.body);
    const user = await User.findByPk(req.user.id);
    if (!user) {
      res.status(404).json({ error: { message: "User not found" } });
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashValue(token);
    const expiresAt = new Date(
      Date.now() + EMAIL_TOKEN_TTL_MINUTES * 60 * 1000
    );

    user.emailVerificationTokenHash = tokenHash;
    user.emailVerificationExpiresAt = expiresAt;
    await user.save();

    const verificationUrl = `${BASE_URL}/auth/email/verify?token=${token}`;
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log("Email verification URL:", verificationUrl);
    }

    res.json({ ok: true });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({
        error: { message: "Validation failed", details: err.flatten() },
      });
      return;
    }
    const status = (err as any).status || 500;
    res.status(status).json({ error: { message: (err as Error).message } });
  }
}

export async function verifyEmail(req: Request, res: Response) {
  try {
    const token = String(req.query.token || "");
    if (!token) {
      res.status(400).json({ error: { message: "Token required" } });
      return;
    }

    const tokenHash = hashValue(token);
    const now = new Date();

    const user = await User.findOne({
      where: {
        emailVerificationTokenHash: tokenHash,
      },
    });

    if (!user || !user.emailVerificationExpiresAt) {
      res.status(400).json({ error: { message: "Invalid token" } });
      return;
    }

    if (user.emailVerificationExpiresAt.getTime() < now.getTime()) {
      res.status(400).json({ error: { message: "Token expired" } });
      return;
    }

    user.emailVerified = true;
    user.emailVerificationTokenHash = null;
    user.emailVerificationExpiresAt = null;
    await user.save();

    res.json({ ok: true });
  } catch (err) {
    const status = (err as any).status || 500;
    res.status(status).json({ error: { message: (err as Error).message } });
  }
}

export async function startPhoneVerification(req: Request, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }

    const input = phoneStartSchema.parse(req.body);
    const normalized = normalizePhone(input.phone);
    if (!normalized) {
      res.status(400).json({ error: { message: "Invalid phone number" } });
      return;
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      res.status(404).json({ error: { message: "User not found" } });
      return;
    }

    const now = new Date();

    if (user.phoneOtpLockedUntil && user.phoneOtpLockedUntil > now) {
      res.status(429).json({
        error: { message: "Too many attempts. Try again later." },
      });
      return;
    }

    if (user.phoneOtpLastSentAt) {
      const diffSeconds =
        (now.getTime() - user.phoneOtpLastSentAt.getTime()) / 1000;
      if (diffSeconds < PHONE_OTP_MIN_RESEND_SECONDS) {
        res.status(429).json({
          error: { message: "Please wait before requesting another code." },
        });
        return;
      }
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    user.phoneOtpHash = hashValue(code);
    user.phoneOtpExpiresAt = new Date(
      now.getTime() + PHONE_OTP_TTL_MINUTES * 60 * 1000
    );
    user.phoneOtpLastSentAt = now;
    user.phoneOtpAttempts = 0;
    user.phoneOtpLockedUntil = null;
    await user.save();

    if (process.env.DEMO_MODE === "true") {
      res.json({ ok: true, demoOtp: code });
      return;
    }

    res.json({ ok: true });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({
        error: { message: "Validation failed", details: err.flatten() },
      });
      return;
    }
    const status = (err as any).status || 500;
    res.status(status).json({ error: { message: (err as Error).message } });
  }
}

export async function verifyPhoneOtp(req: Request, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }

    const input = phoneVerifySchema.parse(req.body);
    const normalized = normalizePhone(input.phone);
    if (!normalized) {
      res.status(400).json({ error: { message: "Invalid phone number" } });
      return;
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      res.status(404).json({ error: { message: "User not found" } });
      return;
    }

    const now = new Date();
    if (user.phoneOtpLockedUntil && user.phoneOtpLockedUntil > now) {
      res.status(429).json({
        error: { message: "Too many attempts. Try again later." },
      });
      return;
    }

    if (!user.phoneOtpHash || !user.phoneOtpExpiresAt) {
      res.status(400).json({ error: { message: "No OTP requested" } });
      return;
    }

    if (user.phoneOtpExpiresAt.getTime() < now.getTime()) {
      res.status(400).json({ error: { message: "OTP expired" } });
      return;
    }

    const incomingHash = hashValue(input.code);
    if (incomingHash !== user.phoneOtpHash) {
      const attempts = (user.phoneOtpAttempts || 0) + 1;
      user.phoneOtpAttempts = attempts;
      if (attempts >= PHONE_OTP_MAX_ATTEMPTS) {
        user.phoneOtpLockedUntil = new Date(
          now.getTime() + PHONE_OTP_LOCK_MINUTES * 60 * 1000
        );
      }
      await user.save();
      res.status(400).json({ error: { message: "Invalid OTP" } });
      return;
    }

    user.phone = normalized;
    user.phoneVerified = true;
    user.phoneOtpHash = null;
    user.phoneOtpExpiresAt = null;
    user.phoneOtpAttempts = 0;
    user.phoneOtpLockedUntil = null;
    await user.save();

    res.json({ ok: true });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({
        error: { message: "Validation failed", details: err.flatten() },
      });
      return;
    }
    const status = (err as any).status || 500;
    res.status(status).json({ error: { message: (err as Error).message } });
  }
}
