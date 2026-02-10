import { Request, Response } from "express";
import { User } from "../../models/User";
import { SellerProfile } from "../../models/SellerProfile";
import { z, ZodError } from "zod";
import { issueTokenForUser, serializeUser } from "../auth/auth.service";

const profileSchema = z.object({
  storeName: z.string().min(2).max(80),
  storeDescription: z.string().min(20).max(2000),
  storeLocation: z.string().min(2).max(120),
  contactEmail: z.string().email().optional().nullable(),
  contactPhone: z.string().min(7).max(30).optional().nullable(),
  policiesAccepted: z.boolean().optional(),
});

const sanitize = (value: string) => value.trim();

async function ensureProfile(userId: number) {
  const existing = await SellerProfile.findOne({ where: { userId } });
  if (existing) return existing;

  return SellerProfile.create({
    userId,
    storeName: "Draft Store",
    storeDescription: "Please add a store description.",
    storeLocation: "Ghana",
    contactEmail: null,
    contactPhone: null,
    policiesAccepted: false,
    status: "draft",
    adminNotes: null,
  });
}

export async function becomeSeller(req: Request, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      res.status(404).json({ error: { message: "User not found" } });
      return;
    }

    if (user.role !== "seller") {
      user.role = "seller";
      await user.save();
    }

    const profile = await ensureProfile(user.id);
    const token = issueTokenForUser(user);
    res.status(200).json({
      sellerProfile: profile,
      token,
      user: serializeUser(user),
    });
  } catch (err) {
    const status = (err as any).status || 500;
    res.status(status).json({ error: { message: (err as Error).message } });
  }
}

export async function getProfile(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ error: { message: "Unauthorized" } });
    return;
  }

  const profile = await SellerProfile.findOne({
    where: { userId: req.user.id },
  });

  if (!profile) {
    res.status(404).json({ error: { message: "Seller profile not found" } });
    return;
  }

  res.json({ sellerProfile: profile });
}

export async function updateProfile(req: Request, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }

    const input = profileSchema.parse(req.body);
    const profile = await ensureProfile(req.user.id);

    profile.storeName = sanitize(input.storeName);
    profile.storeDescription = sanitize(input.storeDescription);
    profile.storeLocation = sanitize(input.storeLocation);
    profile.contactEmail = input.contactEmail ?? null;
    profile.contactPhone = input.contactPhone ?? null;
    if (input.policiesAccepted !== undefined) {
      profile.policiesAccepted = input.policiesAccepted;
    }

    if (profile.status === "rejected") {
      profile.status = "draft";
    }

    await profile.save();
    res.json({ sellerProfile: profile });
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

export async function submitProfile(req: Request, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }

    const profile = await ensureProfile(req.user.id);
    if (!profile.policiesAccepted) {
      res.status(400).json({
        error: { message: "You must accept marketplace policies." },
      });
      return;
    }

    if (!profile.storeName || !profile.storeDescription || !profile.storeLocation) {
      res.status(400).json({
        error: { message: "Store name, description, and location are required." },
      });
      return;
    }

    profile.status = "pending";
    await profile.save();
    res.json({ sellerProfile: profile });
  } catch (err) {
    const status = (err as any).status || 500;
    res.status(status).json({ error: { message: (err as Error).message } });
  }
}

export async function getSellerStatus(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ error: { message: "Unauthorized" } });
    return;
  }

  const user = await User.findByPk(req.user.id);
  if (!user) {
    res.status(404).json({ error: { message: "User not found" } });
    return;
  }

  const profile = await SellerProfile.findOne({ where: { userId: user.id } });

  res.json({
    role: user.role,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    sellerProfileStatus: profile?.status || "draft",
    adminNotes: profile?.adminNotes ?? null,
  });
}
