// app/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Heart, 
  Clock, 
  Settings, 
  LogOut, 
  ArrowBigLeft,
  ChevronLeft,
  ChevronRight,
  History
} from 'lucide-react';
import {TitleText} from "@/components/TitleText";
import { useAuth } from "@/context/AuthContext";
import useIsMobile from "@/hook/useIsMobile";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const {handleLogout} = useAuth();
  

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false); // Pastikan sidebar selalu tertutup jika mobile
    }
  }, [isMobile]);

  const navigation = [
    { name: 'Beranda', href: '/dashboard/beranda', icon: Home, current: pathname === '/dashboard/beranda' },
    { name: 'Watchlist', href: '/dashboard/watchlist', icon: Clock, current: pathname === '/dashboard/watchlist' },
    { name: 'Favorit', href: '/dashboard/favorite', icon: Heart, current: pathname === '/dashboard/favorite' },
    { name: 'Setting', href: '/dashboard/settings', icon: Settings, current: pathname === '/dashboard/settings' },
    { name: 'History Watch', href: '/dashboard/history-watch', icon: History, current: pathname === '/dashboard/history-watch' },
    { name: 'Back', href: '/', icon: ArrowBigLeft },
    
  ];

   return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 ${isSidebarOpen ? 'w-64' : 'w-16'} bg-black transition-all duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          <div className="p-4 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/">
                {isSidebarOpen ? (
                  <TitleText />
                ) : (
                  <div className="font-bold text-xl text-gradient">S</div>
                )}
              </Link>
            </motion.div>
          </div>
          
          <div className="py-8 flex-1">
            <nav className="px-2 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm rounded-lg ${
                    item.current 
                      ? 'bg-blue-500/85 text-white' 
                      : 'text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className={`ml-3 ${isSidebarOpen ? 'inline' : 'hidden'}`}>
                    {item.name}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="mt-auto p-4 space-y-2">
             {!isMobile && (
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="flex items-center p-3 text-sm rounded-lg text-gray-400 hover:bg-gray-800 transition-colors"
              >
                {isSidebarOpen ? (
                  <ChevronLeft className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>
            )}
            
            <button 
              onClick={handleLogout} 
              className="flex items-center p-3 text-sm rounded-lg text-gray-400 hover:bg-gray-800 w-full"
            >
              <LogOut className="w-5 h-5" />
              <span className={`ml-3 ${isSidebarOpen ? 'inline' : 'hidden'}`}>
                Keluar
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${isSidebarOpen ? 'ml-64' : 'ml-16'} px-4 md:px-8 py-6 transition-all duration-300 ease-in-out`}>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}