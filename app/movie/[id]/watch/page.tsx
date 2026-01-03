"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDetailMovie } from "@/Service/fetchMovie";
import { Monitor, Expand, Shrink, Calendar } from "lucide-react";
import { addRecentlyWatched } from "@/Service/fetchUser"; // Sesuaikan import function API
import { Metadata } from "@/app/Metadata";
import Image from "next/image";
import Link from "next/link";

function Watch() {
  const pathname = usePathname();
  const id = pathname.split("/")[2];

  // State UI
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedServer, setSelectedServer] = useState("Media 1");
  const [showServerDropdown, setShowServerDropdown] = useState(false);
  const [isCastExpanded, setIsCastExpanded] = useState(false);

  // State Progress
  const [videoProgress, setVideoProgress] = useState({
    watched: 0,
    duration: 0,
    percentage: 0,
  });

  // Refs untuk akses state terbaru di dalam listener/cleanup
  const videoProgressRef = useRef(videoProgress);
  const [lastSavedProgress, setLastSavedProgress] = useState({
    watched: 0,
    duration: 0,
  });

  // Query Data Movie
  const { data: movie, isError } = useQuery<any>({
    queryKey: ["movie", id],
    queryFn: () =>
      getDetailMovie(id as unknown as number, {
        append_to_response: "credits",
      }),
    staleTime: 5 * 60 * 1000,
    retry: 2,
    enabled: !!id,
  });

  // Sinkronisasi Ref dengan State
  useEffect(() => {
    videoProgressRef.current = videoProgress;
  }, [videoProgress]);

  // Load Saved Server Preference
  useEffect(() => {
    const savedServer = localStorage.getItem("selectedVideoServer");
    if (savedServer) setSelectedServer(savedServer);
  }, []);

  // ==========================================
  // 1. SAVE PROGRESS FUNCTION (API)
  // ==========================================
  const saveProgress = useCallback(
    async (currentProgress: typeof videoProgress) => {
      if (!movie) return;

      // Validasi dasar: Jangan simpan jika belum ditonton atau durasi 0
      if (currentProgress.duration === 0 || currentProgress.watched === 0)
        return;

      const historyItem = {
        type: "movie" as const,
        contentId: Number(movie.id), // Pastikan Number
        title: movie.title,
        poster: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        // Backend mengharapkan totalDuration & durationWatched
        totalDuration: currentProgress.duration,
        durationWatched: currentProgress.watched,
        genres: movie.genres?.map((g: any) => g.name) || [],
      };

      try {
        await addRecentlyWatched(historyItem);
      } catch (error) {
        console.error("Failed to save progress:", error);
      }
    },
    [movie]
  );

  // ==========================================
  // 2. INTERVAL SAVE (HEARTBEAT)
  // ==========================================
  useEffect(() => {
    if (!movie) return;

    const interval = setInterval(() => {
      // Simpan hanya jika ada perbedaan signifikan (> 2 detik) dari save terakhir
      // untuk mengurangi spam request API
      const diff = Math.abs(videoProgress.watched - lastSavedProgress.watched);

      if (diff > 2) {
        saveProgress(videoProgress);
        setLastSavedProgress(videoProgress);
      }
    }, 30000); // Check setiap 30 detik

    return () => clearInterval(interval);
  }, [movie, videoProgress, lastSavedProgress, saveProgress]);

  // ==========================================
  // 3. UNIFIED EVENT LISTENER (VidLink, VidSrc, Videasy)
  // ==========================================
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Helper update state
      const updateState = (watched: number, duration: number) => {
        if (!duration || duration <= 0) return;
        setVideoProgress({
          watched,
          duration,
          percentage: (watched / duration) * 100,
        });
      };

      // --- VIDLINK (Media 1) ---
      if (
        selectedServer === "Media 1" &&
        event.origin === "https://vidlink.pro"
      ) {
        if (event.data?.type === "MEDIA_DATA") {
          const mediaData = event.data.data;
          // Struktur Vidlink Movie: mediaData[id].progress
          if (mediaData && mediaData[id]?.progress) {
            const { watched, duration } = mediaData[id].progress;
            updateState(watched, duration);

            // Opsional: Simpan raw data vidlink ke localStorage jika diperlukan player
            localStorage.setItem("vidLinkProgress", JSON.stringify(mediaData));
          }
        }
      }

      // --- VIDSRC (Media 2 & 3) ---
      if (
        (selectedServer === "Media 2" || selectedServer === "Media 3") &&
        event.origin === "https://vidsrc.cc"
      ) {
        if (event.data?.type === "PLAYER_EVENT") {
          const data = event.data.data;
          // Validasi ID & Tipe
          if (String(data.tmdbId) === id && data.mediaType === "movie") {
            if (data.event === "time" || data.event === "pause") {
              updateState(data.currentTime, data.duration);
            }
          }
        }
      }

      // --- VIDEASY (Media 4) ---
      // Pastikan URL includes videasy karena player mungkin di subdomain
      if (
        (selectedServer === "Media 4" || selectedServer === "Media 6") &&
        event.origin.includes("videasy.net")
      ) {
        try {
          const rawData =
            typeof event.data === "string"
              ? JSON.parse(event.data)
              : event.data;
          if (String(rawData?.id) === id) {
            const watched = parseFloat(rawData.progress || 0);
            const duration = parseFloat(rawData.duration || 0);
            updateState(watched, duration);
          }
        } catch (e) {
          // Ignore parsing error
        }
      }
    };

    window.addEventListener("message", handleMessage);

    // Cleanup: Remove listener & Save Final Progress
    return () => {
      window.removeEventListener("message", handleMessage);
      if (videoProgressRef.current.watched > 0) {
        saveProgress(videoProgressRef.current);
      }
    };
  }, [id, selectedServer, saveProgress]);

  // ==========================================
  // HELPER: Get URL
  // ==========================================
  const getVideoUrl = () => {
    switch (selectedServer) {
      case "Media 1":
        return `https://vidlink.pro/movie/${id}`;
      case "Media 2":
        return `https://vidsrc.cc/v2/embed/movie/${id}?autoPlay=false`;
      case "Media 3":
        return `https://vidsrc.cc/v3/embed/movie/${id}?autoPlay=false`;
      case "Media 4":
        return `https://player.videasy.net/movie/${id}`;
      // Media 5 & 6 bisa disesuaikan jika ada source lain
      case "Media 5":
        return `https://vidsrc.to/embed/movie/${id}`;
      case "Media 6":
        return `https://vidsrc.icu/embed/movie/${id}`;
      default:
        return `https://vidlink.pro/movie/${id}`;
    }
  };

  if (isError) {
    return (
      <div className="text-white p-10 text-center">
        Error loading movie data
      </div>
    );
  }

  return (
    <>
      <Metadata
        seoTitle={`${movie?.title} - Watch SlashVerse`}
        seoDescription={movie?.overview}
        seoKeywords={movie?.genres?.map((genre: any) => genre.name).join(", ")}
      />

      <div className="min-h-screen text-white pb-20">
        <main
          className={`mx-auto transition-all duration-300 ${
            isFullScreen ? "max-w-full" : "max-w-7xl px-4"
          }`}
        >
          {/* Header Section */}
          {!isFullScreen && movie && (
            <div className="max-w-7xl mx-auto px-4 pt-8">
              <div className="flex flex-col lg:flex-row gap-8 mb-8">
                {/* Movie Poster */}
                <div className="w-full lg:w-72 flex-shrink-0">
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title ?? "Movie Poster"}
                    width={500}
                    height={750}
                    className="rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300"
                  />
                </div>

                {/* Movie Info */}
                <div className="flex-1 space-y-4">
                  <Link href={`/movie/${id}`}>
                    <h1 className="text-4xl font-bold text-gradient bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                      {movie.title}
                    </h1>
                  </Link>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="badge badge-info">
                      ⭐ {movie.vote_average?.toFixed(1)} / 10
                    </div>
                    {movie.genres?.map((genre: any) => (
                      <div key={genre.id} className="badge badge-outline">
                        {genre.name}
                      </div>
                    ))}
                    {movie.runtime && (
                      <div className="badge badge-ghost">
                        🕒 {Math.floor(movie.runtime / 60)}h{" "}
                        {movie.runtime % 60}m
                      </div>
                    )}
                    {/* Progress Indicator Realtime */}
                    {videoProgress.percentage > 0 && (
                      <div className="badge badge-ghost text-green-400 font-bold">
                        Resume: {Math.round(videoProgress.percentage)}%
                      </div>
                    )}
                  </div>

                  <p className="text-gray-300 leading-relaxed">
                    {movie.overview}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {new Date(movie.release_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Video Player Section */}
          <div
            className={`relative group ${
              isFullScreen ? "h-screen" : "aspect-video"
            } bg-black rounded-xl overflow-hidden shadow-2xl`}
          >
            <iframe
              src={getVideoUrl()}
              className="w-full h-full"
              allowFullScreen
              frameBorder="0"
              scrolling="no"
            />

            {/* Floating Controls */}
            <div className="absolute top-4 right-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-2 bg-[#151515]/80 rounded-lg hover:bg-[#151515] transition-colors"
              >
                {isFullScreen ? (
                  <Shrink className="w-5 h-5 text-white" />
                ) : (
                  <Expand className="w-5 h-5 text-white" />
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowServerDropdown(!showServerDropdown)}
                  className="p-2 bg-[#151515]/80 rounded-lg hover:bg-[#151515] transition-colors flex items-center gap-2"
                >
                  <Monitor className="w-5 h-5" />
                  <span className="text-sm font-medium">{selectedServer}</span>
                </button>

                {showServerDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#151515]/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-700 z-50">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        onClick={() => {
                          setSelectedServer(`Media ${num}`);
                          localStorage.setItem(
                            "selectedVideoServer",
                            `Media ${num}`
                          );
                          setShowServerDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-sm flex items-center gap-3 hover:bg-[#151515]/50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            selectedServer === `Media ${num}`
                              ? "bg-blue-500"
                              : "bg-gray-600"
                          }`}
                        />
                        <span>Media {num}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cast Section */}
          {movie?.credits?.cast && (
            <div className={`${isFullScreen ? "px-4" : ""} mt-8`}>
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-200">Cast</h2>
                  {movie.credits.cast.length > 6 && (
                    <button
                      onClick={() => setIsCastExpanded(!isCastExpanded)}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      {isCastExpanded ? "Show Less" : "View All"}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {movie.credits.cast
                    .slice(0, isCastExpanded ? movie.credits.cast.length : 6)
                    .map((actor: any) => (
                      <div
                        key={actor.id}
                        className="group bg-[#151515] rounded-lg overflow-hidden hover:bg-[#202020] transition-colors"
                      >
                        <div className="aspect-[2/3] relative">
                          <Image
                            src={
                              actor.profile_path
                                ? `https://image.tmdb.org/t/p/w300${actor.profile_path}`
                                : "/no-avatar.png"
                            }
                            alt={actor.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 30vw, 15vw"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-medium text-white truncate">
                            {actor.name}
                          </p>
                          <p className="text-xs text-gray-400 truncate mt-1">
                            {actor.character}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default Watch;
