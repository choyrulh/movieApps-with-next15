"use client";

import { useCallback, useMemo } from "react";
import { getDetailShow, getSeasonDetails } from "@/Service/fetchMovie";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Clock,
  Monitor,
  ChevronDown,
  Film,
  Users,
  Expand,
  Shrink,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import {
  fetchVideoProgress,
  // Pastikan import addRecentlyWatched ada di sini
  // addRecentlyWatched,
} from "@/Service/actionUser";
import { getShowProgressUser, addRecentlyWatched } from "@/Service/fetchUser";
import { Metadata } from "@/app/Metadata";
import Image from "next/image";
import useIsMobile from "@/hook/useIsMobile";

function page() {
  const pathname = usePathname();
  const id = pathname.split("/")[2];
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showServerDropdown, setShowServerDropdown] = useState(false);
  const [season, setSeason] = useState("1");
  const [episode, setEpisode] = useState("1");
  const [selectedServer, setSelectedServer] = useState("Media 1");

  // State progress video
  const [videoProgress, setVideoProgress] = useState({
    watched: 0,
    duration: 0,
    percentage: 0,
  });

  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false);
  const [isCastExpanded, setIsCastExpanded] = useState(false);
  const [showContent, setShowContent] = useState<"episodes" | "cast">(
    "episodes"
  );

  const videoProgressRef = useRef(videoProgress);
  const videoPlayerRef = useRef<HTMLDivElement>(null);
  const [lastSavedProgress, setLastSavedProgress] = useState({
    watched: 0,
    duration: 0,
  });

  // Query Data Show
  const { data: show, isError } = useQuery<any>({
    queryKey: ["showDetail", id],
    queryFn: () =>
      getDetailShow(id as unknown as number, {
        append_to_response: "credits",
      }),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // Query General Progress (untuk list episode)
  const { data: progress } = useQuery<any>({
    queryKey: ["progress", id],
    queryFn: () => getShowProgressUser(id as unknown as string),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const { data: seasonData } = useQuery<any>({
    queryKey: ["seasonDetails", id, season],
    queryFn: () => getSeasonDetails(id, season),
    enabled: !!show?.id,
  });

  // Ref update untuk akses di dalam event listener/cleanup
  useEffect(() => {
    videoProgressRef.current = videoProgress;
  }, [videoProgress]);

  // ==========================================
  // 1. SAVE PROGRESS FUNCTION
  // ==========================================
  const saveProgress = useCallback(
    async (currentProgress: typeof videoProgress) => {
      if (!show) return;

      // Validasi minimal: jangan simpan jika durasi 0 atau belum ditonton sama sekali
      if (currentProgress.duration === 0 || currentProgress.watched === 0)
        return;

      const historyItem = {
        type: "tv" as const,
        contentId: Number(show.id), // Pastikan Number
        season: parseInt(season),
        episode: parseInt(episode),
        title: show.name,
        poster: show.poster_path,
        backdrop_path: show.backdrop_path,
        // Backend mengharapkan field ini:
        totalDuration: currentProgress.duration,
        durationWatched: currentProgress.watched,
        genres: show.genres?.map((g: any) => g.name) || [],
      };

      try {
        await addRecentlyWatched(historyItem);
      } catch (error) {
        console.error("Failed to save progress:", error);
      }
    },
    [show, season, episode]
  );

  // ==========================================
  // 2. INTERVAL SAVE (HEARTBEAT)
  // ==========================================
  useEffect(() => {
    if (!show) return;

    const interval = setInterval(() => {
      // Hanya simpan jika ada perubahan signifikan (> 2 detik) dari simpanan terakhir
      const diff = Math.abs(videoProgress.watched - lastSavedProgress.watched);

      if (diff > 2) {
        saveProgress(videoProgress);
        setLastSavedProgress(videoProgress);
      }
    }, 30000); // Setiap 30 detik

    return () => clearInterval(interval);
  }, [show, videoProgress, lastSavedProgress, saveProgress]);

  // ==========================================
  // 3. FETCH SPECIFIC EPISODE PROGRESS (RESUME)
  // ==========================================
  useEffect(() => {
    const getProgress = async () => {
      // Reset state saat ganti episode agar tidak menampilkan progress episode sebelumnya
      setVideoProgress({ watched: 0, duration: 0, percentage: 0 });

      try {
        const data = await fetchVideoProgress({ id, season, episode });

        if (data) {
          // fetchVideoProgress already maps backend fields to { watched, duration, percentage }
          const watchedVal = data.watched || 0;
          const durationVal = data.duration || 0;

          if (durationVal > 0) {
            setVideoProgress({
              watched: watchedVal,
              duration: durationVal,
              percentage: (watchedVal / durationVal) * 100,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching episode progress", error);
      }
    };

    if (id && season && episode) {
      getProgress();
    }
  }, [id, season, episode]);

  // ==========================================
  // 4. UNIFIED EVENT LISTENER (VidLink, VidSrc, Videasy)
  // ==========================================
  useEffect(() => {
    // Load preference server
    const savedServer = localStorage.getItem("selectedVideoServer");
    if (savedServer) setSelectedServer(savedServer);

    const handleMessage = (event: MessageEvent) => {
      // Helper untuk update state
      const updateState = (watched: number, duration: number) => {
        if (!duration) return;
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
          // Key format vidlink biasanya s{season}e{episode}
          const key = `s${season}e${episode}`;

          if (mediaData && mediaData[id]?.show_progress?.[key]?.progress) {
            const { watched, duration } =
              mediaData[id].show_progress[key].progress;
            updateState(watched, duration);
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
          if (String(data.tmdbId) === id && data.mediaType === "tv") {
            // Update hanya jika event progress berjalan
            if (data.event === "time" || data.event === "pause") {
              updateState(data.currentTime, data.duration);
            }
          }
        }
      }

      // --- VIDEASY (Media 4) ---
      if (
        selectedServer === "Media 4" &&
        event.origin.includes("videasy.net")
      ) {
        try {
          const rawData =
            typeof event.data === "string"
              ? JSON.parse(event.data)
              : event.data;
          if (
            String(rawData?.id) === id &&
            String(rawData?.season) === season &&
            String(rawData?.episode) === episode
          ) {
            const watched = parseFloat(rawData.progress || 0);
            const duration = parseFloat(rawData.duration || 0);
            updateState(watched, duration);
          }
        } catch (e) {
          // ignore parsing error
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
      // PENTING: Save saat unmount/ganti episode
      if (videoProgressRef.current.watched > 0) {
        saveProgress(videoProgressRef.current);
      }
    };
  }, [id, season, episode, selectedServer, saveProgress]);

  // ==========================================
  // INITIALIZE LAST WATCHED (Auto Select Season/Ep)
  // ==========================================
  useEffect(() => {
    if (progress?.episodes?.length > 0) {
      // Cari episode terakhir yang ditonton berdasarkan tanggal
      const lastWatched = progress.episodes.reduce(
        (latest: any, current: any) =>
          new Date(current.watchedDate) > new Date(latest.watchedDate)
            ? current
            : latest
      );

      if (lastWatched) {
        setSeason(lastWatched.season.toString());
        setEpisode(lastWatched.episode.toString());
      }
    }
  }, [progress]);

  // ==========================================
  // HELPER & RENDER
  // ==========================================

  const getVideoUrl = () => {
    switch (selectedServer) {
      case "Media 1":
        return `https://vidlink.pro/tv/${id}/${season}/${episode}`;
      case "Media 2":
        return `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}?autoPlay=false`;
      case "Media 3":
        return `https://vidsrc.cc/v3/embed/tv/${id}/${season}/${episode}?autoPlay=false`;
      case "Media 4":
        return `https://player.videasy.net/tv/${id}/${season}/${episode}`;
      default:
        return `https://vidlink.pro/tv/${id}/${season}/${episode}`;
    }
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-[#151515] text-white p-4 flex items-center justify-center">
        Error loading data
      </div>
    );
  }

  const selectedSeasonData = show?.seasons?.find(
    (s: any) => s.season_number === parseInt(season)
  );

  const episodes = seasonData?.episodes || [];
  const currentEpisodeData =
    selectedSeasonData?.episodes?.[parseInt(episode) - 1];

  // Navigation Logic
  const currentEpisodeIndex = useMemo(() => {
    return episodes.findIndex(
      (ep: any) => ep.episode_number === parseInt(episode)
    );
  }, [episode, episodes]);

  const hasPreviousEpisode = currentEpisodeIndex > 0;
  const hasNextEpisode = currentEpisodeIndex < episodes.length - 1;

  const handleEpisodeNavigation = useCallback(
    (type: "prev" | "next") => {
      if (type === "prev" && hasPreviousEpisode) {
        setEpisode(episodes[currentEpisodeIndex - 1].episode_number.toString());
      }
      if (type === "next" && hasNextEpisode) {
        setEpisode(episodes[currentEpisodeIndex + 1].episode_number.toString());
      }
    },
    [hasPreviousEpisode, hasNextEpisode, currentEpisodeIndex, episodes]
  );

  const handleEpisodeChange = useCallback((episodeNumber: string) => {
    setEpisode(episodeNumber);
    setTimeout(() => {
      videoPlayerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }, []);

  return (
    <>
      <Metadata
        seoTitle={`${show?.name} - Watch SlashVerse`}
        seoDescription={show?.overview}
        seoKeywords={show?.genres?.map((genre: any) => genre.name).join(", ")}
      />

      <div className="min-h-screen text-white pb-20">
        <main
          className={`mx-auto transition-all duration-300 ${
            isFullScreen ? "max-w-full" : "px-4"
          }`}
        >
          {/* Header Section */}
          {!isFullScreen && (
            <div className="mx-auto px-4 pt-8">
              <div className="flex flex-col lg:flex-row gap-8 mb-8">
                <div className="flex-1 space-y-4">
                  <Link href={`/tv/${id}`}>
                    <h1 className="text-4xl font-bold text-gradient bg-gradient-to-r from-green-400 to-purple-500 bg-clip-text text-transparent">
                      {show?.name}
                    </h1>
                  </Link>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="badge badge-info">
                      ⭐ {show?.vote_average?.toFixed(1)} / 10
                    </div>
                    {show?.genres?.map((genre: any) => (
                      <div key={genre.id} className="badge badge-outline">
                        {genre.name}
                      </div>
                    ))}
                    <div className="badge badge-ghost">
                      {/* Tampilkan progress bar sederhana jika ada */}
                      {videoProgress.percentage > 0 && (
                        <span className="text-green-400 font-bold ml-2">
                          Resume: {Math.round(videoProgress.percentage)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    {currentEpisodeData?.overview || show?.overview}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div
            className={`flex flex-col gap-6 ${
              isFullScreen ? "lg:flex-col" : "lg:flex-row"
            }`}
          >
            {/* Left Column - Video Player */}
            <div
              className={isFullScreen ? "w-full overflow-hidden" : "lg:w-2/3"}
            >
              <div
                ref={videoPlayerRef}
                className="relative group aspect-video bg-black rounded-xl overflow-hidden shadow-xl"
              >
                <iframe
                  src={getVideoUrl()}
                  className="w-full h-full"
                  allowFullScreen
                  scrolling="no"
                  frameBorder="0"
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
                      <span className="text-sm font-medium">
                        {selectedServer}
                      </span>
                    </button>

                    {showServerDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-[#151515]/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-700 z-50">
                        {[1, 2, 3, 4].map((num) => (
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
                                  ? "bg-green-500"
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

              {/* Episode Navigation Buttons */}
              <div className="mt-4 flex justify-between items-center gap-4">
                <button
                  onClick={() => handleEpisodeNavigation("prev")}
                  disabled={!hasPreviousEpisode}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    hasPreviousEpisode
                      ? "bg-green-600/20 hover:bg-green-600/40 text-green-400"
                      : "bg-[#151515]/30 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="hidden sm:block">Previous</span>
                </button>

                <div className="text-center">
                  <span className="text-sm text-gray-400">
                    Season {season} • Episode {episode}
                  </span>
                </div>

                <button
                  onClick={() => handleEpisodeNavigation("next")}
                  disabled={!hasNextEpisode}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    hasNextEpisode
                      ? "bg-green-600/20 hover:bg-green-600/40 text-green-400"
                      : "bg-[#151515]/30 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  <span className="hidden sm:block">Next</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Right Column - Playlist */}
            <div
              className={`bg-[#151515]/50 rounded-xl p-4 flex flex-col ${
                isFullScreen ? "lg:w-auto h-[500px]" : "lg:w-1/3 h-[700px]"
              }`}
            >
              {/* Toggle Buttons */}
              <div className="flex mb-4 border-b border-gray-700">
                <button
                  onClick={() => setShowContent("episodes")}
                  className={`flex-1 py-2 px-4 flex items-center justify-center gap-2 ${
                    showContent === "episodes"
                      ? "text-green-400 border-b-2 border-green-400"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  <Film className="w-5 h-5" />
                  <span>Episodes</span>
                </button>
                <button
                  onClick={() => setShowContent("cast")}
                  className={`flex-1 py-2 px-4 flex items-center justify-center gap-2 ${
                    showContent === "cast"
                      ? "text-green-400 border-b-2 border-green-400"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span>Cast</span>
                </button>
              </div>

              {/* Content Area */}
              <div className="overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                {showContent === "episodes" ? (
                  <>
                    {/* Season Selector */}
                    <div className="mb-4 ">
                      <select
                        value={season}
                        onChange={(e) => {
                          setSeason(e.target.value);
                          setEpisode("1");
                        }}
                        className="w-auto bg-[#151515]/50 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        {show?.seasons?.map((s: any) => (
                          <option
                            key={s.season_number}
                            value={s.season_number.toString()}
                          >
                            Season {s.season_number} ({s.episode_count}{" "}
                            episodes)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Episode List */}
                    <div className="space-y-3">
                      {episodes.map((ep: any) => {
                        const epProgress =
                          progress?.episodes?.find(
                            (e: any) =>
                              e.season === parseInt(season) &&
                              e.episode === ep.episode_number
                          )?.progressPercentage || 0;

                        const isCurrentEpisode =
                          episode === ep.episode_number.toString();
                        const hasProgress = epProgress > 0;
                        const episodeImage = ep.still_path
                          ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
                          : show?.poster_path
                          ? `https://image.tmdb.org/t/p/w300${show.poster_path}`
                          : "/no-image.png";

                        return (
                          <div
                            key={ep.id}
                            onClick={() =>
                              handleEpisodeChange(ep.episode_number.toString())
                            }
                            className={`group p-3 rounded-lg cursor-pointer transition-all ${
                              isCurrentEpisode
                                ? "bg-green-600/20 border border-green-500/50"
                                : "bg-[#151515]/30 hover:bg-[#151515]/50"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {/* Episode Image */}
                              <div className="relative w-[7rem] h-[7rem] rounded-lg flex-shrink-0 overflow-hidden">
                                <Image
                                  src={episodeImage}
                                  alt={`Episode ${ep.episode_number} - ${ep.name}`}
                                  fill
                                  className={`object-cover transition-opacity duration-300 ${
                                    isCurrentEpisode
                                      ? "opacity-100"
                                      : "opacity-90 group-hover:opacity-100"
                                  }`}
                                  sizes="(max-width: 640px) 20vw, 10vw"
                                  loading="lazy"
                                  placeholder="blur"
                                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII="
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-medium text-white truncate">
                                    {ep.name || `Episode ${ep.episode_number}`}
                                  </h4>
                                  {hasProgress && (
                                    <div className="w-16 h-1.5 bg-[#151515] rounded-full ml-2 mt-1">
                                      <div
                                        className="h-full bg-green-500 rounded-full"
                                        style={{ width: `${epProgress}%` }}
                                      />
                                    </div>
                                  )}
                                </div>

                                {/* Episode Metadata */}
                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                      {new Date(
                                        ep.air_date
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>
                                      {ep.runtime ||
                                        show?.episode_run_time?.[0] ||
                                        "N/A"}
                                      m
                                    </span>
                                  </div>
                                </div>

                                {/* Episode Description */}
                                {ep.overview && (
                                  <p className="mt-2 text-xs text-gray-300 line-clamp-2">
                                    {ep.overview}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  /* Cast Section */
                  <div className="space-y-4">
                    {/* Section Header */}
                    <div className="flex justify-between items-center px-2">
                      <h3 className="text-lg font-medium text-white">
                        Cast Members
                      </h3>
                      {show?.credits?.cast.length > 6 && (
                        <button
                          onClick={() => setIsCastExpanded(!isCastExpanded)}
                          className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1"
                        >
                          {isCastExpanded ? (
                            <>
                              <ChevronUp className="w-3 h-3" />
                              <span>Show Less</span>
                            </>
                          ) : (
                            <>
                              <span>View All</span>
                              <ChevronDown className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Cast Grid - 2 Columns */}
                    <div className="grid grid-cols-2 gap-3">
                      {show?.credits?.cast
                        .slice(0, isCastExpanded ? show.credits.cast.length : 6)
                        .map((actor: any) => (
                          <div
                            key={actor.id}
                            className="flex items-center gap-3 p-2 rounded-lg bg-[#151515]/30 hover:bg-[#151515]/50 transition-colors"
                          >
                            {/* Actor Avatar - Larger and Clearer */}
                            <div className="relative w-16 h-16 min-w-[4rem] rounded-full overflow-hidden border border-gray-600">
                              <Image
                                src={
                                  actor.profile_path
                                    ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                                    : "/no-avatar.png"
                                }
                                alt={actor.name}
                                fill
                                className="object-cover"
                                sizes="64px"
                                loading="eager" // Changed to eager for better loading
                                quality={85} // Better image quality
                                priority={false}
                              />
                            </div>

                            {/* Actor Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-white truncate">
                                {actor.name}
                              </h3>
                              {actor.character && (
                                <p className="text-xs text-gray-400 mt-0.5 truncate">
                                  as {actor.character}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
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

export default page;

interface TVHistory {
  contentId: number; // Ganti id menjadi contentId
  title: string;
  type: "tv";
  backdrop_path: string;
  poster_path?: string;
  seasons: {
    [season: string]: {
      episodes: {
        [episode: string]: {
          progress: {
            watched: number;
            duration: number;
            percentage: number;
          };
          last_updated: string;
          episode_title?: string;
        };
      };
    };
  };
  last_watched: {
    season: number;
    episode: number;
    progress: number;
    timestamp: string;
  };
  last_updated: string;
}
