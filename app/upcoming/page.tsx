// components/Upcoming.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import { getUpcomingShow } from "@/Service/fetchMovie";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Movie } from "@/types/movie.";
import MovieCard from "@/components/movieCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Metadata } from "../Metadata";

const Upcoming = () => {
  const [type, setType] = useState<"movie" | "tv">("movie");
  const [page, setPage] = useState(1);
  const [releaseFilter, setReleaseFilter] = useState<"all" | "month">("all");

  // Fungsi untuk menghitung rentang tanggal
  const getDateRange = () => {
    const today = new Date(); // Tanggal hari ini
    const startDate = new Date(today); // Salin objek agar tidak terpengaruh
    const endDate = new Date(today); // Buat salinan baru untuk endDate

    endDate.setDate(today.getDate() + 30); // Tambahkan 30 hari dari hari ini

    return {
      start: startDate.toISOString().split("T")[0], // Format YYYY-MM-DD
      end: endDate.toISOString().split("T")[0], // Format YYYY-MM-DD
    };
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["upcoming", type, page, releaseFilter],
    queryFn: () => {
      const params =
        releaseFilter === "month" && type === "movie" ? getDateRange() : {};
      return getUpcomingShow(type, page.toString(), params);
    },
    staleTime: 5000,
  });

  const handleTypeChange = (newType: "movie" | "tv") => {
    setPage(1);
    setType(newType);
  };

  const handleFilterChange = (filter: "all" | "month") => {
    setPage(1);
    setReleaseFilter(filter);
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8 flex items-center justify-center">
        <div className="text-red-500 text-xl">
          Error: {(error as Error).message}
        </div>
      </div>
    );
  }

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const totalPages = data?.total_pages || 0;
  const currentPage = page;

  const paginationRange = useMemo(() => {
    const range = [];
    const maxPages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    const endPage = Math.min(totalPages, startPage + maxPages - 1);

    for (let i = startPage; i <= endPage; i++) {
      range.push(i);
    }

    return range;
  }, [currentPage, totalPages]);

  return (
    <>
      <Metadata
        seoTitle="Upcoming"
        seoDescription="Upcoming movies and TV shows"
        seoKeywords="upcoming, movies, tv shows"
      />

      <section className="min-h-screen ">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-col justify-between items-center mb-12 gap-4 pt-16 px-4">
            <h1 className="text-center font-bold text-4xl text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">
              Upcoming {type === "movie" ? "Movies" : "TV Shows"}
            </h1>
            <div className="flex flex-row gap-4 items-end">
              <div className="flex gap-2 p-1 rounded-full bg-[#222222]">
                <button
                  onClick={() => handleTypeChange("movie")}
                  className={cn(
                    "px-6 py-2 rounded-full transition-colors",
                    type === "movie"
                      ? "bg-green-500 text-white"
                      : "hover:bg-green-700 text-green-300"
                  )}
                >
                  Movie
                </button>
                <button
                  onClick={() => handleTypeChange("tv")}
                  className={cn(
                    "px-6 py-2 rounded-full transition-colors",
                    type === "tv"
                      ? "bg-green-500 text-white"
                      : "hover:bg-green-700 text-green-300"
                  )}
                >
                  TV/Show
                </button>
              </div>
              {type === "movie" && (
                <div className="flex gap-2 p-1 rounded-full bg-[#222222]">
                  <button
                    onClick={() => handleFilterChange("all")}
                    className={cn(
                      "px-6 py-2 rounded-full transition-colors",
                      releaseFilter === "all"
                        ? "bg-green-500 text-white"
                        : "hover:bg-green-700 text-green-300"
                    )}
                  >
                    All
                  </button>
                  <button
                    onClick={() => handleFilterChange("month")}
                    className={cn(
                      "px-6 py-2 rounded-full transition-colors",
                      releaseFilter === "month"
                        ? "bg-green-500 text-white"
                        : "hover:bg-green-700 text-green-300"
                    )}
                  >
                    Month
                  </button>
                </div>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {[...Array(8)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="aspect-[2/3] rounded-xl bg-[#222222]"
                />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {data?.results?.map((movie: Movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>

              <div className="flex justify-center gap-4 mt-12 text-black">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  className="p-2 rounded-lg bg-[#111111] text-slate-400 hover:text-white 
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {paginationRange.map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={isLoading}
                    className={`min-w-[2.5rem] h-10 rounded-lg transition-colors
                  ${
                    pageNum === currentPage
                      ? "bg-[#333333]/20 text-white"
                      : "bg-[#111111] text-slate-400 hover:text-white"
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                  className="p-2 rounded-lg bg-[#111111] text-slate-400 hover:text-white 
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default Upcoming;
