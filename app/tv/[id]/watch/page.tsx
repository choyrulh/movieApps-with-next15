"use client";

import { getDetailShow } from "@/Service/fetchMovie";
import { useStore } from "@/store/useStore";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
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
} from "lucide-react";

function page() {
  const pathname = usePathname();
  const id = pathname.split("/")[2];
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showServerDropdown, setShowServerDropdown] = useState(false);
  const [season, setSeason] = useState("1");
  const [episode, setEpisode] = useState("1");
  const [selectedServer, setSelectedServer] = useState("server 1");
  const [videoProgress, setVideoProgress] = useState({
    watched: 0,
    duration: 0,
    percentage: 0,
  });
  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false);

  const videoProgressRef = useRef(videoProgress);

  const {
    data: show,
    isLoading,
    isError,
  } = useQuery<any>({
    queryKey: ["showDetail", id],
    queryFn: () => getDetailShow(id as unknown as number, {}),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  useEffect(() => {
    videoProgressRef.current = videoProgress;
  }, [videoProgress]);

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

  const saveProgress = (progress: typeof videoProgress) => {
    if (!show) return;

    const history = JSON.parse(localStorage.getItem("watchHistory") || "{}");
    const seasonData = show.seasons.find(
      (s: any) => s.season_number === parseInt(season)
    );

    const updatedHistory: TVHistory = {
      ...history[id],
      id: show.id,
      title: show.name,
      type: "tv",
      backdrop_path: show.backdrop_path,
      poster_path: show.poster_path,
      seasons: {
        ...history[id]?.seasons,
        [season]: {
          episodes: {
            ...history[id]?.seasons?.[season]?.episodes,
            [episode]: {
              progress,
              last_updated: new Date().toISOString(),
              episode_title:
                seasonData?.episodes?.[parseInt(episode) - 1]?.name ||
                `Episode ${episode}`,
            },
          },
        },
      },
      last_watched: {
        season: parseInt(season),
        episode: parseInt(episode),
        progress: progress.percentage,
        timestamp: new Date().toISOString(),
      },
      last_updated: new Date().toISOString(),
    };

    localStorage.setItem(
      "watchHistory",
      JSON.stringify({
        ...history,
        [id]: updatedHistory,
      })
    );
  };

  const getVideoUrl = () => {
    switch (selectedServer) {
      case "server 1":
        return `https://vidlink.pro/tv/${id}/${season}/${episode}`;
      case "server 2":
        return `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}?autoPlay=false`;
      case "server 3":
        return `https://vidsrc.cc/v3/embed/tv/${id}/${season}/${episode}?autoPlay=false`;
      case "server 4":
        return `https://player.videasy.net/tv/${id}/${season}/${episode}`;
      default:
        return `https://vidlink.pro/tv/${id}/${season}/${episode}`; // Default to server 1
    }
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        Error loading data
      </div>
    );
  }

  const selectedSeasonData = show?.seasons?.find(
    (s: any) => s.season_number === parseInt(season)
  );
  const totalEpisodes = selectedSeasonData?.episode_count || 0;
  const currentEpisodeData =
    selectedSeasonData?.episodes?.[parseInt(episode) - 1];

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      <main
        className={`mx-auto pt-8 transition-all duration-500 ${
          isFullScreen ? "max-w-full" : "max-w-7xl px-4"
        }`}
      >
        {show && !isFullScreen && (
          <div className="max-w-7xl mx-auto px-4 pt-4">
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{show.name}</h1>
                <div className="flex items-center gap-4 text-gray-300 mb-4">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />S{season} E{episode}:{" "}
                    {currentEpisodeData?.name}
                  </span>
                  {videoProgress.percentage > 0 && (
                    <span className="bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full text-sm">
                      {Math.round(videoProgress.percentage)}% watched
                    </span>
                  )}
                </div>

                {/* Season & Episode Selection */}
                <div className="flex flex-wrap gap-3 mb-4">
                  {/* Season Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSeasonDropdown(!showSeasonDropdown)}
                      className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full transition-colors hover:bg-black/80"
                    >
                      <Calendar className="h-5 w-5 text-blue-400" />
                      <span className="text-sm">Season {season}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>

                    {showSeasonDropdown && (
                      <div className="absolute mt-2 w-48 bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-700 overflow-hidden z-20">
                        {show.seasons.map((s: any) => (
                          <button
                            key={s.season_number}
                            onClick={() => {
                              setSeason(s.season_number.toString());
                              setShowSeasonDropdown(false);
                              setEpisode("1");
                            }}
                            className={`w-full px-4 py-3 text-sm flex items-center gap-3 ${
                              season === s.season_number.toString()
                                ? "bg-blue-600/20 text-blue-400"
                                : "hover:bg-gray-700/30"
                            } transition-colors`}
                          >
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>Season {s.season_number}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: totalEpisodes }, (_, i) => {
                      const epNum = (i + 1).toString();
                      const history = JSON.parse(
                        localStorage.getItem("watchHistory") || "{}"
                      );
                      const epProgress =
                        history[id]?.seasons?.[season]?.episodes?.[epNum]
                          ?.progress?.percentage || 0;

                      return (
                        <button
                          key={epNum}
                          onClick={() => setEpisode(epNum)}
                          className={`px-3 py-1.5 rounded-lg relative ${
                            episode === epNum
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "bg-gray-800/50 hover:bg-gray-700/50"
                          }`}
                        >
                          <span>{epNum}</span>
                          {epProgress > 0 && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-700">
                              <div
                                className="h-full bg-blue-500 transition-all duration-300"
                                style={{ width: `${epProgress}%` }}
                              />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="hidden lg:block w-72">
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-3">Streaming Info</h3>
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

        {/* Controls */}
        <div className="flex items-center gap-4 mb-4 ml-4">
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

          <div className="relative">
            <button
              onClick={() => setShowServerDropdown(!showServerDropdown)}
              className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full transition-colors hover:bg-black/80"
            >
              <Monitor className="h-5 w-5 text-blue-400" />
              <span className="text-sm">{selectedServer}</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {showServerDropdown && (
              <div className="absolute mt-2 w-48 bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-700 overflow-hidden">
                {[1, 2, 3, 4].map((serverNum) => (
                  <button
                    key={serverNum}
                    onClick={() => {
                      setSelectedServer(`server ${serverNum}`);
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
  );
}

export default page;

interface TVHistory {
  id: number;
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
