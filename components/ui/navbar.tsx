"use client";

// import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import Link from "next/link";
import { useState, useRef, useEffect, memo, useCallback } from "react";
// import { Skeleton } from "./skeleton";
import { usePathname, useRouter } from "next/navigation";
import { BookmarkPlus, Clapperboard, ChevronDown } from "lucide-react";
import brandLogo from "@/assets/SlashVerseLogo.webp"
import useIsMobile from "@/hook/useIsMobile";
import { TitleText } from "./../TitleText";
// import { logoutUser } from "@/action/Auth";
// import { useAuth } from "@/context/AuthContext";
// import { useUserProfile } from "@/hook/useUserProfile";
import {ProfileDropDown} from "@/components/common/ProfileDropdown"
import Image from "next/image"

import { useWatchlistStore } from "@/store/useWatchListStore"; // <-- Tambahkan ini
import { useAuth } from "@/context/AuthContext"; // <-- Tambahkan ini jika dibutuhkan untuk filter data terautentikasi
 
const MemoizedBookmarkIcon = memo(BookmarkPlus);

export const Navbar = () => {
  const [menuState, setMenuState] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isWatchlistHovered, setIsWatchlistHovered] = useState(false); // <-- State baru

  const isMobile = useIsMobile();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const pathname = usePathname();
  const { watchlist, syncWithServer } = useWatchlistStore();

  useEffect(() => {
    // Sinkronisasi watchlist saat komponen navbar dimount
    syncWithServer();
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [syncWithServer]); // <-- Tambahkan syncWithServer sebagai dependency

  // --- Logic Watchlist Baru ---

  const previewItems = watchlist.slice(0, 4); // Ambil 4 item teratas untuk preview
  const totalItems = watchlist.length;

  const handleWatchlistMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsWatchlistHovered(true);
  };

  const handleWatchlistMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsWatchlistHovered(false);
    }, 200); // Penundaan 200ms untuk UX yang lebih halus
  };

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  }, []);

  const handleMouseEnter = (title: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveDropdown(title);
  };

  const handleCloseMenu = () => {
    setMenuState(false)
    setActiveDropdown(null)
  }

  const navigation = [
    { title: "Home", path: "/" },
    { title: "TV/Show", path: "/tv" },
    {
      title: "Movies",
      children: [
        { title: "Trending", path: "/trending" },
        { title: "Genres", path: "/genre" },
        { title: "Upcoming", path: "/upcoming" },
        { title: "Filter", path: "/filter" },
      ],
    },
    { title: "Cast", path: "/person" },
    { title: "Search", path: "/search" },
    { title: "Contact", path: "/contact" },
  ];

  return (
    <>
      <nav
        className={`${
          pathname === "/search" || pathname.endsWith("/watch") ? "relative" : "fixed"
        } left-0 right-0 z-[100] ${
          isScrolled
            ? "bg-[#111111]/60 backdrop-blur-sm shadow-xl"
            : "bg-transparent bg-opacity-50"
        } ${
          ["/login", "/register"].includes(pathname) || pathname.startsWith("/dashboard") ? "hidden" : "block"
        } transition-all duration-300`}
      >
        <div className="flex items-center space-x-8 py-3 px-4 max-w-[95.625vw] mx-auto md:px-8">
          <div className="flex-1 flex items-center justify-between">
            <Link href={"/"} className="flex items-center gap-2">
              <Image 
                src={brandLogo}
                alt="SlashVerse Logo"
                width={300}
                height={200}
                priority
                className="object-contain w-40 md:w-48 lg:w-56 xl:w-64 2xl:w-[300px]"
              />
            </Link>
            
            {/* Bagian menu dan dropdown tetap sama */}
            {/* ... (Menu Utama - tetap sama) ... */}
             <div
              className={`bg-black/95 lg:bg-inherit absolute z-20 w-full top-16 left-0 p-4 border-b lg:static lg:block lg:border-none transition-all duration-300 ease-in-out ${
                isMobile ? "text-end" : "unset"
              } ${
                menuState
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-4 pointer-events-none lg:opacity-100 lg:translate-y-0 lg:pointer-events-auto"
              }`}
            >
              <ul className="space-y-5 lg:flex lg:space-x-6 lg:space-y-0 lg:mt-0 items-center">
                {navigation.map((item, idx) => (
                  <li key={idx} className="text-gray-300 hover:text-white">
                    {item.children ? (
                      <div
                        className=" relative flex flex-col items-end"
                        onMouseEnter={
                          !isMobile
                            ? () => handleMouseEnter(item.title)
                            : undefined
                        }
                        onMouseLeave={!isMobile ? handleMouseLeave : undefined}
                      >
                        <button
                          onClick={() => {
                            if (isMobile) {
                              setActiveDropdown(
                                activeDropdown === item.title
                                  ? null
                                  : item.title
                              );
                            }
                          }}
                          className="flex items-center gap-1 group"
                        >
                          {item.title}
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-300 ${
                              activeDropdown === item.title ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {/* Dropdown Content */}
                        {isMobile ? (
                          <div
                            className={`
                            overflow-hidden transition-all duration-300 ease-in-out
                            ${
                              activeDropdown === item.title
                                ? "max-h-[500px] opacity-100"
                                : "max-h-0 opacity-0"
                            }
                          `}
                          >
                            <ul className="pl-4 mt-2 space-y-3">
                              {item.children.map((child, childIdx) => (
                                <li
                                  key={childIdx}
                                  className={`transform transition-all duration-300 ease-in-out
                                  ${
                                    activeDropdown === item.title
                                      ? "translate-x-0 opacity-100"
                                      : "translate-x-4 opacity-0"
                                  }
                                `}
                                  style={{
                                    transitionDelay: `${childIdx * 100}ms`,
                                  }}
                                >
                                  <Link
                                    href={child.path}
                                    onClick={() => {
                                      setMenuState(false);
                                      setActiveDropdown(null);
                                      window.scrollTo(0, 0);
                                    }}
                                    className="block text-gray-300 hover:text-white py-1"
                                  >
                                    {child.title}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          // Desktop Dropdown Content
                          <div
                            className={`
                            transition-all duration-300 ease-in-out
                            absolute top-full left-1/2 -translate-x-1/2 pt-4
                            ${
                              activeDropdown === item.title
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 -translate-y-2 pointer-events-none"
                            }
                          `}
                          >
                            <ul className="bg-black/95 backdrop-blur-sm border border-gray-800 rounded-lg p-2 shadow-xl min-w-[160px] space-y-1">
                              {item.children.map((child, childIdx) => (
                                <li key={childIdx}>
                                  <Link
                                    href={child.path}
                                    onClick={() => {
                                      setMenuState(false);
                                      setActiveDropdown(null);
                                      window.scrollTo(0, 0);
                                    }}
                                    className="block px-3 py-2 text-gray-300 hover:text-white rounded-md transition-colors duration-200 hover:bg-[#101010] whitespace-nowrap"
                                  >
                                    {child.title}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.path}
                        onClick={() => {
                          handleCloseMenu();
                          window.scrollTo(0, 0);
                        }}
                        className="block text-gray-300 hover:text-white py-1"
                        scroll={false}
                      >
                        {item.title}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
              <ProfileDropDown
                props={`mt-5 pt-5 border-t border-gray-800 lg:hidden ${
                  isMobile ? "justify-self-end" : "unset"
                }`}
                onCloseMenu={handleCloseMenu}
              />
            </div>
            {/* Akhir Bagian menu dan dropdown */}
            
            <div className="flex-1 flex items-center justify-end space-x-2 sm:space-x-6">
              {/* --- WATCHLIST DROPDOWN WRAPPER BARU (MODERN & LIGHTER) --- */}
              <div
                className="relative"
                onMouseEnter={handleWatchlistMouseEnter}
                onMouseLeave={handleWatchlistMouseLeave}
              >
                {/* Watchlist Icon Link */}
                <Link href={"/watch-list"} prefetch={false} className="block p-1">
                  <MemoizedBookmarkIcon className="w-6 h-6 text-gray-300 hover:text-white transition-colors" />
                  {/* Badge Notifikasi Jumlah Item */}
                  {totalItems > 0 && (
                    <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 w-4 h-4 text-[10px] bg-red-600 rounded-full flex items-center justify-center text-white font-bold ring-1 ring-black/50 pointer-events-none">
                      {totalItems > 9 ? '9+' : totalItems}
                    </span>
                  )}
                </Link>

                {/* WATCHLIST DROPDOWN CONTENT (Tampilan UI/UX Modern & Minimalis) */}
                <div
                  className={`
                    absolute right-0 top-full mt-4 w-72 md:w-80 p-4
                    bg-black backdrop-blur-lg rounded-2xl shadow-xl shadow-black/50 border border-slate-700/50 
                    transform transition-all duration-300 z-50
                    ${isWatchlistHovered && totalItems > 0 ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2 pointer-events-none'}
                  `}
                >
                  <h4 className="text-lg font-extrabold text-white mb-3 flex items-center gap-2 border-b border-slate-700 pb-2">
                    <MemoizedBookmarkIcon className="w-5 h-5 text-green-400" />
                    Watchlist Preview
                    <span className="ml-auto text-sm text-slate-400 font-medium">({totalItems})</span>
                  </h4>
                  
                  {/* Item Preview List */}
                  <div className="space-y-1">
                      {previewItems.map((item: any) => (
                        <Link
                          key={item.id || item.movieId}
                          href={`/${item.media_type || item.type}/${item.id || item.movieId}`}
                          onClick={() => setIsWatchlistHovered(false)}
                          className="flex items-center gap-3 py-2 px-2 -mx-2 hover:bg-slate-black/90 rounded-lg transition-colors group"
                        >
                          {/* Item Thumbnail (Lebih kecil & rapi) */}
                          <div className="relative w-10 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-700 shadow-sm">
                            <Image
                              src={`https://image.tmdb.org/t/p/w200${item.poster || item.poster_path}`}
                              alt={item.title || item.name}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          
                          {/* Item Info (Minimalis) */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate group-hover:text-green-400">
                              {item.title || item.name}
                            </p>
                            <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                              {/* Teks tipe tanpa background badge yang berat */}
                              <span className="font-medium">
                                {item.media_type === 'movie' || item.type === 'movie' ? 'Movie' : 'TV Show'}
                              </span>
                              {/* Separator dan Tahun */}
                              {(item.release_date || item.first_air_date) && (
                                <>
                                  <span className="text-slate-600">|</span>
                                  <span className="font-light">
                                    {new Date(item.release_date || item.first_air_date).getFullYear()}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>

                  {/* View All Button */}
                  {totalItems > 0 && (
                    <Link
                      href="/watch-list"
                      onClick={() => setIsWatchlistHovered(false)}
                      className="block text-center mt-3 text-sm font-bold text-green-400 hover:text-green-300 transition-colors pt-3 border-t border-slate-700/70"
                    >
                      View All
                    </Link>
                  )}
                </div>
              </div>
              {/* --- AKHIR WATCHLIST DROPDOWN WRAPPER --- */}
              
              <ProfileDropDown props="hidden lg:block" />
              <button
                className="outline-none text-gray-300 hover:text-white block lg:hidden"
                onClick={() => setMenuState(!menuState)}
              >
                {/* ... (Burger/Close Icon - tetap sama) ... */}
                {menuState ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16m-7 6h7"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};
