"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: number;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check auth on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await api.getMe();
        setUser(userData);
      } catch (err) {
        console.error("Auth check failed:", err);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.login(email, password);
    // api.login sets token in localStorage
    const userData = await api.getMe();
    setUser(userData);
    router.push("/dashboard");
  };

  const register = async (email: string, password: string) => {
    await api.register(email, password);
    // Auto login after register
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  // Protect routes
  useEffect(() => {
    if (!loading) {
      const publicRoutes = ["/login", "/register", "/"];
      if (!user && !publicRoutes.includes(pathname)) {
        router.push("/login");
      }
      if (user && publicRoutes.includes(pathname) && pathname !== "/") {
        // Redirect to dashboard if logged in and trying to access login/register
        // But allow landing page "/"
        router.push("/dashboard");
      }
    }
  }, [user, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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
