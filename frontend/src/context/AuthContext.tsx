import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi, User } from "../api/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (emailOrPseudonym: string, password: string) => Promise<void>;
  register: (pseudonym: string, email: string | undefined, password: string) => Promise<void>;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSeller: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
        // Verify token is still valid
        authApi
          .me()
          .then(({ user }) => {
            setUser(user);
            localStorage.setItem("user", JSON.stringify(user));
          })
          .catch(() => {
            // Token invalid, clear storage
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setToken(null);
            setUser(null);
          })
          .finally(() => setLoading(false));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (emailOrPseudonym: string, password: string) => {
    const { token: newToken, user: newUser } = await authApi.login({
      emailOrPseudonym,
      password,
    });
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const register = async (
    pseudonym: string,
    email: string | undefined,
    password: string
  ) => {
    const { token: newToken, user: newUser } = await authApi.register({
      pseudonym,
      email,
      password,
    });
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const setAuth = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const refreshUser = async () => {
    if (!token) return;
    const { user: freshUser } = await authApi.me();
    setUser(freshUser);
    localStorage.setItem("user", JSON.stringify(freshUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        setAuth,
        logout,
        refreshUser,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.role === "admin",
        isSeller: user?.role === "seller",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
