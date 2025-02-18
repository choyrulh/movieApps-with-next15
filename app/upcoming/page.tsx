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
import { cn } from '@/lib/utils'

const Upcoming = () => {
  const [type, setType] = useState<"movie" | "tv">("movie");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["upcoming", type, page],
    queryFn: () => getUpcomingShow(type, page.toString()),
    // keepPreviousData: true,
    staleTime: 5000,
  });

  const handleTypeChange = (newType: "movie" | "tv") => {
    setPage(1);
    setType(newType);
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
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-6 ">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4 pt-16 px-4">
          <h1 className="text-center font-bold text-4xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Upcoming {type === "movie" ? "Movies" : "TV Shows"}
          </h1>
          <div className="flex gap-2 p-1 rounded-full bg-slate-800">
            <button
              onClick={() => handleTypeChange("movie")}
              className={cn(
                'px-6 py-2 rounded-full transition-colors',
                type === 'movie' 
                  ? 'bg-cyan-500 text-white' 
                  : 'hover:bg-slate-700 text-slate-300'
              )}
            >
              Movie
            </button>
            <button
              onClick={() => handleTypeChange("tv")}
              className={cn(
                'px-6 py-2 rounded-full transition-colors',
                type === 'tv' 
                  ? 'bg-cyan-500 text-white' 
                  : 'hover:bg-slate-700 text-slate-300'
              )}
            >
              TV/Show
            </button>
          </div>
          {/*<div className="flex gap-4">
            <Button
              variant={type === "movie" ? "destructive" : "default"}
              onClick={() => handleTypeChange("movie")}
              className="rounded-full"
            >
              Movies
            </Button>
            <Button
              variant={type === "tv" ? "destructive" : "default"}
              onClick={() => handleTypeChange("tv")}
              className="rounded-full"
            >
              TV Shows
            </Button>
          </div>*/}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton
                key={i}
                className="aspect-[2/3] rounded-xl bg-slate-800"
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
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-cyan-400 
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
                      ? "bg-cyan-500/20 text-cyan-400"
                      : "bg-slate-800 text-slate-400 hover:text-cyan-400"
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-cyan-400 
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Upcoming;
