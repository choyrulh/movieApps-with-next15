"use client";

import Banner from "@/components/Banner";
import { usePathname } from "next/navigation";

function Show() {
  const pathname = usePathname();
  return (
    <>
      <Banner type={pathname === "/show" ? "tv" : "movie"} />
    </>
  );
}

export default Show;
