import { NextFunction, Request, Response } from "express";

export function requireSeller(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: { message: "Unauthorized" } });
    return;
  }
  if (req.user.role !== "seller" && req.user.role !== "admin") {
    res.status(403).json({ error: { message: "Seller role required" } });
    return;
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: { message: "Unauthorized" } });
    return;
  }
  if (req.user.role !== "admin") {
    res.status(403).json({ error: { message: "Admin access required" } });
    return;
  }
  next();
}
