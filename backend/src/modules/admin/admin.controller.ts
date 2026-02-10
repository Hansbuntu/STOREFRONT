import { Request, Response } from "express";
import { z, ZodError } from "zod";
import { User } from "../../models/User";
import { SellerProfile } from "../../models/SellerProfile";
import { Listing } from "../../models/Listing";
import { ListingImage } from "../../models/ListingImage";
import { AdminAction } from "../../models/AdminAction";

const statusQuerySchema = z.object({
  status: z.enum(["pending", "verified", "rejected", "draft"]).optional(),
});

const userIdSchema = z.object({
  userId: z.coerce.number().int().positive(),
});

const rejectSchema = z.object({
  reason: z.string().min(3).max(2000),
});

const listingIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const adminActionsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

const listingsQuerySchema = z.object({
  sellerId: z.coerce.number().int().positive().optional(),
});

export async function listSellers(req: Request, res: Response) {
  try {
    const query = statusQuerySchema.parse(req.query);
    const where = query.status ? { status: query.status } : undefined;

    const profiles = await SellerProfile.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: [
            "id",
            "pseudonym",
            "email",
            "emailVerified",
            "phone",
            "phoneVerified",
            "createdAt",
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    const sellers = profiles.map((profile) => ({
      userId: profile.userId,
      pseudonym: profile.user?.pseudonym ?? "Unknown",
      email: profile.user?.email ?? null,
      emailVerified: profile.user?.emailVerified ?? false,
      phone: profile.user?.phone ?? null,
      phoneVerified: profile.user?.phoneVerified ?? false,
      createdAt: profile.user?.createdAt ?? null,
      sellerProfile: {
        storeName: profile.storeName,
        storeLocation: profile.storeLocation,
        status: profile.status,
        createdAt: profile.createdAt,
        policiesAccepted: profile.policiesAccepted,
        storeDescriptionLength: profile.storeDescription?.length ?? 0,
      },
    }));

    res.json({ sellers });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({
        error: { message: "Validation failed", details: err.flatten() },
      });
      return;
    }
    res.status(500).json({ error: { message: (err as Error).message } });
  }
}

export async function getSeller(req: Request, res: Response) {
  try {
    const params = userIdSchema.parse(req.params);

    const profile = await SellerProfile.findOne({
      where: { userId: params.userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: [
            "id",
            "pseudonym",
            "email",
            "emailVerified",
            "phone",
            "phoneVerified",
            "createdAt",
          ],
        },
      ],
    });

    if (!profile) {
      res.status(404).json({ error: { message: "Seller profile not found" } });
      return;
    }

    res.json({
      userId: profile.userId,
      pseudonym: profile.user?.pseudonym ?? "Unknown",
      email: profile.user?.email ?? null,
      emailVerified: profile.user?.emailVerified ?? false,
      phone: profile.user?.phone ?? null,
      phoneVerified: profile.user?.phoneVerified ?? false,
      createdAt: profile.user?.createdAt ?? null,
      sellerProfile: {
        storeName: profile.storeName,
        storeDescription: profile.storeDescription,
        storeLocation: profile.storeLocation,
        contactEmail: profile.contactEmail,
        contactPhone: profile.contactPhone,
        policiesAccepted: profile.policiesAccepted,
        status: profile.status,
        adminNotes: profile.adminNotes,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      },
    });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({
        error: { message: "Validation failed", details: err.flatten() },
      });
      return;
    }
    res.status(500).json({ error: { message: (err as Error).message } });
  }
}

export async function approveSeller(req: Request, res: Response) {
  try {
    const params = userIdSchema.parse(req.params);

    const profile = await SellerProfile.findOne({
      where: { userId: params.userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["emailVerified", "phoneVerified"],
        },
      ],
    });

    if (!profile) {
      res.status(404).json({ error: { message: "Seller profile not found" } });
      return;
    }

    if (profile.status !== "pending") {
      res.status(400).json({
        error: { message: "Only pending seller profiles can be approved." },
      });
      return;
    }

    if (!profile.policiesAccepted) {
      res.status(400).json({
        error: { message: "Seller must accept marketplace policies." },
      });
      return;
    }

    profile.status = "verified";
    profile.adminNotes = null;
    await profile.save();

    if (req.user) {
      await AdminAction.create({
        adminId: req.user.id,
        actionType: "approve_seller",
        targetType: "seller",
        targetId: profile.userId,
        reason: null,
      });
    }

    res.json({ status: profile.status });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({
        error: { message: "Validation failed", details: err.flatten() },
      });
      return;
    }
    res.status(500).json({ error: { message: (err as Error).message } });
  }
}

export async function rejectSeller(req: Request, res: Response) {
  try {
    const params = userIdSchema.parse(req.params);
    const input = rejectSchema.parse(req.body);

    const profile = await SellerProfile.findOne({
      where: { userId: params.userId },
    });

    if (!profile) {
      res.status(404).json({ error: { message: "Seller profile not found" } });
      return;
    }

    if (profile.status !== "pending" && profile.status !== "draft") {
      res.status(400).json({
        error: { message: "Only pending or draft profiles can be rejected." },
      });
      return;
    }

    profile.status = "rejected";
    profile.adminNotes = input.reason;
    await profile.save();

    if (req.user) {
      await AdminAction.create({
        adminId: req.user.id,
        actionType: "reject_seller",
        targetType: "seller",
        targetId: profile.userId,
        reason: input.reason,
      });
    }

    res.json({ status: profile.status, adminNotes: profile.adminNotes });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({
        error: { message: "Validation failed", details: err.flatten() },
      });
      return;
    }
    res.status(500).json({ error: { message: (err as Error).message } });
  }
}

export async function pauseListing(req: Request, res: Response) {
  try {
    const params = listingIdSchema.parse(req.params);
    const listing = await Listing.findByPk(params.id);
    if (!listing) {
      res.status(404).json({ error: { message: "Listing not found" } });
      return;
    }

    listing.status = "paused";
    await listing.save();

    if (req.user) {
      await AdminAction.create({
        adminId: req.user.id,
        actionType: "pause_listing",
        targetType: "listing",
        targetId: listing.id,
        reason: null,
      });
    }

    res.json({ id: listing.id, status: listing.status });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({
        error: { message: "Validation failed", details: err.flatten() },
      });
      return;
    }
    res.status(500).json({ error: { message: (err as Error).message } });
  }
}

export async function enableListing(req: Request, res: Response) {
  try {
    const params = listingIdSchema.parse(req.params);
    const listing = await Listing.findByPk(params.id);
    if (!listing) {
      res.status(404).json({ error: { message: "Listing not found" } });
      return;
    }

    listing.status = "active";
    await listing.save();

    if (req.user) {
      await AdminAction.create({
        adminId: req.user.id,
        actionType: "enable_listing",
        targetType: "listing",
        targetId: listing.id,
        reason: null,
      });
    }

    res.json({ id: listing.id, status: listing.status });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({
        error: { message: "Validation failed", details: err.flatten() },
      });
      return;
    }
    res.status(500).json({ error: { message: (err as Error).message } });
  }
}

export async function listAdminActions(req: Request, res: Response) {
  try {
    const query = adminActionsQuerySchema.parse(req.query);
    const limit = query.limit ?? 20;

    const actions = await AdminAction.findAll({
      order: [["created_at", "DESC"]],
      limit,
      include: [
        {
          model: User,
          as: "admin",
          attributes: ["id", "pseudonym", "email"],
        },
      ],
    });

    res.json({
      actions: actions.map((action) => ({
        id: action.id,
        admin: action.admin
          ? {
              id: action.admin.id,
              pseudonym: action.admin.pseudonym,
              email: action.admin.email,
            }
          : null,
        actionType: action.actionType,
        targetType: action.targetType,
        targetId: action.targetId,
        reason: action.reason,
        createdAt: action.createdAt,
      })),
    });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({
        error: { message: "Validation failed", details: err.flatten() },
      });
      return;
    }
    res.status(500).json({ error: { message: (err as Error).message } });
  }
}

export async function listAdminListings(req: Request, res: Response) {
  try {
    const query = listingsQuerySchema.parse(req.query);
    const where = query.sellerId ? { sellerId: query.sellerId } : undefined;

    const listings = await Listing.findAll({
      where,
      include: [
        {
          model: User,
          as: "seller",
          attributes: ["id", "pseudonym", "email"],
        },
        {
          model: ListingImage,
          as: "images",
          attributes: ["id", "urlOrPath", "sortOrder"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      listings: listings.map((listing) => ({
        id: listing.id,
        title: listing.title,
        priceGhs: listing.priceGhs,
        status: listing.status,
        createdAt: listing.createdAt,
        sellerId: listing.sellerId,
        seller: (listing as Listing & { seller?: User }).seller
          ? {
              id: (listing as Listing & { seller?: User }).seller!.id,
              pseudonym: (listing as Listing & { seller?: User }).seller!.pseudonym,
              email: (listing as Listing & { seller?: User }).seller!.email,
            }
          : null,
        images: (listing as Listing & { images?: ListingImage[] }).images
          ? (listing as Listing & { images?: ListingImage[] }).images!.map(
              (image) => ({
                id: image.id,
                url: image.urlOrPath,
                sortOrder: image.sortOrder,
              })
            )
          : [],
      })),
    });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({
        error: { message: "Validation failed", details: err.flatten() },
      });
      return;
    }
    res.status(500).json({ error: { message: (err as Error).message } });
  }
}
