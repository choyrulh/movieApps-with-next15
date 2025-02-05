"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function Watch() {
  const pathname = usePathname();
  const id = pathname.split("/")[2];
  const router = useRouter();

  useEffect(() => {
    window.addEventListener("message", (event) => {
      if (event.origin !== "https://vidlink.pro") return;

      if (event.data?.type === "MEDIA_DATA") {
        const mediaData = event.data.data;
        localStorage.setItem("vidLinkProgress", JSON.stringify(mediaData));
      }
    });
  }, [id]);

  // Construct the video URL directly
  const videoUrl = `https://vidlink.pro/movie/${id}`;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="max-w-7xl mx-auto px-4 pt-28">
        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
          <iframe
            src={videoUrl}
            frameBorder="0"
            allowFullScreen
            width="100%"
            height="100%"
          ></iframe>
        </div>
      </main>
    </div>
  );
}

export default Watch;
