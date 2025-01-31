"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { getSearch } from "@/Service/fetchMovie";
import MovieCardSkeleton from "@/components/MovieCardSkeleton";
import { Movie } from "@/types/movie.";
import MovieCard from "@/components/movieCard";

const SearchResultsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["searchMovies", debouncedQuery],
    queryFn: () => getSearch(debouncedQuery),
    enabled: debouncedQuery.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Search Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-slate-800 shadow-xl"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies..."
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 
                focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent
                transition-all duration-200"
              autoFocus
            />
          </div>
        </div>
      </motion.div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {debouncedQuery.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 text-slate-400"
            >
              <div className="text-4xl mb-4">🎬</div>
              <p className="text-xl">Start typing to search movies</p>
            </motion.div>
          ) : isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            >
              {[...Array(10)].map((_, index) => (
                <MovieCardSkeleton key={index} />
              ))}
            </motion.div>
          ) : isError ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 text-red-400"
            >
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-xl mb-4">Failed to load search results</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          ) : data?.results.length === 0 ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 text-slate-400"
            >
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-xl">No results found for "{debouncedQuery}"</p>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            >
              {data?.results.map((movie: Movie, index: number) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <MovieCard movie={movie} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Load More Button (Optional) */}
        {data?.page < data?.total_pages && (
          <div className="flex justify-center mt-8">
            <button
              className="px-6 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 
                transition-colors flex items-center gap-2"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
