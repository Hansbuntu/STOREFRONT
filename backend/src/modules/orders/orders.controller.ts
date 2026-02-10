import { Request, Response } from "express";
import { ZodError, z } from "zod";
import { sequelize } from "../../startup/db";
import { Listing } from "../../models/Listing";
import { Order } from "../../models/Order";
import { Escrow } from "../../models/Escrow";
import { Op } from "sequelize";

const demoCheckoutSchema = z.object({
  items: z
    .array(
      z.object({
        listingId: z.number().int().positive(),
        qty: z.number().int().positive(),
      })
    )
    .min(1),
});

const orderIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

function serializeOrder(order: Order, escrow?: Escrow | null) {
  return {
    id: order.id,
    buyerId: order.buyerId,
    sellerId: order.sellerId,
    status: order.status,
    subtotalGhs: order.subtotalGhs,
    shippingGhs: order.shippingGhs,
    totalGhs: order.totalGhs,
    currency: order.currency,
    listingSnapshot: order.listingSnapshot,
    createdAt: order.createdAt,
    escrow: escrow
      ? {
          id: escrow.id,
          status: escrow.status,
          amount: escrow.amount,
          releasedAt: escrow.releasedAt,
          releasedTo: escrow.releasedTo,
        }
      : null,
  };
}

export async function demoCheckout(req: Request, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }

    const input = demoCheckoutSchema.parse(req.body);
    const listingIds = input.items.map((item) => item.listingId);

    const listings = await Listing.findAll({
      where: {
        id: { [Op.in]: listingIds },
        status: "active",
      },
    });

    const listingMap = new Map(listings.map((listing) => [listing.id, listing]));

    const orders = await sequelize.transaction(async (transaction) => {
      const createdOrders: Order[] = [];

      for (const item of input.items) {
        const listing = listingMap.get(item.listingId);
        if (!listing) {
          throw new Error(`Listing ${item.listingId} not found`);
        }
        if (listing.quantity < item.qty) {
          throw new Error(
            `Listing ${listing.id} has only ${listing.quantity} available`
          );
        }

        const subtotal = Number(listing.priceGhs) * item.qty;
        const shipping = Number(listing.shippingFeeGhs || 0) * item.qty;
        const total = subtotal + shipping;

        const order = await Order.create(
          {
            buyerId: req.user.id,
            sellerId: listing.sellerId,
            status: "paid_demo",
            subtotalGhs: subtotal,
            shippingGhs: shipping,
            totalGhs: total,
            currency: "GHS",
              listingSnapshot: {
                listingId: listing.id,
                title: listing.title,
                priceGhs: listing.priceGhs,
                shippingFeeGhs: listing.shippingFeeGhs,
                qty: item.qty,
                imageUrl: listing.imageUrl,
                location: listing.location,
              },
          },
          { transaction }
        );

        await Escrow.create(
          {
            orderId: order.id,
            amount: total,
            currency: "GHS",
            status: "held",
            releasedAt: null,
            releasedTo: null,
          },
          { transaction }
        );

        createdOrders.push(order);
      }

      return createdOrders;
    });

    res.status(201).json({
      orders: orders.map((order) => ({
        id: order.id,
        sellerId: order.sellerId,
        totalGhs: order.totalGhs,
      })),
    });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({
        error: { message: "Validation failed", details: err.flatten() },
      });
      return;
    }
    const status = (err as any).status || 400;
    res.status(status).json({ error: { message: (err as Error).message } });
  }
}

export async function listOrders(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ error: { message: "Unauthorized" } });
    return;
  }

  const orders = await Order.findAll({
    where: {
      [Op.or]: [{ buyerId: req.user.id }, { sellerId: req.user.id }],
    },
    include: [{ model: Escrow, as: "escrow" }],
    order: [["createdAt", "DESC"]],
  });

  res.json({
    orders: orders.map((order) =>
      serializeOrder(order, (order as Order & { escrow?: Escrow }).escrow)
    ),
  });
}

export async function getOrderById(req: Request, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }

    const params = orderIdSchema.parse(req.params);
    const order = await Order.findByPk(params.id, {
      include: [{ model: Escrow, as: "escrow" }],
    });

    if (!order) {
      res.status(404).json({ error: { message: "Order not found" } });
      return;
    }

    if (order.buyerId !== req.user.id && order.sellerId !== req.user.id) {
      res.status(403).json({ error: { message: "Forbidden" } });
      return;
    }

    res.json({
      order: serializeOrder(
        order,
        (order as Order & { escrow?: Escrow }).escrow
      ),
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

export async function submitFulfillment(req: Request, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }

    const params = orderIdSchema.parse(req.params);
    const order = await Order.findByPk(params.id);

    if (!order) {
      res.status(404).json({ error: { message: "Order not found" } });
      return;
    }

    if (order.sellerId !== req.user.id) {
      res.status(403).json({ error: { message: "Seller access required" } });
      return;
    }

    order.status = "fulfillment_submitted";
    await order.save();

    res.json({ order: serializeOrder(order, null) });
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

export async function confirmOrder(req: Request, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }

    const params = orderIdSchema.parse(req.params);
    const order = await Order.findByPk(params.id, {
      include: [{ model: Escrow, as: "escrow" }],
    });

    if (!order) {
      res.status(404).json({ error: { message: "Order not found" } });
      return;
    }

    if (order.buyerId !== req.user.id) {
      res.status(403).json({ error: { message: "Buyer access required" } });
      return;
    }

    order.status = "released";
    await order.save();

    const escrow = (order as Order & { escrow?: Escrow }).escrow;
    if (escrow) {
      escrow.status = "released";
      escrow.releasedAt = new Date();
      escrow.releasedTo = "seller";
      await escrow.save();
    }

    res.json({ order: serializeOrder(order, escrow || null) });
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

export async function refundOrder(req: Request, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }

    const params = orderIdSchema.parse(req.params);
    const order = await Order.findByPk(params.id, {
      include: [{ model: Escrow, as: "escrow" }],
    });

    if (!order) {
      res.status(404).json({ error: { message: "Order not found" } });
      return;
    }

    if (order.buyerId !== req.user.id) {
      res.status(403).json({ error: { message: "Buyer access required" } });
      return;
    }

    order.status = "refunded";
    await order.save();

    const escrow = (order as Order & { escrow?: Escrow }).escrow;
    if (escrow) {
      escrow.status = "refunded";
      escrow.releasedAt = new Date();
      escrow.releasedTo = "buyer";
      await escrow.save();
    }

    res.json({ order: serializeOrder(order, escrow || null) });
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
