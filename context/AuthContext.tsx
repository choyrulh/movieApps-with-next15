"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {getCookie} from "@/Service/fetchUser"

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  token: string | null;
  handleLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
    const router = useRouter();

  useEffect(() => {
    // Cek token di localStorage saat aplikasi pertama kali dimuat
    if (typeof window !== "undefined") {
      // Pastikan kode hanya berjalan di klien
      const storedToken = getCookie('user')
      if (storedToken) {
        setToken(storedToken);
        setIsAuthenticated(true);
      }
    }
  }, []);

   const handleLogout = async () => {
    try {
      // localStorage.removeItem("user");
      document.cookie = "user=; path=/; max-age=0";
      setIsAuthenticated(false);
      router.push("/login");
    } catch (err: any) {
      console.log(err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, token, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
