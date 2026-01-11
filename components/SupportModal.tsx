"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, Coffee } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const SupportModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const setCookie = (name: string, value: string, days: number) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  };

  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  useEffect(() => {
    // Check if user has already dismissed or visited support
    const hasSeenSupport = getCookie("hasSeenSupportModal");

    // Don't show on support page itself or if already seen
    if (pathname === "/support" || hasSeenSupport) {
      return;
    }

    // Show after 5 seconds delay
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [pathname]);

  const handleClose = () => {
    setIsOpen(false);
    setCookie("hasSeenSupportModal", "true", 7);
  };

  const handleSupportClick = () => {
    setIsOpen(false);
    setCookie("hasSeenSupportModal", "true", 7);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center pointer-events-none p-4 sm:p-0">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="relative pointer-events-auto w-full max-w-sm bg-[#0a0a0a] border border-green-500/20 rounded-2xl shadow-2xl p-6 overflow-hidden group"
          >
            {/* Glow effect */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all duration-500" />

            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4 pt-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-transparent flex items-center justify-center border border-green-500/30">
                <Heart className="w-8 h-8 text-green-400 fill-green-400/20 animate-pulse" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">
                  Welcome to SlashVerse
                </h3>
                <p className="text-sm text-gray-400">
                  Maybe you can support us by clicking the button below
                </p>
              </div>

              <div className="flex flex-col w-full gap-3 pt-2">
                <Link
                  href="/support"
                  onClick={handleSupportClick}
                  className="w-full"
                >
                  <button className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-semibold rounded-xl shadow-lg shadow-green-900/20 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
                    <Coffee className="w-4 h-4" />
                    Support Development
                  </button>
                </Link>

                <button
                  onClick={handleClose}
                  className="text-sm text-gray-500 hover:text-gray-300 transition-colors py-2"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
