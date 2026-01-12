"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCookie, fetchUserProfile } from "@/Service/fetchUser";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  handleLogout: () => Promise<void>;
  user: any;
  isLoadingUser: boolean;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Cek token di localStorage saat aplikasi pertama kali dimuat
    if (typeof window !== "undefined") {
      // Pastikan kode hanya berjalan di klien
      const storedToken = getCookie("user");
      if (storedToken) {
        setToken(storedToken);
        setIsAuthenticated(true);
      }
    }
  }, []);

  const {
    data: user,
    isLoading: isLoadingUser,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
    enabled: !!token, // Only fetch if token is present
    staleTime: Infinity, // Keep data fresh essentially forever for the session
    retry: false,
    refetchOnMount: false, // Don't refetch on mount if data exists
  });

  const handleLogout = async () => {
    try {
      // localStorage.removeItem("user");
      document.cookie = "user=; path=/; max-age=0";
      setToken(null);
      setIsAuthenticated(false);
      queryClient.removeQueries({ queryKey: ["userProfile"] }); // Clear user data
      router.push("/login");
    } catch (err: any) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    if (isError) {
      handleLogout();
    }
  }, [isError]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        token,
        setToken,
        handleLogout,
        user,
        isLoadingUser,
        refetchUser: refetch,
      }}
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
