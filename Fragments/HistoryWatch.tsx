import { useEffect, useState, useRef, useMemo } from "react";
import Image from "next/image";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import Link from "next/link";
import useIsMobile from "@/hook/useIsMobile";
import { getHistoryWatchUser } from "@/Service/fetchUser";
import { removeRecentlyWatched } from "@/Service/actionUser";
import { useAuth } from "@/context/AuthContext";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

// --- COMPONENTS ---

const HistorySkeleton = () => {
  return (
    <div className="flex gap-4 md:gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="relative flex-shrink-0 w-64 sm:w-72 md:w-80">
          {/* Image Skeleton with smooth shimmer */}
          <div className="aspect-video w-full rounded-xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/20 to-transparent animate-shimmer" />
          </div>

          {/* Title Skeleton */}
          <div className="mt-3 space-y-2">
            <div className="h-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-[length:200%_100%] animate-shimmer rounded w-3/4" />
            <div className="h-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-[length:200%_100%] animate-shimmer rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

// 2. Main Component
const HistoryTontonan = () => {
  const isMobile = useIsMobile();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // --- LOCAL STORAGE LOGIC (GUEST) ---
  const [localHistory, setLocalHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      const localData = localStorage.getItem("watchHistory");
      if (localData) {
        const parsed = JSON.parse(localData);
        setLocalHistory(Object.values(parsed));
      }
    }
  }, [isAuthenticated]);

  // --- TANSTACK QUERY LOGIC (AUTHENTICATED) ---
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["watchHistory"],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await getHistoryWatchUser(pageParam);
      return res; // Harapkan struktur: { history: [], pagination: { hasMore: bool } }
    },
    getNextPageParam: (lastPage, allPages) => {
      // Cek metadata pagination dari backend
      const { current, totalPages, hasMore } = lastPage.pagination || {};

      // Logic fallback jika backend belum return pagination sempurna
      if (hasMore) {
        return allPages.length + 1;
      }
      return undefined;
    },
    enabled: !!isAuthenticated, // Hanya jalan jika login
    staleTime: 1000 * 60 * 5, // 5 menit
  });

  // --- INFINITE SCROLL OBSERVER (HORIZONTAL) ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: scrollContainerRef.current, // Observe relative to the scroll container
        threshold: 0.5,
        rootMargin: "0px 100px 0px 0px", // Pre-fetch sebelum mentok kanan
      }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // --- DATA FORMATTING & MERGING ---

  // Fungsi Helper Progress
  const calculateProgressPercentage = (media: any): number => {
    if (isAuthenticated) {
      return Math.round(
        media.progress?.percentage || media.progressPercentage || 0
      );
    }

    // Logic Local Storage (Existing)
    const progress = media.progress;
    if (progress?.percentage) return Math.round(progress.percentage);
    if (progress?.watched && progress?.duration) {
      return Math.min(
        Math.round((progress.watched / progress.duration) * 100),
        100
      );
    }
    // Logic TV Local
    if (media.type === "tv" && media.season && media.episode) {
      const episodeData =
        media.seasons?.[media.season]?.episodes?.[media.episode];
      if (episodeData?.progress?.percentage)
        return Math.round(episodeData.progress.percentage);
    }
    return 0;
  };

  // Gabungkan data
  const mediaDataHistory = useMemo(() => {
    if (isAuthenticated && data) {
      // Flatten pages dari infinite query
      return data.pages
        .flatMap((page: any) => page.history)
        .map((item: any) => ({
          ...item,
          id: item.contentId || item.id,
          // Format API structure ke UI structure
          progress: {
            percentage: parseFloat(item.progressPercentage) || 0,
            watched: item.durationWatched || 0,
            duration: item.totalDuration || 0,
          },
          // Pastikan ID unik untuk React Key
          _uniqueId: item._id,
        }));
    } else {
      // Format Local Storage Data (Logic Existing disederhanakan untuk brevity)
      return localHistory.map((item) => {
        // ... (Logic pemformatan local storage yang sudah ada, copy paste dari file asli di bagian formatMediaData untuk local part)
        // Agar kode ringkas, saya asumsikan localHistory sudah raw object,
        // logic formatting detail bisa dipanggil di render atau di useEffect

        // Note: Untuk hasil terbaik, copy logic `formatMediaData` bagian `!isAuthenticated` kesini
        // atau gunakan helper function terpisah.

        // Simplified return for Guest:
        return { ...item, _uniqueId: `${item.id}-${item.season || "m"}` };
      });
    }
  }, [isAuthenticated, data, localHistory]);

  // Logic Local Storage Formatting (Ditaruh ulang agar tidak hilang fungsionalitas guest)
  const formattedLocalData = useMemo(() => {
    if (isAuthenticated) return [];

    // Re-use logic from original code for Guest
    return localHistory
      .map((item) => {
        // ... copy paste logic formatMediaData bagian else ...
        // Disini saya menyederhanakan agar tidak duplikat panjang,
        // namun intinya mapping structure raw localStorage ke UI
        let progressData = { watched: 0, duration: 0, percentage: 0 };
        let season = null;
        let episode = null;
        let epTitle = null;
        let latestDate = 0;

        if (item.type === "tv" && item.seasons) {
          // Logic cari episode terakhir (sama seperti code asli)
          Object.entries(item.seasons).forEach(
            ([sNum, sData]: [string, any]) => {
              Object.entries(sData.episodes).forEach(
                ([eNum, eData]: [string, any]) => {
                  const ts = new Date(
                    eData.last_updated || eData.last_update || 0
                  ).getTime();
                  if (ts > latestDate) {
                    season = parseInt(sNum);
                    episode = parseInt(eNum);
                    latestDate = ts;
                    progressData = eData.progress || progressData;
                    epTitle = eData.episode_title;
                  }
                }
              );
            }
          );
        } else {
          progressData = item.progress || progressData;
          latestDate = new Date(
            item.last_update || item.update_at || 0
          ).getTime();
        }

        return {
          ...item,
          id: item.contentId || item.id,
          progress: progressData,
          season,
          episode,
          episode_title: epTitle,
          _uniqueId: `${item.id}-${season || "movie"}`,
          // Ensure we have a consistent field for sorting
          last_update: latestDate
            ? new Date(latestDate).toISOString()
            : new Date().toISOString(),
          _sortTimeStamp: latestDate,
        };
      })
      .sort((a: any, b: any) => {
        return b._sortTimeStamp - a._sortTimeStamp;
      });
  }, [localHistory, isAuthenticated]);

  const finalDisplayData = isAuthenticated
    ? mediaDataHistory
    : formattedLocalData;

  // --- HANDLERS ---
  const handleDelete = async (mediaId: string) => {
    try {
      if (isAuthenticated) {
        await removeRecentlyWatched(mediaId);
        // Invalidate query agar refetch data terbaru
        queryClient.invalidateQueries({ queryKey: ["watchHistory"] });
      } else {
        const localData = localStorage.getItem("watchHistory");
        if (localData) {
          const parsedData = JSON.parse(localData);
          delete parsedData[mediaId];
          localStorage.setItem("watchHistory", JSON.stringify(parsedData));
          setLocalHistory(Object.values(parsedData));
        }
      }
    } catch (error) {
      console.error("Gagal menghapus:", error);
    }
  };

  const handleScroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 800;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // const formatRemainingTime = (watched: number, duration: number) => {
  //   if (!duration || !watched) return "Belum ditonton";
  //   const remaining = duration - watched;
  //   if (remaining <= 0) return "Selesai";
  //   const minutes = Math.floor(remaining / 60);
  //   return `${minutes}m tersisa`;
  // };

  const formatCurrentProgress = (watched: number) => {
    if (!watched || watched <= 0) return "Baru dimulai";
    
    const minutes = Math.floor(watched / 60);
    const seconds = Math.floor(watched % 60);

    if (minutes > 0) {
      return `${minutes} : ${seconds}`;
    }
    return `00 : ${seconds}d`;
  };
  // --- RENDER ---
  if (!isLoading && (!finalDisplayData || finalDisplayData.length === 0))
    return null;

  return (
    <div className="relative w-full py-8 group/section">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-end gap-3">
          <h2 className="text-2xl font-bold text-white tracking-wide">
            Lanjutkan Menonton
          </h2>
        </div>

        {/* Desktop Navigation Arrows */}
        {!isMobile && finalDisplayData.length > 3 && (
          <div className="flex gap-2">
            <button
              onClick={() => handleScroll("left")}
              className="p-2 rounded-full bg-white/5 hover:bg-white/20 border border-white/10 transition-all text-white backdrop-blur-sm"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
              className="p-2 rounded-full bg-white/5 hover:bg-white/20 border border-white/10 transition-all text-white backdrop-blur-sm"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 md:gap-6 overflow-x-auto pb-8 pt-2 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollPaddingLeft: "1rem" }}
      >
        {/* Loading Initial State */}
        {isLoading && isAuthenticated ? (
          <HistorySkeleton />
        ) : (
          <>
            {finalDisplayData.map((media) => {
              const isTVShow = media.type === "tv";
              const progressPercentage = calculateProgressPercentage(media);
              // Gunakan _uniqueId yang sudah disiapkan
              const key = media._uniqueId || media.id;

              return (
              <div
                key={key}
                className="relative flex-shrink-0 snap-start group"
              >
                <Link
                  href={`/${media.type}/${media.id}/watch${
                    isTVShow && media.season && media.episode
                      ? `?season=${media.season}&episode=${media.episode}`
                      : ""
                  }`}
                  className="block w-64 sm:w-72 md:w-80"
                >
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-gray-900 shadow-lg group-hover:shadow-2xl group-hover:shadow-amber-500/10 transition-all duration-300 ring-1 ring-white/10 group-hover:ring-amber-500/50">
                    <ImageWithFallback
                      src={
                        media.backdrop_path
                          ? `https://image.tmdb.org/t/p/w780${media.backdrop_path}`
                          : ""
                      }
                      alt={media.title || "Untitled"}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out opacity-90 group-hover:opacity-100"
                      fallbackText="No Image"
                    />
                    
                    {/* Overlay gelap di bagian bawah agar teks putih terbaca jelas */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent opacity-90" />

                    {/* Tombol Play (Tengah) */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-90 group-hover:scale-100">
                      <div className="w-12 h-12 rounded-full bg-amber-500/90 flex items-center justify-center shadow-lg backdrop-blur-sm pl-1 border border-black/10">
                        <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>

                    {/* Tombol Hapus (Kanan Atas) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleDelete(isAuthenticated ? media._id : media.id.toString());
                      }}
                      className="absolute top-2 right-2 p-2 bg-black/40 hover:bg-red-500/80 rounded-full text-white/70 hover:text-white transition-all backdrop-blur-md opacity-0 group-hover:opacity-100 z-20"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    {/* --- POSISI BARU: JUDUL & EPISODE DI ATAS PROGRESS BAR --- */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col justify-end z-10">
                      
                      {/* Row Judul & Episode */}
                      <div className="flex justify-between items-end gap-3 mb-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm md:text-base font-bold text-white drop-shadow-lg truncate group-hover:text-amber-400 transition-colors">
                            {media.title}
                          </h3>
                          {/* Info Tambahan (Tahun) di bawah judul kecil saja */}
                          <p className="text-[9px] text-gray-400 opacity-80">
                            {media.release_date ? new Date(media.release_date).getFullYear() : ""}
                          </p>
                        </div>

                        {/* Episode di paling kanan pinggir */}
                        {isTVShow && media.season && media.episode && (
                          <div className="flex-shrink-0 mb-1">
                            <span className="text-[10px] text-white md:text-[11px] font-black uppercase tracking-wider bg-amber-500 text-black px-2 py-0.5 rounded shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                              S{media.season}E{media.episode}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Progress Bar Area */}
                      <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mb-1.5">
                        <div
                          className="bg-green-500 rounded-full h-full transition-all duration-300 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                          style={{
                            width: `${progressPercentage}%`,
                            minWidth: "2px",
                          }}
                        />
                      </div>

                      {/* Time Progress */}
                      <div className="flex justify-between items-center text-[10px] font-medium text-gray-300">
                        <span className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                          {formatCurrentProgress(media.progress.watched)}
                        </span>
                        <span className="text-white/80">{progressPercentage}%</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
              );
            })}

            {/* Load More Trigger / Loading State for Infinite Scroll */}
            {isAuthenticated && hasNextPage && (
              <div
                ref={loadMoreRef}
                className="flex-shrink-0 w-12 flex items-center justify-center"
              >
                {isFetchingNextPage ? (
                  <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="w-1 h-full" /> // Invisible trigger
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HistoryTontonan;
