import { NextFunction, Request, Response } from "express";

export function requireDemoMode(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (process.env.DEMO_MODE !== "true") {
    res.status(403).json({ error: { message: "Demo mode disabled" } });
    return;
  }
  next();
}
