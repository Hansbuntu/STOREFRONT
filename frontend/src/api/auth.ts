import { apiClient } from "./client";

export interface User {
  id: number;
  pseudonym: string;
  email: string | null;
  phone?: string | null;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  authProvider?: "local";
  role: "buyer" | "seller" | "admin" | "mediator";
  kycStatus: "unverified" | "pending" | "verified" | "rejected";
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterInput {
  pseudonym: string;
  email?: string;
  password: string;
}

export interface LoginInput {
  emailOrPseudonym: string;
  password: string;
}

export const authApi = {
  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>("/auth/register", data);
    return res.data;
  },

  login: async (data: LoginInput): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>("/auth/login", data);
    return res.data;
  },

  me: async (): Promise<{ user: User }> => {
    const res = await apiClient.get<{ user: User }>("/auth/me");
    return res.data;
  },
};
