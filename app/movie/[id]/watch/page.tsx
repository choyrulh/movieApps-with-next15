"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Movie } from "@/types/movie.";
import { getDetailMovie } from "@/Service/fetchMovie";

function Watch() {
  const pathname = usePathname();
  const id = pathname.split("/")[2];
  const router = useRouter();
  const [selectedServer, setSelectedServer] = useState("server 1");
  const [videoProgress, setVideoProgress] = useState({
    watched: 0,
    duration: 0,
    percentage: 0,
  });
  const videoProgressRef = useRef(videoProgress);

  const {
    data: movie,
    isLoading,
    isError,
  } = useQuery<Movie>({
    queryKey: ["movie", id],
    queryFn: () =>
      getDetailMovie(id as unknown as number, {
        append_to_response: "videos",
      }),

    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
    enabled: !!id,
  });

  useEffect(() => {
    videoProgressRef.current = videoProgress;
  }, [videoProgress]);

  useEffect(() => {
    const savedServer = localStorage.getItem("selectedVideoServer");
    if (savedServer) setSelectedServer(savedServer);

    // Load existing progress
    const history = JSON.parse(localStorage.getItem("watchHistory") || "{}");
    const movieProgress = history[`${id}`]?.progress;
    if (movieProgress) {
      setVideoProgress(movieProgress);
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://vidlink.pro") return;

      if (event.data?.type === "MEDIA_DATA") {
        const mediaData = event.data.data;

        if (mediaData && mediaData[id]?.progress) {
          const progress = {
            watched: mediaData[id].progress.watched,
            duration: mediaData[id].progress.duration,
            percentage:
              (mediaData[id].progress.watched /
                mediaData[id].progress.duration) *
              100, // Diperbaiki
          };

          setVideoProgress(progress);

          // Update localStorage
          const history = JSON.parse(
            localStorage.getItem("watchHistory") || "{}"
          );
          history[`${id}`] = {
            ...history[`${id}`],
            progress,
            updated_at: new Date().toISOString(),
          };
          localStorage.setItem("watchHistory", JSON.stringify(history));
        }
      }
    };
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);

      // Final save on unmount
      if (movie) {
        const history = JSON.parse(
          localStorage.getItem("watchHistory") || "{}"
        );
        history[`${id}`] = {
          id: movie.id,
          title: movie.title,
          backdrop_path: movie.backdrop_path,
          poster_path: movie.poster_path,
          type: "movie",
          progress: videoProgressRef.current,
          updated_at: new Date().toISOString(),
          release_date: movie.release_date,
          runtime: movie.runtime,
          video_key: movie.videos?.results[0]?.key,
        };
        localStorage.setItem("watchHistory", JSON.stringify(history));
      }
    };
  }, [id, movie]);

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
        return `https://vidsrc.icu/embed/movie/${id}`;
      default:
        return `https://vidlink.pro/movie/${id}`;
    }
  };

  const handleServerChange = (e: any) => {
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
