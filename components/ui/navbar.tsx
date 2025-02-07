"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import Link from "next/link";
import { useState, useRef, useEffect, Suspense } from "react";
import { Skeleton } from "./skeleton";
import { usePathname } from "next/navigation";
import { BookmarkPlus, Clapperboard } from "lucide-react";

const navigation = [
  { title: "Dashboard", path: "/dashboard" },
  { title: "Settings", path: "/settings" },
  { title: "Log out", path: "/" },
];

// Profile Dropdown
const ProfileDropDown = ({ props }: any) => {
  const [state, setState] = useState(false);

  const profileRef: any = useRef();
  useEffect(() => {
    const handleDropDown = (e: any) => {
      if (!profileRef.current.contains(e.target)) setState(false);
    };
    document.addEventListener("click", handleDropDown);
  }, []);


  return (
    <div className={`relative ${props}`}>
      <Avatar className="flex items-center space-x-4">
        <button
          ref={profileRef}
          className="w-10 h-10 outline-none rounded-full ring-offset-2 ring-gray-200 ring-2 lg:focus:ring-indigo-600"
          onClick={() => setState(!state)}
        >
          <AvatarImage
            src="https://github.com/shadcn.png"
            width={40}
            height={40}
            className="w-full h-full rounded-full"
          />
          <AvatarFallback>
            <Skeleton />
          </AvatarFallback>
        </button>
        <div className="lg:hidden">
          <span className="block">Micheal John</span>
          <span className="block text-sm text-gray-500">john@gmail.com</span>
        </div>
      </Avatar>
      <ul
        className={` top-12 right-0 mt-5 space-y-5 lg:absolute lg:border lg:rounded-md lg:text-sm lg:w-52 lg:shadow-md lg:space-y-0 lg:mt-0 ${
          state ? "" : "lg:hidden"
        }`}
      >
        {navigation.map((item, idx) => (
          <li key={idx}>
            <Link
              className="block text-gray-600 lg:hover:bg-gray-50 lg:p-2.5"
              href={item.path}
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const Navbar = () => {
  const [menuState, setMenuState] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigation = [
    { title: "Home", path: "/" },
    { title: "TV/Show", path: "/show" },
    { title: "Cast", path: "/person" },
    { title: "Search", path: "/search" },
    { title: "Contact", path: "/contact" },
  ];
  return (
    <>
      <nav
        className={`${
          pathname === "/search" ? "relative" : "fixed"
        } left-0 right-0 z-50 ${
          isScrolled
            ? "bg-slate-900/95 backdrop-blur-sm shadow-xl"
            : "bg-transparent bg-opacity-50"
        } transition-all duration-300`}
      >
        <div className="flex items-center space-x-8 py-3 px-4 max-w-screen-xl mx-auto md:px-8">
          <div className="flex-1 flex items-center justify-between">
            <Link href={"/"} className="flex items-center gap-2">
              <Clapperboard className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                SlashVerse
              </span>
            </Link>
            <div
              className={`bg-slate-900/95 lg:bg-inherit absolute z-20 w-full top-16 left-0 p-4 border-b lg:static lg:block lg:border-none transition-all duration-300 ease-in-out ${
                menuState ? "" : "hidden"
              }`}
            >
              <ul className=" space-y-5 lg:flex lg:space-x-6 lg:space-y-0 lg:mt-0">
                {navigation.map((item, idx) => (
                  <li key={idx} className="text-gray-400 hover:text-gray-100">
                    <Link onClick={() => setMenuState(!menuState)} href={item.path}>{item.title}</Link>
                  </li>
                ))}
              </ul>
              <ProfileDropDown props="mt-5 pt-5 border-t lg:hidden " />
            </div>
            <div className="flex-1 flex items-center justify-end space-x-2 sm:space-x-6">
              <Link href={"/watch-list"}>
                <BookmarkPlus className="w-6 h-6 text-gray-400" />
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
