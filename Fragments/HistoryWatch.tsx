import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "@/store/useStore";
import useIsMobile from "@/hook/useIsMobile";
import { getHistoryWatchUser } from "@/Service/fetchUser";
import { removeRecentlyWatched } from "@/Service/actionUser";
import { useAuth } from "@/context/AuthContext";

const HistoryTontonan = () => {
  // const { setHistoryData } = useStore(
  //   useShallow((state) => ({
  //     setHistoryData: state.setHistoryData,
  //   }))
  // );
  const [mediaDataHistory, setMediaDataHistory] = useState<any[]>([]);
  const isMobile = useIsMobile();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchWatchHistory = async () => {
      try {
        let data;
        if (isAuthenticated) {
          // Transformasi data API untuk struktur kompatibel
          const apiData = await getHistoryWatchUser();
          data = apiData.history.map((item: any) => ({
            ...item,
            id: item.contentId,
            progress: {
              percentage: parseFloat(item.progressPercentage),
              watched: item.durationWatched,
              duration: item.totalDuration,
            },
            // Season & episode sudah tersedia di data API
          }));
        } else {
          // Ambil dari localStorage jika tidak terautentikasi
          const localData = localStorage.getItem("watchHistory");
          if (!localData) {
            setMediaDataHistory([]);
            return;
          }

          const parsedData = JSON.parse(localData);
          data = Object.values(parsedData).map((item: any) => {
            const lastWatched = item.last_watched;
            let latestSeason: number | null = null;
            let latestEpisode: number | null = null;
            let latestTimestamp: number = 0; // ✅ Default to 0 instead of empty string

            if (item.type === "tv" && item.seasons) {
              // Iterasi semua season dan episode
              Object.entries(item.seasons).forEach(
                ([seasonNum, seasonData]: [string, any]) => {
                  Object.entries(seasonData.episodes).forEach(
                    ([episodeNum, episodeData]: [string, any]) => {
                      const episodeTimestamp = new Date(
                        episodeData.last_updated
                      ).getTime();
                      const currentLatest = latestTimestamp; // ✅ Directly use latestTimestamp (already a number)

                      if (episodeTimestamp > currentLatest) {
                        latestSeason = parseInt(seasonNum);
                        latestEpisode = parseInt(episodeNum);
                        latestTimestamp = episodeTimestamp;
                      }
                    }
                  );
                }
              );
            }

            // Ambil data episode terakhir (jika TV Show)
            const episodeData =
              latestSeason !== null && latestEpisode !== null
                ? item.seasons[latestSeason]?.episodes?.[latestEpisode]
                : null;

            return {
              ...item,
              id: item.contentId || item.id,
              progress: {
                watched:
                  episodeData?.progress?.watched || item.progress?.watched || 0,
                duration:
                  episodeData?.progress?.duration ||
                  item.progress?.duration ||
                  0,
                percentage:
                  episodeData?.progress?.percentage ||
                  item.progress?.percentage ||
                  0,
              },
              season: latestSeason || item.last_watched?.season, // Fallback ke last_watched jika perlu
              episode: latestEpisode || item.last_watched?.episode,
              episode_title: episodeData?.episode_title,
            };
          });
        }
        setMediaDataHistory(data || []);
      } catch (error) {
        console.error("Gagal memuat riwayat tontonan:", error);
        setMediaDataHistory([]);
      }
    };

    fetchWatchHistory();
  }, [isAuthenticated]); // Jalankan ulang saat status autentikasi berubah

  const fetchWatchHistory = async () => {
    try {
      let data;
      if (isAuthenticated) {
        const apiData = await getHistoryWatchUser();
        data = apiData.history.map((item: any) => ({
          ...item,
          id: item.contentId,
          progress: {
            percentage: parseFloat(item.progressPercentage),
            watched: item.durationWatched,
            duration: item.totalDuration,
          },
        }));
      } else {
        const localData = localStorage.getItem("watchHistory");
        if (!localData) {
          setMediaDataHistory([]);
          return;
        }
        const parsedData = JSON.parse(localData);
        data = Object.values(parsedData).map((item: any) => {
          // ... (kode transformasi lokal tetap sama)
        });
      }
      setMediaDataHistory(data || []);
    } catch (error) {
      console.error("Gagal memuat riwayat tontonan:", error);
      setMediaDataHistory([]);
    }
  };
  
  const handleDelete = async (mediaId: string) => {
    try {
      if (isAuthenticated) {
        await removeRecentlyWatched(mediaId);
      } else {
        const localData = localStorage.getItem("watchHistory");
        if (localData) {
          const parsedData = JSON.parse(localData);
          delete parsedData[mediaId];
          localStorage.setItem("watchHistory", JSON.stringify(parsedData));
        }
      }
      
      // Set state loading sementara
      setMediaDataHistory(prev => prev.filter(item => 
        isAuthenticated ? item._id !== mediaId : item.id !== mediaId
      ));
      
      // Lakukan fetch ulang untuk memastikan data benar-benar fresh
      await fetchWatchHistory();
    } catch (error) {
      console.error("Gagal menghapus:", error);
      // Kembalikan ke state sebelumnya jika error
      await fetchWatchHistory();
    }
  };

  // Calculate progress percentage
  const calculateProgress = (media: any) => {
    return Math.round(media.progress?.percentage || 0);
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleScroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.children[0]?.clientWidth + 16; // item width + gap (1rem = 16px)
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!mediaDataHistory || mediaDataHistory.length === 0) return null;

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between">
        <h2 className="text-xl font-bold mb-4 text-gray-200">
          History Tontonan
        </h2>
        {!isMobile && mediaDataHistory.length > 5 && (
  <div className="flex gap-2">
    <button
      onClick={() => handleScroll("left")}
      className="z-20 p-2 bg-gray-800/80 hover:bg-gray-700/90 rounded-full transition-all shadow-lg backdrop-blur-sm hover:ring-2 hover:ring-gray-500"
      aria-label="Scroll left"
    >
      <svg
        className="w-5 h-5 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </button>
    <button
      onClick={() => handleScroll("right")}
      className="z-20 p-2 bg-gray-800/80 hover:bg-gray-700/90 rounded-full transition-all shadow-lg backdrop-blur-sm"
      aria-label="Scroll right"
    >
      <svg
        className="w-5 h-5 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  </div>
)}
      </div>

      <div
        ref={scrollContainerRef}
        className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide"
      >
        {mediaDataHistory?.map((media, index) => {
          const isTVShow = media.type === "tv";
          const progressPercentage = calculateProgress(media);
          const lastWatchedSeason = media.season;
          const lastWatchedEpisode = media.episode;
          // const watched = isTVShow
          //   ? media.seasons[lastWatchedSeason].episodes[lastWatchedEpisode]
          //       .progress?.watched
          //   : media.progress?.watched;
          // const duration = isTVShow
          //   ? media.seasons[lastWatchedSeason].episodes[lastWatchedEpisode]
          //       .progress?.duration
          //   : media.progress?.duration;
          const uniqueKey = isAuthenticated
            ? media._id // Asumsi API memberikan _id unik
            : `${media.contentId}-${media.season}-${media.episode}`; // Gabungkan ID dengan season & episode

          return (
            <Link
              href={`/${media.type}/${media.id || media.contentId}/watch`}
              key={uniqueKey}
              className="flex-shrink-0 w-48 bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 relative group"
            >
              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleDelete(isAuthenticated ? media._id : media.id.toString());
                }}
                className={`absolute top-1 right-0 z-10 p-1 bg-black/50 rounded-full hover:bg-black/80 transition-colors ${
                  isMobile ? "opacity-100" : "opacity-0"
                } group-hover:opacity-100`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              {/* Badge untuk TV Show */}
              {isTVShow && (
                <div className="absolute top-1 left-1 z-10 px-2 py-1 bg-black/50 rounded text-xs">
                  S{media.season}E{media.episode}
                </div>
              )}

              <div className="relative h-32 rounded-t-lg overflow-hidden">
                <Image
                  src={`https://image.tmdb.org/t/p/w780${media.backdrop_path}`}
                  alt={media.title}
                  fill
                  // objectFit="cover"
                  className="hover:scale-105 object-cover transition-transform duration-300"
                />
                {/* Tambahkan informasi tambahan */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-white text-sm font-medium block truncate w-28">
                        {media.title}
                      </span>
                      {media.release_date && (
                        <span className="text-gray-300 text-xs">
                          {new Date(
                            media.release_date || media.first_air_date
                          ).getFullYear()}
                        </span>
                      )}
                    </div>
                    {media.runtime && (
                      <span className="text-xs bg-black/50 px-2 py-1 rounded min-w-fit">
                        {Math.floor(media.runtime / 60)}h {media.runtime % 60}m
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-2">
                <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-500 rounded-full h-full transition-all duration-300"
                    style={{
                      width: `${progressPercentage}%`,
                      minWidth: "2px",
                    }}
                  />
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  {formatTime(media.progress.watched)} /{" "}
                  {formatTime(media.progress.duration)}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Tonton {progressPercentage || 0}%
                </p>
              </div>
              {/*{isTVShow && media.episode_title && (
                <span className="block text-xs text-gray-400">
                  {media.episode_title}
                </span>
              )}*/}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryTontonan;
