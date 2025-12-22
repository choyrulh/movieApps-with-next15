"use client";

import { useCallback, useMemo } from "react";
import { getDetailShow, getSeasonDetails } from "@/Service/fetchMovie";
import { useStore } from "@/store/useStore";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Clock,
  Monitor,
  ChevronDown,
  Tv,
  Expand,
  Shrink,
  Calendar,
  Play,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Film,
  Users,
} from "lucide-react";
import {
  // addRecentlyWatched,
  WatchHistory,
  fetchVideoProgress,
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
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMobile = useIsMobile();

  const {
    data: show,
    isLoading,
    isError,
  } = useQuery<any>({
    queryKey: ["showDetail", id],
    queryFn: () =>
      getDetailShow(id as unknown as number, {
        append_to_response: "credits", // Tambahkan credits
      }),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // get progress tv
  const { data: progress } = useQuery<any>({
    queryKey: ["progress", id],
    queryFn: () => getShowProgressUser(id as unknown as string),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const { data: seasonData, isLoading: isLoadingSeason } = useQuery<any>({
    queryKey: ["seasonDetails", id, season],
    queryFn: () => getSeasonDetails(id, season),
    enabled: !!show?.id,
  });

  console.log("progress: ", progress);

  useEffect(() => {
    videoProgressRef.current = videoProgress;
  }, [videoProgress]);
  // Update useEffect untuk mengambil data progress dari API

  // Efek untuk interval penyimpanan
  useEffect(() => {
    if (!show) return;

    const saveProgressPeriodically = async () => {
      if (
        videoProgress.watched !== lastSavedProgress.watched ||
        videoProgress.duration !== lastSavedProgress.duration
      ) {
        try {
          await saveProgress(videoProgress);
          setLastSavedProgress(videoProgress);
        } catch (error) {
          console.error("Gagal menyimpan progress:", error);
        }
      }
    };

    const interval = setInterval(saveProgressPeriodically, 30000);
    return () => clearInterval(interval);
  }, [show, videoProgress, lastSavedProgress]);

  useEffect(() => {
    const getProgress = async () => {
      const progress = await fetchVideoProgress({ id, season, episode });
      if (progress) {
        setVideoProgress(progress);
      }
    };

    getProgress();
  }, [id, season, episode]);

  useEffect(() => {
    const savedServer = localStorage.getItem("selectedVideoServer");
    if (savedServer) setSelectedServer(savedServer);

    const history = JSON.parse(localStorage.getItem("watchHistory") || "{}");
    const tvHistory = history[`${id}`] as TVHistory;

    if (tvHistory?.seasons?.[season]?.episodes?.[episode]) {
      setVideoProgress(tvHistory.seasons[season].episodes[episode].progress);
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://vidlink.pro") return;

      if (event.data?.type === "MEDIA_DATA") {
        const mediaData = event.data.data;

        if (mediaData && mediaData[id]?.progress) {
          const lastSeason = mediaData[id].last_season_watched;
          const lastEpisode = mediaData[id].last_episode_watched;
          const key = `s${lastSeason}e${lastEpisode}`;

          const watched =
            mediaData[id].show_progress[key]?.progress.watched ?? 0;
          const duration =
            mediaData[id].show_progress[key]?.progress.duration ?? 1;

          const progress = {
            watched,
            duration,
            percentage: (watched / duration) * 100,
          };

          setVideoProgress(progress);
          saveProgress(progress);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      saveProgress(videoProgressRef.current);
    };
  }, [id, season, episode, show]);

  // Efek untuk inisialisasi progress
  useEffect(() => {
    const initializeProgress = async () => {
      if (progress?.episodes?.length > 0) {
        // Cari episode terakhir yang ditonton
        const lastWatched = progress.episodes.reduce(
          (latest: any, current: any) =>
            new Date(current.watchedDate) > new Date(latest.watchedDate)
              ? current
              : latest
        );

        if (lastWatched) {
          setSeason(lastWatched.season.toString());
          setEpisode(lastWatched.episode.toString());
          setVideoProgress({
            watched: lastWatched.durationWatched,
            duration: lastWatched.totalDuration,
            percentage: lastWatched.progressPercentage,
          });
        }
      } else {
        // Fallback ke localStorage jika tidak ada data API
        const localProgress = localStorage.getItem("watchHistory");
        if (localProgress) {
          const parsed = JSON.parse(localProgress)[id];
          if (parsed?.last_watched) {
            setSeason(parsed.last_watched.season.toString());
            setEpisode(parsed.last_watched.episode.toString());
          }
        }
      }
    };

    initializeProgress();
  }, [progress, id]);

  // Fungsi penyimpanan progress yang disederhanakan
  const saveProgress = useCallback(
    async (progress: typeof videoProgress) => {
      if (!show) return;

      const historyItem = {
        type: "tv" as const,
        contentId: show.id,
        season: parseInt(season),
        episode: parseInt(episode),
        title: show.name,
        poster: show.poster_path,
        backdrop_path: show.backdrop_path,
        duration: progress.duration,
        durationWatched: progress.watched,
        totalDuration: progress.duration,
        genres: show.genres?.map((g: any) => g.name) || [],
        progressPercentage: progress.percentage,
      };

      await addRecentlyWatched(historyItem);
    },
    [show, season, episode]
  );

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
        return `https://vidlink.pro/tv/${id}/${season}/${episode}`; // Default to server 1
    }
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-[#151515] text-white p-4">
        Error loading data
      </div>
    );
  }

  const selectedSeasonData = show?.seasons?.find(
    (s: any) => s.season_number === parseInt(season)
  );

  // const totalEpisodes = selectedSeasonData?.episode_count || 0;
  const episodes = seasonData?.episodes || [];

  const currentEpisodeData =
    selectedSeasonData?.episodes?.[parseInt(episode) - 1];

  // next and previous episode handle
  const currentEpisodeIndex = useMemo(() => {
    return episodes.findIndex(
      (ep: any) => ep.episode_number === parseInt(episode)
    );
  }, [episode, episodes]);

  const hasPreviousEpisode = useMemo(
    () => currentEpisodeIndex > 0,
    [currentEpisodeIndex]
  );
  const hasNextEpisode = useMemo(
    () => currentEpisodeIndex < episodes.length - 1,
    [currentEpisodeIndex, episodes.length]
  );

  const { previousEpisode, nextEpisode } = useMemo(() => {
    const prevEp = hasPreviousEpisode
      ? episodes[currentEpisodeIndex - 1]
      : null;
    const nextEp = hasNextEpisode ? episodes[currentEpisodeIndex + 1] : null;
    return { previousEpisode: prevEp, nextEpisode: nextEp };
  }, [currentEpisodeIndex, episodes, hasPreviousEpisode, hasNextEpisode]);

  const handleEpisodeNavigation = useCallback(
    (type: "prev" | "next") => {
      if (type === "prev" && hasPreviousEpisode) {
        setEpisode(previousEpisode.episode_number.toString());
      }
      if (type === "next" && hasNextEpisode) {
        setEpisode(nextEpisode.episode_number.toString());
      }
    },
    [hasPreviousEpisode, hasNextEpisode, previousEpisode, nextEpisode]
  );

  const handleEpisodeChange = useCallback(
    (episodeNumber: string) => {
      // Update episode state
      setEpisode(episodeNumber);

      // Scroll to video player section smoothly
      // Use setTimeout to ensure DOM has updated before scrolling
      setTimeout(() => {
        if (videoPlayerRef.current) {
          videoPlayerRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 0);
    },
    [] // Empty dependency array since it doesn't depend on any changing values
  );

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
                {/* Show Poster */}
                {/*<div className="w-full lg:w-72 flex-shrink-0">
                <img 
                  src={`https://image.tmdb.org/t/p/w500${show?.poster_path}`} 
                  alt={show?.name}
                  className="rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300"
                />
              </div>*/}

                {/* Show Info */}
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
                      🕒{" "}
                      {currentEpisodeData?.runtime ||
                        show?.episode_run_time?.[0]}
                      m
                    </div>
                  </div>

                  <p className="text-gray-300 leading-relaxed">
                    {currentEpisodeData?.overview || show?.overview}
                  </p>

                  {/* Air Date & Director */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                    <div>
                      <Calendar className="inline-block w-4 h-4 mr-2" />
                      {new Date(
                        currentEpisodeData?.air_date || show?.first_air_date
                      ).toLocaleDateString()}
                    </div>
                    {currentEpisodeData?.director && (
                      <div>🎬 Directed by {currentEpisodeData.director}</div>
                    )}
                  </div>
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
                />

                {/* Floating Controls */}
                <div className="absolute top-4 right-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setIsFullScreen(!isFullScreen)}
                    className="p-2 bg-[#151515]/50 rounded-lg hover:bg-[#151515]/70 transition-colors"
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
                      className="p-2 bg-[#151515]/50 rounded-lg hover:bg-[#151515]/70 transition-colors flex items-center gap-2"
                    >
                      <Monitor className="w-5 h-5" />
                      <span className="text-sm">{selectedServer}</span>
                    </button>

                    {showServerDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-[#151515]/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-700">
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
                            className="w-full px-4 py-3 text-sm flex items-center gap-3 hover:bg-[#151515]/30 transition-colors"
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${
                                selectedServer === `Media ${num}`
                                  ? "bg-green-500"
                                  : "bg-[#151515]"
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

              {/* Episode Navigation */}
              <div className="mt-4">
                <div className="flex justify-between items-center gap-4">
                  <button
                    onClick={() => handleEpisodeNavigation("prev")}
                    disabled={!hasPreviousEpisode}
                    className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                    ${
                      hasPreviousEpisode
                        ? "bg-green-600/30 hover:bg-green-600/50 text-green-400"
                        : "bg-[#151515]/30 cursor-not-allowed text-gray-500"
                    }
                    `}
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="hidden sm:block">Previous Episode</span>
                    {hasPreviousEpisode && (
                      <span className="text-sm ml-2 text-gray-300">
                        Ep {previousEpisode.episode_number}:{" "}
                        {previousEpisode.name}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => handleEpisodeNavigation("next")}
                    disabled={!hasNextEpisode}
                    className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                    ${
                      hasNextEpisode
                        ? "bg-green-600/30 hover:bg-green-600/50 text-green-400"
                        : "bg-[#151515]/30 cursor-not-allowed text-gray-500"
                    }
                    `}
                  >
                    <span className="hidden sm:block">Next Episode</span>
                    {hasNextEpisode && (
                      <span className="text-sm mr-2 text-gray-300">
                        Ep {nextEpisode.episode_number}: {nextEpisode.name}
                      </span>
                    )}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Current Episode Info */}
              {currentEpisodeData && (
                <div className="mt-6 bg-[#151515]/50 rounded-xl p-4">
                  <h3 className="text-xl font-semibold mb-2">
                    {currentEpisodeData.name || `Episode ${episode}`}
                  </h3>
                  <p className="text-gray-300">
                    {currentEpisodeData.overview || "No description available."}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(
                          currentEpisodeData.air_date
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {currentEpisodeData.runtime ||
                          show?.episode_run_time?.[0] ||
                          "N/A"}
                        m
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Episode/Cast Selector */}
            <div
              className={`bg-[#151515]/50 rounded-xl p-4 ${
                isFullScreen ? "lg:w-auto" : "lg:w-1/3"
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
