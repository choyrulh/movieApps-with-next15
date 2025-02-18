"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function Watch() {
  const pathname = usePathname();
  const id = pathname.split("/")[2];
  const router = useRouter();
  const [selectedServer, setSelectedServer] = useState("server 1");

  useEffect(() => {

    // Load the previously selected server from localStorage if available
    const savedServer = localStorage.getItem("selectedVideoServer");
    if (savedServer) {
      setSelectedServer(savedServer);
    }


    const handleMessage = (event) => {
      if (event.origin !== "https://vidlink.pro") return;
      if (event.data?.type === "MEDIA_DATA") {
        const mediaData = event.data.data;
        localStorage.setItem("vidLinkProgress", JSON.stringify(mediaData));
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [id]);


   // Get video URL based on selected server
  const getVideoUrl = () => {
    switch (selectedServer) {
      case "server 1":
        return `https://vidlink.pro/movie/${id}`;
      case "server 2":
        return `https://vidsrc.cc/v2/embed/movie/${id}?autoPlay=false`;
      case "server 3":
        return `https://vidsrc.cc/v3/embed/movie/${id}?autoPlay=false`;
      case "server 4":
        return `https://vidsrc.to/embed/movie/${id}`;
      case "server 5":
        return `https://vidsrc.icu/embed/movie/${id}`
      default:
        return `https://vidlink.pro/movie/${id}`;
    }
  };

  const handleServerChange = (e) => {
    const server = e.target.value;
    setSelectedServer(server);
    localStorage.setItem("selectedVideoServer", server);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      <main className="max-w-7xl mx-auto px-4 pt-28">

        <div className="mb-4">
          <label htmlFor="serverSelect" className="text-sm text-gray-300 mr-2">
            Select Server:
          </label>
          <select
            id="serverSelect"
            value={selectedServer}
            onChange={handleServerChange}
            className="bg-gray-800 text-white px-3 py-1 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="server 1">server 1</option>
            <option value="server 2">server 2</option>
            <option value="server 3">server 3</option>
            <option value="server 4">server 4</option>
            <option value="server 5">server 5</option>
          </select>
        </div>

        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
          <iframe
            src={getVideoUrl()}
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
