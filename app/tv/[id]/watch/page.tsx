"use client";

import { getDetailShow } from "@/Service/fetchMovie";
import { useStore } from "@/store/useStore";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

function page() {
  const pathname = usePathname();
  const id = pathname.split("/")[2];

  const [season, setSeason] = useState("1");
  const [episode, setEpisode] = useState("1");
  // const [mediaDataHistory, setMediaDataHistory] = useState<any>();
  const [selectedServer, setSelectedServer] = useState("vidlink");
  const [videoProgress, setVideoProgress] = useState({
    watched: 0,
    duration: 0,
    percentage: 0
  });

  // Ref untuk track progress terbaru
  const videoProgressRef = useRef(videoProgress);
  useEffect(() => {
    videoProgressRef.current = videoProgress;
  }, [videoProgress]);

  const { data, isLoading, isError } = useQuery<any>({
    queryKey: ["showDetail", id],
    queryFn: () => getDetailShow(id as unknown as number, {}),

    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });

  useEffect(() => {
    // Load server preference
    const savedServer = localStorage.getItem("selectedVideoServer");
    if (savedServer) setSelectedServer(savedServer);

    // Load existing progress
    const history = JSON.parse(localStorage.getItem("watchHistory") || "{}");
    const tvHistory = history[`${id}`] as TVHistory;

    //  if (tvHistory?.last_watched) {
    //   setSeason(tvHistory.last_watched.season.toString());
    //   setEpisode(tvHistory.last_watched.episode.toString());
    // }


    if (tvHistory?.seasons?.[season]?.episodes?.[episode]) {
      setVideoProgress(tvHistory.seasons[season].episodes[episode].progress);
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://vidlink.pro') return;
      
      if (event.data?.type === 'MEDIA_DATA') {
        const mediaData = event.data.data;
        console.log(mediaData[id])
        
        if (mediaData && mediaData[id]?.progress) {
          const lastSeason = mediaData[id].last_season_watched;
          const lastEpisode = mediaData[id].last_episode_watched;

          // Menggunakan bracket notation untuk dynamic key
          const key = `s${lastSeason}e${lastEpisode}`;
          const watched = mediaData[id].show_progress[key]?.progress.watched ?? 0;
          const duration = mediaData[id].show_progress[key]?.progress.duration ?? 1; // Hindari pembagian dengan 0

          const progress = {
            watched,
            duration,
            percentage: (watched / duration) * 100
          };
          
          setVideoProgress(progress);
          
          // Update localStorage
          const history = JSON.parse(localStorage.getItem("watchHistory") || "{}");
          const seasonData = data?.seasons.find((s: any) => s.season_number === parseInt(season));
          
          history[`${id}`] = {
            ...history[`${id}`],
            id: data.id,
            title: data.name,
            type: "tv",
            backdrop_path: data.backdrop_path,
            poster_path: data.poster_path,
            last_watched: {
              ...history[`${id}`]?.last_watched, // Mengambil data sebelumnya agar tidak hilang
              videoProgress // Memastikan `videoProgress` dimasukkan dengan benar
            },
            seasons: {
              ...history[`${id}`]?.seasons,
              [season]: {
                episodes: {
                  ...history[`${id}`]?.seasons?.[season]?.episodes,
                  [episode]: {
                    progress,
                    last_updated: new Date().toISOString(),
                    episode_title: seasonData?.episodes?.[parseInt(episode) - 1]?.name || `Episode ${episode}`
                  }
                }
              }
            },
            last_updated: new Date().toISOString()
          };
          localStorage.setItem("watchHistory", JSON.stringify(history));
        }
      }
    };
    
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
      saveProgress();
    };
  }, [id, season, episode, data]);

  const saveProgress = () => {
    if (!data) return;

    const historyKey = `${id}`;
    const history = JSON.parse(localStorage.getItem("watchHistory") || "{}");
    const seasonData = data.seasons.find((s: any) => s.season_number === parseInt(season));

    const updatedHistory: TVHistory = {
      ...history[historyKey],
      id: data.id,
      title: data.name,
      type: "tv",
      backdrop_path: data.backdrop_path,
      poster_path: data.poster_path,
      seasons: {
        ...history[historyKey]?.seasons,
        [season]: {
          episodes: {
            ...history[historyKey]?.seasons?.[season]?.episodes,
            [episode]: {
              progress: videoProgressRef.current,
              last_updated: new Date().toISOString(),
              episode_title: seasonData?.episodes?.[parseInt(episode) - 1]?.name || `Episode ${episode}`
            }
          }
        }
      },
      last_watched: {
        season: parseInt(season),
        episode: parseInt(episode),
        progress: videoProgressRef.current.percentage,
        timestamp: new Date().toISOString()
      },
      last_updated: new Date().toISOString()
    };

    localStorage.setItem(
      "watchHistory",
      JSON.stringify({
        ...history,
        [historyKey]: updatedHistory,
      })
    );
  };

  const handleSeasonChange = (newSeason: string) => {
    saveProgress();
    setSeason(newSeason);
    setEpisode("1");
    setVideoProgress(0);
  };

  const handleEpisodeChange = (newEpisode: string) => {
    saveProgress();
    setEpisode(newEpisode);
    // setVideoProgress(0);
  };

  // Get video URL based on selected server
  const getVideoUrl = () => {
    switch (selectedServer) {
      case "vidlink":
        return `https://vidlink.pro/tv/${id}/${season}/${episode}`;
      case "vidsrc-v2":
        return `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}?autoPlay=false`;
      case "vidsrc-v3":
        return `https://vidsrc.cc/v3/embed/tv/${id}/${season}/${episode}?autoPlay=false`;
      default:
        return `https://vidlink.pro/tv/${id}/${season}/${episode}`;
    }
  };

  const handleServerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const server = e.target.value;
    setSelectedServer(server);
    localStorage.setItem("selectedVideoServer", server);
  };

  if (isError)
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        Error loading data
      </div>
    );

  const totalSeasons = data?.number_of_seasons || 0;
  const selectedSeasonData = data?.seasons?.find(
    (s: any) => s.season_number === parseInt(season)
  );
  const totalEpisodes = selectedSeasonData?.episode_count || 0;

  // Update tampilan progress bar
  const episodeProgressBar = (epNumber: string) => {
    const history = JSON.parse(localStorage.getItem("watchHistory") || "{}");
    return history[`${id}`]?.seasons?.[season]?.episodes?.[epNumber]?.progress?.percentage || 0;
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      <main className="max-w-7xl mx-auto px-4 pt-28 space-y-4">
        {/* Title */}
        <Link href={`/tv/${data?.id}`}>
          <h2 className="text-white text-lg">{data?.name}</h2>
        </Link>

        {/* Server Selection */}
        <div className="flex items-center gap-2">
          <label htmlFor="serverSelect" className="text-sm text-gray-300">
            Select Server:
          </label>
          <select
            id="serverSelect"
            value={selectedServer}
            onChange={handleServerChange}
            className="bg-gray-800 text-white px-3 py-1 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="vidlink">Server 1</option>
            <option value="vidsrc-v2">Server 2</option>
            <option value="vidsrc-v3">Server 3</option>
          </select>
        </div>

        {/* Season and Episode Controls */}
        <div className="space-y-4">
          <select
            value={season}
            onChange={(e) => handleSeasonChange(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg w-fit"
          >
            {Array.from({ length: totalSeasons }, (_, i) => (
              <option key={i + 1} value={(i + 1).toString()}>
                Season {i + 1}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap gap-2">
            {Array.from({ length: totalEpisodes }, (_, i) => {
              const epNumber = (i + 1).toString();
              const history = JSON.parse(
                localStorage.getItem("watchHistory") || "{}"
              );
              const episodeProgress =
                history[`${id}`]?.seasons?.[season]?.episodes?.[epNumber]
                  ?.progress || 0;

              return (
                <button
                  key={i + 1}
                  onClick={() => handleEpisodeChange(epNumber)}
                  className={`px-3 py-1 rounded-lg relative 
                    ${
                      episode === epNumber
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-800 hover:bg-gray-700"
                    }`}
                >
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${episodeProgressBar(epNumber)}%` }}
                    />
                  </div>
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Video Player */}
        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden shadow-xl">
          <iframe
            key={`${selectedServer}-${season}-${episode}`} // Force re-render
            src={getVideoUrl()}
            frameBorder="0"
            allowFullScreen
            width="100%"
            height="100%"
            className="animate-fade-in"
          />
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
