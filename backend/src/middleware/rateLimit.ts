import { NextFunction, Request, Response } from "express";

type RateLimitOptions = {
  windowMs: number;
  max: number;
};

type Counter = {
  count: number;
  resetAt: number;
};

const counters = new Map<string, Counter>();

export function rateLimit({ windowMs, max }: RateLimitOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const entry = counters.get(key);

    if (!entry || entry.resetAt <= now) {
      counters.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    entry.count += 1;
    if (entry.count > max) {
      res.status(429).json({
        error: { message: "Too many requests, please try again later." },
      });
      return;
    }

    counters.set(key, entry);
    next();
  };
}
