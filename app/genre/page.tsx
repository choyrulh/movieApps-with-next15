"use client";

import { useQuery } from "@tanstack/react-query";
import { getGenres, getSearchByGenre } from "@/Service/fetchMovie";
import { Movie } from "@/types/movie.";
import { motion } from "framer-motion";
import { useState, useCallback, useMemo } from "react";
import MovieCard from "@/components/movieCard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Metadata } from "../Metadata";

const GenrePage = () => {
  const [selectedGenre, setSelectedGenre] = useState<number | null>(28);
  const [page, setPage] = useState(1);

  const { data: genres } = useQuery({
    queryKey: ["genres"],
    queryFn: getGenres,
  });

  const { data: movies, isLoading } = useQuery({
    queryKey: ["genre-movies", selectedGenre, page],
    queryFn: () => getSearchByGenre(selectedGenre!.toString(), page.toString()),
    enabled: !!selectedGenre,
    // keepPreviousData: true,
  });

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const totalPages = movies?.total_pages || 0;
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
        seoTitle="Explore Genres"
        seoDescription="Explore movies by genre"
        seoKeywords="movies, genres, action, comedy, horror, thriller"
      />
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-12 space-y-4 mt-16">
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
              Explore Genres
            </h1>

            <div className="flex flex-wrap gap-2">
              {genres ? (
                genres?.genres?.map((genre: any) => (
                  <button
                    key={genre.id}
                    onClick={() => {
                      setSelectedGenre(genre.id);
                      setPage(1);
                    }}
                    className={cn(
                      "px-4 py-2 rounded-full border transition-all",
                      selectedGenre === genre.id
                        ? "border-green-400 bg-green-400/10 text-green-400"
                        : "border-slate-600 hover:border-green-400/40 text-slate-300 hover:text-green-300"
                    )}
                  >
                    {genre.name}
                  </button>
                ))
              ) : (
                <div className="flex gap-2">
                  {[...Array(10)].map((_, i) => (
                    <Skeleton
                      key={i}
                      className="h-10 w-24 rounded-full bg-[#333333]"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {selectedGenre && (
            <>
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {[...Array(10)].map((_, i) => (
                    <Skeleton
                      key={i}
                      className="aspect-[2/3] rounded-xl bg-[#333333]"
                    />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                >
                  {movies?.results?.map((movie: Movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </motion.div>
              )}

              <div className="flex justify-center items-center gap-2 mt-8">
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
      </div>
    </>
  );
};

export default GenrePage;
