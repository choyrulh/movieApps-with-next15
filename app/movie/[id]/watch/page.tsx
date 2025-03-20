"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Movie } from "@/types/movie.";
import { getDetailMovie } from "@/Service/fetchMovie";
import { Monitor, ChevronDown, Tv, Expand, Shrink, Clock } from "lucide-react";
import { addRecentlyWatched, WatchHistory } from "@/Service/actionUser";
import { Metadata } from "@/app/Metadata";

function Watch() {
  const pathname = usePathname();
  const id = pathname.split("/")[2];
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedServer, setSelectedServer] = useState("server 1");
  const [videoProgress, setVideoProgress] = useState({
    watched: 0,
    duration: 0,
    percentage: 0,
  });
  const videoProgressRef = useRef(videoProgress);
  const [lastSavedProgress, setLastSavedProgress] = useState(videoProgress);
  const saveIntervalRef = useRef<NodeJS.Timeout>();
  const isSavingRef = useRef(false);
  const [showServerDropdown, setShowServerDropdown] = useState(false);
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
    const validServers = Array.from({ length: 6 }, (_, i) => `server ${i + 1}`);

    if (savedServer && validServers.includes(savedServer)) {
      setSelectedServer(savedServer);
    }

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
        const progress = videoProgressRef.current;

        history[`${id}`] = {
          id: movie.id,
          title: movie.title,
          backdrop_path: movie.backdrop_path,
          poster_path: movie.poster_path,
          type: "movie",
          progress,
          updated_at: new Date().toISOString(),
          release_date: movie.release_date,
          runtime: movie.runtime,
          video_key: movie.videos?.results[0]?.key,
        };
        localStorage.setItem("watchHistory", JSON.stringify(history));

        // Kirim ke backend API
        const watchHistoryItem: WatchHistory = {
          contentId: movie.id,
          type: "movie",
          title: movie.title,
          poster: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          duration: movie?.runtime ? movie.runtime * 60 : 0, // Convert menit ke detik
          durationWatched: progress.watched,
          totalDuration: progress.duration,
          genres: movie?.genres?.map((g: any) => g.name),
          progressPercentage: progress.percentage,
        };

        addRecentlyWatched(watchHistoryItem).catch((error) => {
          console.error("Gagal menyimpan riwayat:", error);
        });
      }
    };
  }, [id, movie]);

  const saveProgressToAPI = useCallback(
    async (progress: typeof videoProgress) => {
      if (!movie || isSavingRef.current) return;

      try {
        isSavingRef.current = true;

        const watchHistoryItem: WatchHistory = {
          contentId: movie.id,
          type: "movie",
          title: movie.title,
          poster: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          duration: movie?.runtime ? movie.runtime * 60 : 0, // Convert menit ke detik
          durationWatched: progress.watched,
          totalDuration: progress.duration,
          genres: movie?.genres?.map((g: any) => g.name),
          progressPercentage: progress.percentage,
        };

        await addRecentlyWatched(watchHistoryItem);
        setLastSavedProgress(progress);
      } catch (error) {
        console.error("Gagal menyimpan progress:", error);
      } finally {
        isSavingRef.current = false;
      }
    },
    [movie]
  );

  // Efek untuk interval penyimpanan
  useEffect(() => {
    if (!movie) return;

    const interval = setInterval(() => {
      // Hanya simpan jika ada perubahan progress
      if (
        videoProgress.watched !== lastSavedProgress.watched ||
        videoProgress.duration !== lastSavedProgress.duration
      ) {
        saveProgressToAPI(videoProgress);
      }
    }, 30000); // 30 detik - bisa disesuaikan

    saveIntervalRef.current = interval;

    return () => {
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    };
  }, [movie, lastSavedProgress, saveProgressToAPI, videoProgress]);

  // Efek untuk penyimpanan terakhir saat unmount
  useEffect(() => {
    return () => {
      // Simpan progress terakhir saat komponen unmount
      if (movie && videoProgressRef.current) {
        saveProgressToAPI(videoProgressRef.current).catch(console.error);
      }
    };
  }, [movie, saveProgressToAPI]);

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
      case "server 6":
        return `https://player.videasy.net/movie/${id}`;
      default:
        return `https://vidlink.pro/movie/${id}`;
    }
  };

  // const handleServerChange = (e: any) => {
  //   const server = e.target.value;
  //   setSelectedServer(server);
  //   localStorage.setItem("selectedVideoServer", server);
  // };

  return (
    <>
      <Metadata
        seoTitle={`Watch ${movie?.title}`}
        seoDescription={movie?.overview}
        seoKeywords={movie?.genres?.map((genre) => genre.name).join(", ")}
      />

      <div className="min-h-screen bg-gray-900 text-white pb-20">
        <main
          className={`mx-auto pt-8 transition-all duration-500 ${
            isFullScreen ? "max-w-full" : "max-w-7xl px-4"
          }`}
        >
          {movie && !isFullScreen && (
            <div className="max-w-7xl mx-auto px-4 pt-4">
              <div className="flex items-start gap-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
                  <div className="flex items-center gap-4 text-gray-300 mb-4">
                    {movie.runtime && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                      </span>
                    )}
                    {videoProgress.percentage > 0 && (
                      <span className="bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full text-sm">
                        {Math.round(videoProgress.percentage)}% watched
                      </span>
                    )}
                  </div>
                </div>

                <div className="hidden lg:block w-72">
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold mb-3">
                      Streaming Info
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Quality:</span>
                        <span className="text-blue-400">HD 1080p</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Server:</span>
                        <span className="text-blue-400">{selectedServer}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Bagian atas: Tombol Fullscreen & Dropdown Server */}
          <div className="flex items-center gap-4 mb-4 ml-4">
            {/* Tombol Enter/Exit Fullscreen */}
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full transition-all hover:bg-black/80"
            >
              {isFullScreen ? (
                <>
                  <Shrink className="h-5 w-5 text-blue-400" />
                  <span className="text-sm">Exit Screen</span>
                </>
              ) : (
                <>
                  <Expand className="h-5 w-5 text-blue-400" />
                  <span className="text-sm">Enter Screen</span>
                </>
              )}
            </button>

            {/* Dropdown Server */}
            <div className="relative">
              <button
                onClick={() => setShowServerDropdown(!showServerDropdown)}
                className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full transition-colors hover:bg-black/80"
              >
                <Monitor className="h-5 w-5 text-blue-400" />
                <span className="text-sm">{selectedServer}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {/* Dropdown List */}
              {showServerDropdown && (
                <div className="absolute mt-2 w-48 bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-700 overflow-hidden">
                  {[1, 2, 3, 4, 5, 6].map((serverNum) => (
                    <button
                      key={serverNum}
                      onClick={() => {
                        setSelectedServer(`server ${serverNum}`);
                        localStorage.setItem(
                          "selectedVideoServer",
                          `server ${serverNum}`
                        );
                        setShowServerDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-sm flex items-center gap-3 ${
                        selectedServer === `server ${serverNum}`
                          ? "bg-blue-600/20 text-blue-400"
                          : "hover:bg-gray-700/30"
                      } transition-colors`}
                    >
                      <Tv className="h-4 w-4 flex-shrink-0" />
                      <span>Server {serverNum}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Video Player */}
          <div
            className={`${
              isFullScreen ? "h-screen" : "aspect-video"
            } w-full bg-black rounded-lg overflow-hidden mt-4`}
          >
            <iframe
              src={getVideoUrl()}
              frameBorder="0"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </main>
      </div>
    </>
  );
}

export default Watch;
