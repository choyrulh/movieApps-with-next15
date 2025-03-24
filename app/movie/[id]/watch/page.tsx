"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Movie } from "@/types/movie.";
import { getDetailMovie } from "@/Service/fetchMovie";
import {
  Monitor,
  ChevronDown,
  Tv,
  Expand,
  Shrink,
  Clock,
  Calendar,
} from "lucide-react";
import { addRecentlyWatched, WatchHistory } from "@/Service/actionUser";
import { Metadata } from "@/app/Metadata";
import Image from "next/image";

function Watch() {
  const pathname = usePathname();
  const id = pathname.split("/")[2];
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedServer, setSelectedServer] = useState("Media 1");
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
    const validServers = Array.from({ length: 6 }, (_, i) => `Media ${i + 1}`);

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
      case "Media 1":
        return `https://vidlink.pro/movie/${id}`;
      case "Media 2":
        return `https://vidsrc.cc/v2/embed/movie/${id}?autoPlay=false`;
      case "Media 3":
        return `https://vidsrc.cc/v3/embed/movie/${id}?autoPlay=false`;
      case "Media 4":
        return `https://vidsrc.to/embed/movie/${id}`;
      case "Media 5":
        return `https://vidsrc.icu/embed/movie/${id}`;
      case "Media 6":
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
        seoTitle={`${movie?.title} - Watch SlashVerse`}
        seoDescription={movie?.overview}
        seoKeywords={movie?.genres?.map((genre) => genre.name).join(", ")}
      />

      <div className="min-h-screen bg-gray-900 text-white pb-20">
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
                  <h1 className="text-4xl font-bold text-gradient bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    {movie.title}
                  </h1>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="badge badge-info">
                      ⭐ {movie.vote_average?.toFixed(1)} / 10
                    </div>
                    {movie.genres?.map((genre) => (
                      <div key={genre.id} className="badge badge-outline">
                        {genre.name}
                      </div>
                    ))}
                    {movie.runtime !== undefined && movie.runtime !== null && (
                      <div className="badge badge-ghost">
                        🕒 {Math.floor(movie.runtime / 60)}h{" "}
                        {movie.runtime % 60}m
                      </div>
                    )}
                  </div>

                  <p className="text-gray-300 leading-relaxed">
                    {movie.overview}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                    <div>
                      <Calendar className="inline-block w-4 h-4 mr-2" />
                      {new Date(movie.release_date).toLocaleDateString()}
                    </div>
                    {/*{videoProgress.percentage > 0 && (
                      <div className="bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full">
                        {Math.round(videoProgress.percentage)}% watched
                      </div>
                    )}*/}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Video Player Section */}
          <div
            className={`relative group ${
              isFullScreen ? "h-screen" : "aspect-video"
            } bg-black`}
          >
            <iframe
              src={getVideoUrl()}
              className="w-full h-full"
              allowFullScreen
            />

            {/* Floating Controls */}
            <div className="absolute top-4 right-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/70 transition-colors"
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
                  className="p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/70 transition-colors flex items-center gap-2"
                >
                  <Monitor className="w-5 h-5" />
                  <span className="text-sm">{selectedServer}</span>
                </button>

                {showServerDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-700">
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
                        className="w-full px-4 py-3 text-sm flex items-center gap-3 hover:bg-gray-700/30 transition-colors"
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            selectedServer === `Media ${num}`
                              ? "bg-blue-500"
                              : "bg-gray-500"
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
        </main>
      </div>
    </>
  );
}

export default Watch;
