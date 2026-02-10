import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { z } from "zod";
import { Op } from "sequelize";
import { User, UserRole } from "../../models/User";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

const registerSchema = z.object({
  pseudonym: z.string().min(3).max(32),
  email: z.string().email().optional(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  emailOrPseudonym: z.string().min(1),
  password: z.string().min(8),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

function determineRole(_email?: string | null): UserRole {
  return "buyer";
}

function signToken(user: User): string {
  const payload = { userId: user.id, role: user.role };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function issueTokenForUser(user: User): string {
  return signToken(user);
}

export function serializeUser(user: User) {
  return {
    id: user.id,
    pseudonym: user.pseudonym,
    email: user.email,
    role: user.role,
    kycStatus: user.kycStatus,
    emailVerified: user.emailVerified,
    authProvider: user.authProvider,
    phone: user.phone,
    phoneVerified: user.phoneVerified,
    createdAt: user.createdAt,
  };
}

export async function register(data: unknown) {
  const input = registerSchema.parse(data);

  const email = input.email ? input.email.toLowerCase() : null;

  const existing = await User.findOne({
    where: {
      [Op.or]: [
        { pseudonym: input.pseudonym },
        ...(email ? [{ email }] : []),
      ],
    },
  });

  if (existing) {
    const conflictField =
      existing.pseudonym === input.pseudonym ? "pseudonym" : "email";
    const error = new Error(`${conflictField} already in use`);
    // @ts-expect-error attach status for errorHandler
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const role = determineRole(email);

  const user = await User.create({
    pseudonym: input.pseudonym,
    email,
    passwordHash,
    role,
  });

  const token = signToken(user);
  return { token, user: serializeUser(user) };
}

export async function login(data: unknown) {
  const input = loginSchema.parse(data);

  const identifier = input.emailOrPseudonym;
  const isEmail = identifier.includes("@");

  const where = isEmail
    ? { email: identifier.toLowerCase() }
    : { pseudonym: identifier };

  const user = await User.findOne({ where });
  if (!user) {
    const error = new Error("Invalid credentials");
    // @ts-expect-error attach status
    error.status = 401;
    throw error;
  }

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    const error = new Error("Invalid credentials");
    // @ts-expect-error attach status
    error.status = 401;
    throw error;
  }

  const token = signToken(user);
  return { token, user: serializeUser(user) };
}
