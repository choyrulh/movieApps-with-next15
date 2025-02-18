'use client'

import { useQuery } from '@tanstack/react-query'
import { getGenres, getSearchByGenre } from '@/Service/fetchMovie'
import { Movie, Genre } from '@/types/movie'
import { motion } from 'framer-motion'
import { useState, useCallback, useMemo } from 'react'
import MovieCard from '@/components/MovieCard'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from "lucide-react";

const GenrePage = () => {
  const [selectedGenre, setSelectedGenre] = useState<number | null>(28)
  const [page, setPage] = useState(1)

  const { data: genres } = useQuery({
    queryKey: ['genres'],
    queryFn: getGenres,
  })

  const { data: movies, isLoading } = useQuery({
    queryKey: ['genre-movies', selectedGenre, page],
    queryFn: () => getSearchByGenre(selectedGenre!, page),
    enabled: !!selectedGenre,
    keepPreviousData: true,
  })

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 space-y-4 mt-16">
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Explore Genres
          </h1>
          
          <div className="flex flex-wrap gap-2">
            {genres ? (
              genres?.genres?.map((genre: Genre) => (
                <button
                  key={genre.id}
                  onClick={() => {
                    setSelectedGenre(genre.id)
                    setPage(1)
                  }}
                  className={cn(
                    'px-4 py-2 rounded-full border transition-all',
                    selectedGenre === genre.id
                      ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400'
                      : 'border-slate-600 hover:border-cyan-400/40 text-slate-300 hover:text-cyan-300'
                  )}
                >
                  {genre.name}
                </button>
              ))
            ) : (
              <div className="flex gap-2">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-24 rounded-full bg-slate-800" />
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
                  <Skeleton key={i} className="aspect-[2/3] rounded-xl bg-slate-800" />
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
    </div>
  )
}

export default GenrePage