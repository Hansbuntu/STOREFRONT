import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { UserRole } from "../models/User";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "change_me";

export interface AuthUser {
  id: number;
  role: UserRole;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: { message: "Unauthorized" } });
    return;
  }

  const token = header.slice("Bearer ".length).trim();
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      role: UserRole;
      iat: number;
      exp: number;
    };

    req.user = { id: decoded.userId, role: decoded.role };
    next();
  } catch {
    res.status(401).json({ error: { message: "Invalid token" } });
  }
}


