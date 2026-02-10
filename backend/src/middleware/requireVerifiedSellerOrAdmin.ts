import { NextFunction, Request, Response } from "express";
import { User } from "../models/User";
import { SellerProfile } from "../models/SellerProfile";

export async function requireVerifiedSellerOrAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    res.status(401).json({ error: { message: "Unauthorized" } });
    return;
  }

  const user = await User.findByPk(req.user.id);
  if (!user) {
    res.status(404).json({ error: { message: "User not found" } });
    return;
  }

  if (user.role === "admin") {
    next();
    return;
  }

  if (user.role !== "seller") {
    res.status(403).json({ error: { message: "Seller role required" } });
    return;
  }

  const profile = await SellerProfile.findOne({ where: { userId: user.id } });
  if (!profile || profile.status !== "verified") {
    res.status(403).json({ error: { message: "Seller not verified" } });
    return;
  }

  next();
}
