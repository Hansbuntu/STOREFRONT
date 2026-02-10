import { Request, Response } from "express";
import { ZodError, z } from "zod";
import { Op } from "sequelize";
import { Listing } from "../../models/Listing";
import { User } from "../../models/User";
import { ListingImage } from "../../models/ListingImage";
import { SellerProfile } from "../../models/SellerProfile";

const listQuerySchema = z
  .object({
    q: z.string().trim().min(1).optional(),
    sellerId: z.coerce.number().int().positive().optional(),
    sort: z.enum(["newest", "price_asc", "price_desc"]).optional(),
    minPrice: z.coerce.number().int().nonnegative().optional(),
    maxPrice: z.coerce.number().int().nonnegative().optional(),
  })
  .refine(
    (data) =>
      data.minPrice === undefined ||
      data.maxPrice === undefined ||
      data.minPrice <= data.maxPrice,
    {
      message: "minPrice must be less than or equal to maxPrice",
      path: ["minPrice"],
    }
  );

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const imageIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
  imageId: z.coerce.number().int().positive(),
});

const createListingSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(4000),
  brand: z.string().max(120).optional(),
  model: z.string().max(120).optional(),
  sku: z.string().max(120).optional(),
  conditionDetails: z.string().max(1000).optional(),
  color: z.string().max(80).optional(),
  size: z.string().max(80).optional(),
  material: z.string().max(120).optional(),
  weightKg: z.number().nonnegative().max(9999).optional(),
  dimensions: z.string().max(120).optional(),
  warranty: z.string().max(1000).optional(),
  returnPolicy: z.string().max(2000).optional(),
  shippingMethod: z.string().max(80).optional(),
  handlingTimeDays: z.number().int().nonnegative().max(60).optional(),
  tags: z.array(z.string().max(40)).min(1).max(20),
  itemSpecifics: z.record(z.string().max(200)).optional(),
  priceGhs: z.number().int().nonnegative(),
  location: z.string().min(2).max(100),
  condition: z.enum(["new", "used_like_new", "used_good", "used_fair"]),
  imageUrl: z.string().url().optional(),
  shippingFeeGhs: z.number().int().nonnegative().optional(),
  quantity: z.number().int().positive().optional(),
  escrowProtected: z.boolean().optional(),
});

const updateListingSchema = createListingSchema.partial();

const sanitize = (value: string) => value.trim();

function serializeListing(listing: Listing) {
  const seller = (listing as Listing & { seller?: User }).seller;
  const sellerProfile = (seller as User & { sellerProfile?: SellerProfile })
    ?.sellerProfile;
  const images = (listing as Listing & { images?: ListingImage[] }).images;
  return {
    id: listing.id,
    sellerId: listing.sellerId,
    title: listing.title,
    description: listing.description,
    brand: listing.brand,
    model: listing.model,
    sku: listing.sku,
    conditionDetails: listing.conditionDetails,
    color: listing.color,
    size: listing.size,
    material: listing.material,
    weightKg: listing.weightKg,
    dimensions: listing.dimensions,
    warranty: listing.warranty,
    returnPolicy: listing.returnPolicy,
    shippingMethod: listing.shippingMethod,
    handlingTimeDays: listing.handlingTimeDays,
    tags: listing.tags,
    itemSpecifics: listing.itemSpecifics,
    priceGhs: listing.priceGhs,
    location: listing.location,
    condition: listing.condition,
    imageUrl: listing.imageUrl,
    shippingFeeGhs: listing.shippingFeeGhs,
    quantity: listing.quantity,
    escrowProtected: listing.escrowProtected,
    status: listing.status,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
    images: images
      ? images.map((image) => ({
          id: image.id,
          url: image.urlOrPath,
          sortOrder: image.sortOrder,
        }))
      : [],
    seller: seller
      ? {
          id: seller.id,
          pseudonym: seller.pseudonym,
          sellerProfileStatus: sellerProfile?.status || null,
        }
      : null,
  };
}

export async function list(req: Request, res: Response) {
  try {
    const query = listQuerySchema.parse(req.query);

    const where: any = {
      status: "active",
    };

    if (query.sellerId) {
      where.sellerId = query.sellerId;
    }

    if (query.q) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${query.q}%` } },
        { description: { [Op.iLike]: `%${query.q}%` } },
      ];
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.priceGhs = {};
      if (query.minPrice !== undefined) {
        where.priceGhs[Op.gte] = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        where.priceGhs[Op.lte] = query.maxPrice;
      }
    }

    const order =
      query.sort === "price_asc"
        ? [["priceGhs", "ASC"]]
        : query.sort === "price_desc"
        ? [["priceGhs", "DESC"]]
        : [["createdAt", "DESC"]];

    const listings = await Listing.findAll({
      where,
      include: [
        {
          model: User,
          as: "seller",
          attributes: ["id", "pseudonym", "kycStatus"],
          include: [
            {
              model: SellerProfile,
              as: "sellerProfile",
              attributes: ["status"],
            },
          ],
        },
        {
          model: ListingImage,
          as: "images",
          attributes: ["id", "urlOrPath", "sortOrder"],
        },
      ],
      order,
    });

    res.json({ listings: listings.map(serializeListing) });
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

export async function getById(req: Request, res: Response) {
  try {
    const params = idParamSchema.parse(req.params);
    const listing = await Listing.findByPk(params.id, {
      include: [
        {
          model: User,
          as: "seller",
          attributes: ["id", "pseudonym", "kycStatus"],
          include: [
            {
              model: SellerProfile,
              as: "sellerProfile",
              attributes: ["status"],
            },
          ],
        },
        {
          model: ListingImage,
          as: "images",
          attributes: ["id", "urlOrPath", "sortOrder"],
        },
      ],
    });

    if (!listing) {
      res.status(404).json({ error: { message: "Listing not found" } });
      return;
    }

    res.json({ listing: serializeListing(listing) });
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

export async function create(req: Request, res: Response) {
  try {
    const input = createListingSchema.parse(req.body);
    if (!req.user) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }

    const listing = await Listing.create({
      sellerId: req.user.id,
      title: sanitize(input.title),
      description: input.description ? sanitize(input.description) : null,
      brand: input.brand ? sanitize(input.brand) : null,
      model: input.model ? sanitize(input.model) : null,
      sku: input.sku ? sanitize(input.sku) : null,
      conditionDetails: input.conditionDetails
        ? sanitize(input.conditionDetails)
        : null,
      color: input.color ? sanitize(input.color) : null,
      size: input.size ? sanitize(input.size) : null,
      material: input.material ? sanitize(input.material) : null,
      weightKg: input.weightKg ?? null,
      dimensions: input.dimensions ? sanitize(input.dimensions) : null,
      warranty: input.warranty ? sanitize(input.warranty) : null,
      returnPolicy: input.returnPolicy ? sanitize(input.returnPolicy) : null,
      shippingMethod: input.shippingMethod
        ? sanitize(input.shippingMethod)
        : null,
      handlingTimeDays:
        input.handlingTimeDays !== undefined ? input.handlingTimeDays : null,
      tags: input.tags ?? null,
      itemSpecifics: input.itemSpecifics ?? null,
      priceGhs: input.priceGhs,
      location: sanitize(input.location),
      condition: input.condition,
      imageUrl: input.imageUrl || null,
      shippingFeeGhs: input.shippingFeeGhs ?? 0,
      quantity: input.quantity ?? 1,
      escrowProtected: input.escrowProtected ?? true,
      status: "active",
    });

    res.status(201).json({ listing: serializeListing(listing) });
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

export async function update(req: Request, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }

    const params = idParamSchema.parse(req.params);
    const input = updateListingSchema.parse(req.body);
    const listing = await Listing.findByPk(params.id);
    if (!listing) {
      res.status(404).json({ error: { message: "Listing not found" } });
      return;
    }

    if (req.user.role !== "admin" && listing.sellerId !== req.user.id) {
      res.status(403).json({ error: { message: "Forbidden" } });
      return;
    }

    if (input.title) listing.title = sanitize(input.title);
    if (input.description !== undefined) {
      listing.description = input.description ? sanitize(input.description) : null;
    }
    if (input.brand !== undefined) {
      listing.brand = input.brand ? sanitize(input.brand) : null;
    }
    if (input.model !== undefined) {
      listing.model = input.model ? sanitize(input.model) : null;
    }
    if (input.sku !== undefined) {
      listing.sku = input.sku ? sanitize(input.sku) : null;
    }
    if (input.conditionDetails !== undefined) {
      listing.conditionDetails = input.conditionDetails
        ? sanitize(input.conditionDetails)
        : null;
    }
    if (input.color !== undefined) {
      listing.color = input.color ? sanitize(input.color) : null;
    }
    if (input.size !== undefined) {
      listing.size = input.size ? sanitize(input.size) : null;
    }
    if (input.material !== undefined) {
      listing.material = input.material ? sanitize(input.material) : null;
    }
    if (input.weightKg !== undefined) listing.weightKg = input.weightKg;
    if (input.dimensions !== undefined) {
      listing.dimensions = input.dimensions ? sanitize(input.dimensions) : null;
    }
    if (input.warranty !== undefined) {
      listing.warranty = input.warranty ? sanitize(input.warranty) : null;
    }
    if (input.returnPolicy !== undefined) {
      listing.returnPolicy = input.returnPolicy
        ? sanitize(input.returnPolicy)
        : null;
    }
    if (input.shippingMethod !== undefined) {
      listing.shippingMethod = input.shippingMethod
        ? sanitize(input.shippingMethod)
        : null;
    }
    if (input.handlingTimeDays !== undefined) {
      listing.handlingTimeDays = input.handlingTimeDays;
    }
    if (input.tags !== undefined) listing.tags = input.tags ?? null;
    if (input.itemSpecifics !== undefined) {
      listing.itemSpecifics = input.itemSpecifics ?? null;
    }
    if (input.priceGhs !== undefined) listing.priceGhs = input.priceGhs;
    if (input.location) listing.location = sanitize(input.location);
    if (input.condition) listing.condition = input.condition;
    if (input.imageUrl !== undefined) listing.imageUrl = input.imageUrl || null;
    if (input.shippingFeeGhs !== undefined) {
      listing.shippingFeeGhs = input.shippingFeeGhs;
    }
    if (input.quantity !== undefined) listing.quantity = input.quantity;
    if (input.escrowProtected !== undefined) {
      listing.escrowProtected = input.escrowProtected;
    }

    await listing.save();
    res.json({ listing: serializeListing(listing) });
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

export async function remove(req: Request, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }

    const params = idParamSchema.parse(req.params);
    const listing = await Listing.findByPk(params.id);
    if (!listing) {
      res.status(404).json({ error: { message: "Listing not found" } });
      return;
    }

    if (req.user.role !== "admin" && listing.sellerId !== req.user.id) {
      res.status(403).json({ error: { message: "Forbidden" } });
      return;
    }

    await listing.destroy();
    res.status(204).send();
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

export async function addImages(req: Request, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }

    const params = idParamSchema.parse(req.params);
    const listing = await Listing.findByPk(params.id);
    if (!listing) {
      res.status(404).json({ error: { message: "Listing not found" } });
      return;
    }

    if (req.user.role !== "admin" && listing.sellerId !== req.user.id) {
      res.status(403).json({ error: { message: "Forbidden" } });
      return;
    }

    const files = (req.files as Express.Multer.File[]) || [];
    if (files.length === 0) {
      res.status(400).json({ error: { message: "No images uploaded" } });
      return;
    }

    const existingCount = await ListingImage.count({
      where: { listingId: listing.id },
    });
    const maxAllowed = 5;
    if (existingCount + files.length > maxAllowed) {
      res.status(400).json({
        error: { message: `You can upload up to ${maxAllowed} images.` },
      });
      return;
    }

    const createdImages = await Promise.all(
      files.map((file, index) =>
        ListingImage.create({
          listingId: listing.id,
          urlOrPath: `/public/listings/${listing.id}/${file.filename}`,
          sortOrder: existingCount + index,
        })
      )
    );

    if (!listing.imageUrl && createdImages.length > 0) {
      listing.imageUrl = createdImages[0].urlOrPath;
      await listing.save();
    }

    res.status(201).json({
      images: createdImages.map((image) => ({
        id: image.id,
        url: image.urlOrPath,
        sortOrder: image.sortOrder,
      })),
    });
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

export async function removeImage(req: Request, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }

    const params = imageIdParamSchema.parse(req.params);
    const listing = await Listing.findByPk(params.id);
    if (!listing) {
      res.status(404).json({ error: { message: "Listing not found" } });
      return;
    }

    if (req.user.role !== "admin" && listing.sellerId !== req.user.id) {
      res.status(403).json({ error: { message: "Forbidden" } });
      return;
    }

    const image = await ListingImage.findOne({
      where: { id: params.imageId, listingId: listing.id },
    });
    if (!image) {
      res.status(404).json({ error: { message: "Image not found" } });
      return;
    }

    await image.destroy();

    res.status(204).send();
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

export async function clearImages(req: Request, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }

    const params = idParamSchema.parse(req.params);
    const listing = await Listing.findByPk(params.id);
    if (!listing) {
      res.status(404).json({ error: { message: "Listing not found" } });
      return;
    }

    if (req.user.role !== "admin" && listing.sellerId !== req.user.id) {
      res.status(403).json({ error: { message: "Forbidden" } });
      return;
    }

    await ListingImage.destroy({ where: { listingId: listing.id } });
    listing.imageUrl = null;
    await listing.save();

    res.status(204).send();
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
