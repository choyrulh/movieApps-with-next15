"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import Link from "next/link";
import { useState, useRef, useEffect, memo, useCallback } from "react";
import { Skeleton } from "./skeleton";
import { usePathname, useRouter } from "next/navigation";
import { BookmarkPlus, Clapperboard, ChevronDown } from "lucide-react";
import useIsMobile from "@/hook/useIsMobile";
import { TitleText } from "./../TitleText";
import { logoutUser } from "@/action/Auth";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hook/useUserProfile";
import {ProfileDropDown} from "@/components/common/ProfileDropdown"
 
const MemoizedBookmarkIcon = memo(BookmarkPlus);

export const Navbar = () => {
  const [menuState, setMenuState] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
            ? "bg-slate-900/95 backdrop-blur-sm shadow-xl"
            : "bg-transparent bg-opacity-50"
        } ${
          ["/login", "/register"].includes(pathname) || pathname.startsWith("/dashboard") ? "hidden" : "block"
        } transition-all duration-300`}
      >
        <div className="flex items-center space-x-8 py-3 px-4 max-w-screen-xl mx-auto md:px-8">
          <div className="flex-1 flex items-center justify-between">
            <Link href={"/"} className="flex items-center gap-2">
              <Clapperboard className="w-8 h-8 text-purple-400" />
              <TitleText />
            </Link>
            <div
              className={`bg-slate-900/95 lg:bg-inherit absolute z-20 w-full top-16 left-0 p-4 border-b lg:static lg:block lg:border-none transition-all duration-300 ease-in-out ${
                isMobile ? "text-end" : "unset"
              } ${
                menuState
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-4 pointer-events-none lg:opacity-100 lg:translate-y-0 lg:pointer-events-auto"
              }`}
            >
              <ul className="space-y-5 lg:flex lg:space-x-6 lg:space-y-0 lg:mt-0">
                {navigation.map((item, idx) => (
                  <li key={idx} className="text-gray-400 hover:text-gray-100">
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
                                    }}
                                    className="block text-gray-400 hover:text-gray-100 py-1"
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
                            <ul className="bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-lg p-2 shadow-xl min-w-[160px] space-y-1">
                              {item.children.map((child, childIdx) => (
                                <li key={childIdx}>
                                  <Link
                                    href={child.path}
                                    onClick={() => {
                                      setMenuState(false);
                                      setActiveDropdown(null);
                                    }}
                                    className="block px-3 py-2 text-gray-400 hover:text-gray-100 rounded-md transition-colors duration-200 hover:bg-slate-800/80 whitespace-nowrap"
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
                        onClick={handleCloseMenu}
                        className="block text-gray-400 hover:text-gray-100 py-1"
                      >
                        {item.title}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
              <ProfileDropDown
                props={`mt-5 pt-5 border-t lg:hidden ${
                  isMobile ? "justify-self-end" : "unset"
                }`}
                onCloseMenu={handleCloseMenu}
              />
            </div>
            <div className="flex-1 flex items-center justify-end space-x-2 sm:space-x-6">
              <Link href={"/watch-list"} prefetch={false}>
                <MemoizedBookmarkIcon className="w-6 h-6 text-gray-400" />
              </Link>
              <ProfileDropDown props="hidden lg:block" />
              <button
                className="outline-none text-gray-400 block lg:hidden"
                onClick={() => setMenuState(!menuState)}
              >
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
