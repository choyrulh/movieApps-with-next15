import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import useIsMobile from "@/hook/useIsMobile";
import { getHistoryWatchUser } from "@/Service/fetchUser";
import { removeRecentlyWatched } from "@/Service/actionUser";
import { useAuth } from "@/context/AuthContext";

const HistoryTontonan = () => {
  const [mediaDataHistory, setMediaDataHistory] = useState<any[]>([]);
  const isMobile = useIsMobile();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();

  // Fungsi utilitas untuk menghitung progress dengan aman
  const calculateProgressPercentage = (media: any): number => {
    // Untuk data dari API (authenticated)
    if (isAuthenticated) {
      return Math.round(media.progress?.percentage || 0);
    }

    // Untuk data dari localStorage (non-authenticated)
    const progress = media.progress;
    
    // Jika sudah ada percentage, langsung pakai
    if (progress?.percentage) {
      return Math.round(progress.percentage);
    }
    
    // Hitung percentage dari watched dan duration
    if (progress?.watched && progress?.duration && progress.duration > 0) {
      const percentage = (progress.watched / progress.duration) * 100;
      return Math.min(Math.round(percentage), 100); // Maksimal 100%
    }
    
    // Fallback untuk TV shows dengan episode data
    if (media.type === "tv" && media.season && media.episode) {
      const episodeData = media.seasons?.[media.season]?.episodes?.[media.episode];
      if (episodeData?.progress?.percentage) {
        return Math.round(episodeData.progress.percentage);
      }
    }
    
    return 0;
  };

  // Fungsi untuk memformat data secara konsisten
  const formatMediaData = (data: any[]): any[] => {
    return data.map((item) => {
      const baseData = {
        ...item,
        id: item.contentId || item.id,
        type: item.type || "movie", // default ke movie jika tidak ada
      };

      // Untuk data authenticated dari API
      if (isAuthenticated) {
        return {
          ...baseData,
          progress: {
            percentage: parseFloat(item.progressPercentage) || 0,
            watched: item.durationWatched || 0,
            duration: item.totalDuration || 0,
          },
        };
      }

      // Untuk data non-authenticated dari localStorage
      let progressData = {
        watched: 0,
        duration: 0,
        percentage: 0,
      };

      // Cek apakah ini TV show dengan seasons
      if (item.type === "tv" && item.seasons) {
        let latestSeason: number | null = null;
        let latestEpisode: number | null = null;
        let latestTimestamp: number = 0;

        Object.entries(item.seasons).forEach(([seasonNum, seasonData]: [string, any]) => {
          Object.entries(seasonData.episodes).forEach(([episodeNum, episodeData]: [string, any]) => {
            const episodeTimestamp = new Date(episodeData.last_updated).getTime();
            if (episodeTimestamp > latestTimestamp) {
              latestSeason = parseInt(seasonNum);
              latestEpisode = parseInt(episodeNum);
              latestTimestamp = episodeTimestamp;
              // Simpan progress data dari episode terbaru
              progressData = {
                watched: episodeData.progress?.watched || 0,
                duration: episodeData.progress?.duration || 0,
                percentage: episodeData.progress?.percentage || 0,
              };
            }
          });
        });

        return {
          ...baseData,
          progress: progressData,
          season: latestSeason,
          episode: latestEpisode,
          episode_title: latestSeason && latestEpisode 
            ? item.seasons[latestSeason]?.episodes?.[latestEpisode]?.episode_title 
            : null,
        };
      }

      // Untuk movie atau data sederhana
      return {
        ...baseData,
        progress: {
          watched: item.progress?.watched || 0,
          duration: item.progress?.duration || 0,
          percentage: item.progress?.percentage || 0,
        },
      };
    });
  };

  useEffect(() => {
    const fetchWatchHistory = async () => {
      try {
        let data;
        
        if (isAuthenticated) {
          const apiData = await getHistoryWatchUser();
          data = apiData.history || [];
        } else {
          const localData = localStorage.getItem("watchHistory");
          if (!localData) {
            setMediaDataHistory([]);
            return;
          }
          const parsedData = JSON.parse(localData);
          data = Object.values(parsedData);
        }

        const formattedData = formatMediaData(data);
        setMediaDataHistory(formattedData);
        
      } catch (error) {
        console.error("Gagal memuat riwayat tontonan:", error);
        setMediaDataHistory([]);
      }
    };

    fetchWatchHistory();
  }, [isAuthenticated]);

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

      setMediaDataHistory((prev) =>
        prev.filter((item) =>
          isAuthenticated ? item._id !== mediaId : item.id !== mediaId
        )
      );
    } catch (error) {
      console.error("Gagal menghapus:", error);
    }
  };

  const formatRemainingTime = (watched: number, duration: number) => {
    if (!duration || !watched) return "Belum ditonton";
    const remaining = duration - watched;
    if (remaining <= 0) return "Selesai";
    const minutes = Math.floor(remaining / 60);
    return `${minutes}m tersisa`;
  };

  const handleScroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!mediaDataHistory || mediaDataHistory.length === 0) return null;

  return (
    <div className="relative w-full py-8 group/section">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-end gap-3">
          <h2 className="text-2xl font-bold text-white tracking-wide">
            Lanjutkan Menonton
          </h2>
          <span className="text-sm text-gray-400 mb-1 hidden sm:block">
            {mediaDataHistory.length} Judul
          </span>
        </div>

        {/* Desktop Navigation Arrows */}
        {!isMobile && mediaDataHistory.length > 3 && (
          <div className="flex gap-2">
            <button
              onClick={() => handleScroll("left")}
              className="p-2 rounded-full bg-white/5 hover:bg-white/20 border border-white/10 transition-all text-white backdrop-blur-sm"
              aria-label="Scroll left"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              onClick={() => handleScroll("right")}
              className="p-2 rounded-full bg-white/5 hover:bg-white/20 border border-white/10 transition-all text-white backdrop-blur-sm"
              aria-label="Scroll right"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        )}
      </div>

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 md:gap-6 overflow-x-auto pb-8 pt-2 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollPaddingLeft: '1rem' }}
      >
        {mediaDataHistory.map((media) => {
          const isTVShow = media.type === "tv";
          const progressPercentage = calculateProgressPercentage(media);
          const uniqueKey = isAuthenticated
            ? media._id
            : `${media.id}-${media.season}-${media.episode}`;

          return (
            <div
              key={uniqueKey}
              className="relative flex-shrink-0 snap-start group"
            >
              <Link
                href={`/${media.type}/${media.id}/watch${isTVShow && media.season && media.episode ? `?season=${media.season}&episode=${media.episode}` : ''}`}
                className="block w-64 sm:w-72 md:w-80"
              >
                {/* Image Container */}
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-gray-900 shadow-lg group-hover:shadow-2xl group-hover:shadow-amber-500/10 transition-all duration-300 ring-1 ring-white/10 group-hover:ring-amber-500/50">
                  
                  {/* Backdrop Image */}
                  <Image
                    src={`https://image.tmdb.org/t/p/w780${media.backdrop_path}`}
                    alt={media.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out opacity-90 group-hover:opacity-100"
                  />

                  {/* Dark Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />

                  {/* Centered Play Icon on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-90 group-hover:scale-100">
                    <div className="w-12 h-12 rounded-full bg-amber-500/90 flex items-center justify-center shadow-lg backdrop-blur-sm pl-1">
                      <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleDelete(isAuthenticated ? media._id : media.id.toString());
                    }}
                    className="absolute top-2 right-2 p-2 bg-black/40 hover:bg-red-500/80 rounded-full text-white/70 hover:text-white transition-all backdrop-blur-md opacity-0 group-hover:opacity-100 z-20"
                    title="Hapus dari history"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col justify-end">
                    
                    {/* TV Show Badge */}
                    {isTVShow && media.season && media.episode && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded backdrop-blur-md border border-white/10">
                          S{media.season} E{media.episode}
                        </span>
                      </div>
                    )}

                    {/* Progress Bar - SELALU TAMPIL */}
                    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mb-1">
                      <div
                        className="bg-green-500 rounded-full h-full transition-all duration-300"
                        style={{
                          width: `${progressPercentage}%`,
                          minWidth: "2px",
                        }}
                      />
                    </div>
                    
                    {/* Time Info */}
                    <div className="flex justify-between items-center text-[11px] font-medium text-gray-300">
                      <span>
                        {formatRemainingTime(media.progress.watched, media.progress.duration)}
                      </span>
                      <span>{progressPercentage}%</span>
                    </div>
                  </div>
                </div>

                {/* Title Below Card */}
                <div className="mt-3 px-1">
                  <h3 className="text-sm font-semibold text-gray-100 truncate group-hover:text-amber-400 transition-colors">
                    {media.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    {media.release_date && (
                      <span>{new Date(media.release_date).getFullYear()}</span>
                    )}
                    {media.episode_title && isTVShow && (
                      <>
                        <span className="w-1 h-1 bg-gray-600 rounded-full" />
                        <span className="truncate max-w-[150px]">{media.episode_title}</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryTontonan;