"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useIsMobile from "@/hook/useIsMobile";
import { useAuth } from "@/context/AuthContext";

import { Skeleton } from "@/components/ui/skeleton";

export const ProfileDropDown = ({ props, onCloseMenu }: any) => {
  const [state, setState] = useState(false);
  const isMobile = useIsMobile();
  const router = useRouter();
  const profileRef: any = useRef();
  const {
    isAuthenticated,
    token,
    handleLogout,
    user: data,
    isLoadingUser: isLoading,
  } = useAuth();

  useEffect(() => {
    const handleDropDown = (e: any) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setState(false);
    };
    document.addEventListener("click", handleDropDown);

    return () => {
      document.removeEventListener("click", handleDropDown);
    };
  }, []);

  const navigation = [
    { title: "Dashboard", path: "/dashboard" },
    { title: "Settings", path: "/settings" },
    { title: `${isAuthenticated ? "Log out" : "Log in"}`, path: "/login" },
  ];

  // Function to get initials from name
  const getInitials = (name: string) => {
    if (!name) return "U";
    const names = name.split(" ");
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  return (
    <div className={`relative ${props}`}>
      <div className="flex items-center gap-3">
        {/* Tambahkan elemen untuk menampilkan "Hello, (nama user)" di desktop */}
        {!isMobile && isAuthenticated && (
          <div className="hidden lg:block text-right">
            {isLoading ? (
              <Skeleton className="h-4 w-24 mb-1" />
            ) : (
              <p className="text-sm font-medium text-gray-200">
                Hello, {data?.data?.name?.trim().split(" ")[0] || "User"}
              </p>
            )}
            <p className="text-xs text-gray-400">
              {isLoading ? (
                <Skeleton className="h-3 w-32" />
              ) : (
                data?.data?.email || "Welcome back!"
              )}
            </p>
          </div>
        )}

        <Avatar
          className={`flex items-center space-x-4 ${
            isMobile ? "flex-row-reverse gap-4" : "flex-row"
          }`}
        >
          <button
            ref={profileRef}
            className="w-10 h-10 outline-none rounded-full ring-offset-2 ring-gray-200 ring-2 lg:focus:ring-indigo-600"
            onClick={() => setState(!state)}
          >
            {isAuthenticated ? (
              data?.data?.profile?.avatar ? (
                <AvatarImage
                  src={data?.data?.profile?.avatar}
                  alt="Profile Picture"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="font-medium text-sm">
                  {getInitials(data?.data?.name)}
                </span>
              )
            ) : (
              <span className="font-medium text-sm">U</span>
            )}

            <AvatarFallback>
              <Skeleton />
            </AvatarFallback>
          </button>
          <div className="lg:hidden">
            <span className="block">
              {isAuthenticated ? data?.data?.name : "user"}
            </span>
            <span className="block text-sm text-gray-500">
              {isAuthenticated ? data?.data?.email : "user@example.com"}
            </span>
          </div>
        </Avatar>
      </div>

      {/* Profile Dropdown Content */}
      {isMobile ? (
        <div
          className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${state ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
          `}
        >
          <ul className="static w-full space-y-2 mt-3">
            {navigation.map((item, idx) => (
              <li
                key={idx}
                className={`
                  transform transition-all duration-300 ease-in-out
                  ${
                    state
                      ? "translate-x-0 opacity-100"
                      : "translate-x-4 opacity-0"
                  }
                `}
                style={{
                  transitionDelay: `${idx * 100}ms`,
                }}
              >
                {item.title === "Log out" ? (
                  <button
                    className="block px-4 py-2 text-gray-200 transition-colors duration-200 hover:bg-slate-800/80 w-full text-end"
                    onClick={() => {
                      handleLogout();
                      onCloseMenu(); // Tambahkan ini
                    }}
                  >
                    {item.title}
                  </button>
                ) : (
                  <Link
                    className="block px-4 py-2 text-gray-200 transition-colors duration-200 hover:bg-slate-800/80"
                    href={item.path}
                    onClick={() => {
                      setState(false);
                      onCloseMenu(); // Tambahkan ini
                    }}
                  >
                    {item.title}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div
          className={`
            absolute top-full right-0 mt-2 min-w-[200px]
            transition-all duration-300 ease-in-out
            ${
              state
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-2 pointer-events-none"
            }
          `}
        >
          <ul className="bg-[#111111]/95 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-xl overflow-hidden">
            {navigation.map((item, idx) => (
              <li
                key={idx}
                className={`
                  transform transition-all duration-300 ease-in-out
                  ${
                    state
                      ? "translate-y-0 opacity-100"
                      : "-translate-y-2 opacity-0"
                  }
                `}
                style={{
                  transitionDelay: `${idx * 75}ms`,
                }}
              >
                {item.title === "Log out" ? (
                  <button
                    className="block px-4 py-2 text-gray-200 transition-colors duration-200 hover:bg-[#111111]/80 text-left w-full"
                    onClick={handleLogout}
                  >
                    {item.title}
                  </button>
                ) : (
                  <Link
                    className="block px-4 py-2 text-gray-200 transition-colors duration-200 hover:bg-[#111111]/80 w-full"
                    href={item.path}
                    onClick={() => setState(false)}
                  >
                    {item.title}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
