"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hook/useUserProfile";
import { redirect } from 'next/navigation'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("home");
  const [mounted, setMounted] = useState(false);
  const { data, isLoading, error } = useUserProfile();
  const { isAuthenticated, token } = useAuth();

  // useEffect(() => {
  //   setMounted(true);
  //   console.log("isAuthenticated" , isAuthenticated)
    
  //   // Redirect ke login jika tidak terautentikasi
  //   if (isAuthenticated === false) {
  //     redirect("/login");
  //   }

  // }, [isAuthenticated, token, redirect]);

  // if (!mounted || isLoading) {
  //   return (
  //     <div className="min-h-screen bg-gray-900 flex items-center justify-center">
  //       <div className="text-white text-lg">Loading...</div>
  //     </div>
  //   );
  // }

  // if (isAuthenticated === false) {
  //   return (
  //     <div className="min-h-screen bg-gray-900 flex items-center justify-center">
  //       <div className="text-white text-lg">Redirecting to login...</div>
  //     </div>
  //   );
  // }

  return (
    <>
      <div className="flex items-center justify-between mt-20 p-4 bg-gray-800">
        <div className="flex items-center space-x-4">
          welcome Home
          </div>
      </div>
    </>
  );
}

