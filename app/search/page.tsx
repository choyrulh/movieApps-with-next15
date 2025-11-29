"use client";

import { useState, useEffect, memo, useCallback, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Loader2,
  Filter,
  Film,
  Tv,
  Users,
  Layout,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { getSearch, getSearchFilter } from "@/Service/fetchMovie";
import MovieCardSkeleton from "@/components/MovieCardSkeleton";
import { Movie } from "@/types/movie.";
import MovieCard from "@/components/movieCard";
import { useStore } from "@/store/useStore";
import { useShallow } from "zustand/react/shallow";
import CastsCard from "@/components/CastsCard";
import Link from "next/link";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { Metadata } from "../Metadata";

const contentTypes = [
  { value: "movie", label: "Movies", icon: Film },
  { value: "tv", label: "TV Shows", icon: Tv },
  { value: "person", label: "People", icon: Users },
  { value: "multi", label: "All", icon: Layout },
];

const MemoizedSearchIcon = memo(Search);
const MemoizedClearIcon = memo(X);

const SearchResultsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedAutocompleteIndex, setSelectedAutocompleteIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { selectedType, setSelectedType } = useStore(
    useShallow((state) => ({
      selectedType: state.selectedType,
      setSelectedType: state.setSelectedType,
    }))
  );

  // Query untuk autocomplete (lebih cepat, tidak perlu debounce panjang)
  const { data: autocompleteData, isLoading: isAutocompleteLoading } = useQuery({
    queryKey: ["autocomplete", searchQuery, selectedType],
    queryFn: () => getSearchFilter(searchQuery, selectedType, "1"),
    enabled: searchQuery.length > 1 && showAutocomplete,
    staleTime: 2 * 60 * 1000,
  });

  // Query untuk hasil pencarian utama
  const { data, isLoading, isError } = useQuery({
    queryKey: ["searchMovies", debouncedQuery, selectedType, page],
    queryFn: () =>
      getSearchFilter(debouncedQuery, selectedType, page.toString()),
    enabled: debouncedQuery.length > 3,
    staleTime: 5 * 60 * 1000,
  });

  // Debounce search input
  useEffect(() => {
    if (searchQuery.length <= 3) {
      setDebouncedQuery("");
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowAutocomplete(false);
        setSelectedAutocompleteIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allMovies = useMemo(() => {
    if (!data?.results) return [];

    const movieSet = new Set();
    return data.results.filter((movie: Movie) => {
      if (movieSet.has(movie.id)) return false;
      movieSet.add(movie.id);
      return true;
    });
  }, [data?.results]);

  // Autocomplete suggestions (limit 5)
  const autocompleteSuggestions = useMemo(() => {
    if (!autocompleteData?.results) return [];
    return autocompleteData.results.slice(0, 5);
  }, [autocompleteData?.results]);

  const typeSearch = useMemo(() => {
    switch (selectedType) {
      case "movie":
        return "🎬";
      case "tv":
        return "📺";
      case "person":
        return "👤";
      default:
        return "🔍";
    }
  }, [selectedType]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowAutocomplete(true);
    setSelectedAutocompleteIndex(-1);
  }, []);

  const handleClear = useCallback(() => {
    setSearchQuery("");
    setDebouncedQuery("");
    setPage(1);
    setShowAutocomplete(false);
    setSelectedAutocompleteIndex(-1);
  }, []);

  const handleSelectSuggestion = useCallback((item: Movie) => {
    const title = item.title || item.name || "";
    setSearchQuery(title);
    setDebouncedQuery(title);
    setShowAutocomplete(false);
    setSelectedAutocompleteIndex(-1);
    setPage(1);
  }, []);

  // Keyboard navigation for autocomplete
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showAutocomplete || autocompleteSuggestions.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedAutocompleteIndex((prev) =>
            prev < autocompleteSuggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedAutocompleteIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedAutocompleteIndex >= 0) {
            handleSelectSuggestion(
              autocompleteSuggestions[selectedAutocompleteIndex]
            );
          } else {
            setShowAutocomplete(false);
          }
          break;
        case "Escape":
          setShowAutocomplete(false);
          setSelectedAutocompleteIndex(-1);
          break;
      }
    },
    [showAutocomplete, autocompleteSuggestions, selectedAutocompleteIndex, handleSelectSuggestion]
  );

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

  // Helper function to get item title
  const getItemTitle = (item: Movie) => {
    return item.title || item.name || "Unknown";
  };

  // Helper function to get item year
  const getItemYear = (item: Movie) => {
    const date = item.release_date || item.first_air_date;
    return date ? new Date(date).getFullYear() : "";
  };

  return (
    <>
      <Metadata
        seoTitle="Search"
        seoDescription={`Discover ${typeSearch} results for "${searchQuery}"`}
        seoKeywords={`search, ${searchQuery}, ${selectedType}`}
      />
      <div className="min-h-screen">
        {/* Search Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-50 bg-black/90 shadow-xl"
        >
          <div className="container mx-auto px-4 py-6">
            <div ref={searchRef} className="relative max-w-2xl mx-auto">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                {searchQuery ? (
                  <MemoizedClearIcon
                    onClick={handleClear}
                    className="stroke-slate-400 h-5 w-5 text-slate-400 cursor-pointer transition-all duration-200 hover:text-red-400"
                  />
                ) : (
                  <MemoizedSearchIcon className="h-5 w-5 text-slate-400" />
                )}
              </div>
              
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={() => searchQuery.length > 1 && setShowAutocomplete(true)}
                placeholder={`Search ${selectedType}...`}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#222222]/50 text-white placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent
                transition-all duration-200"
                autoFocus
                autoComplete="off"
              />

              {/* Autocomplete Dropdown */}
              <AnimatePresence>
                {showAutocomplete && searchQuery.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute w-full mt-2 bg-[#1a1a1a]/95 backdrop-blur-xl border border-slate-700 rounded-lg overflow-hidden shadow-2xl"
                  >
                    {isAutocompleteLoading ? (
                      <div className="p-4 flex items-center justify-center gap-2 text-slate-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Searching...</span>
                      </div>
                    ) : autocompleteSuggestions.length > 0 ? (
                      <div className="max-h-80 overflow-y-auto">
                        {autocompleteSuggestions.map((item: Movie, index: number) => {
                          const isSelected = index === selectedAutocompleteIndex;
                          const isPerson = selectedType === "person" || item.media_type === "person";
                          
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleSelectSuggestion(item)}
                              className={`w-full px-4 py-3 flex items-center gap-3 transition-colors text-left
                                ${isSelected ? "bg-green-500/20" : "hover:bg-slate-800/50"}
                              `}
                            >
                              {/* Image/Icon */}
                              <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-slate-800">
                                {isPerson ? (
                                  item.profile_path ? (
                                    <img
                                      src={`https://image.tmdb.org/t/p/w92${item.profile_path}`}
                                      alt={getItemTitle(item)}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Users className="h-6 w-6 text-slate-600" />
                                    </div>
                                  )
                                ) : item.poster_path ? (
                                  <img
                                    src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                                    alt={getItemTitle(item)}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    {selectedType === "tv" ? (
                                      <Tv className="h-6 w-6 text-slate-600" />
                                    ) : (
                                      <Film className="h-6 w-6 text-slate-600" />
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="text-white font-medium truncate">
                                  {getItemTitle(item)}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                  {isPerson ? (
                                    <>
                                      <Users className="h-3 w-3" />
                                      <span>{item.known_for_department || "Actor"}</span>
                                    </>
                                  ) : (
                                    <>
                                      {selectedType === "tv" || item.media_type === "tv" ? (
                                        <Tv className="h-3 w-3" />
                                      ) : (
                                        <Film className="h-3 w-3" />
                                      )}
                                      <span>{getItemYear(item) || "N/A"}</span>
                                      {item.vote_average > 0 && (
                                        <>
                                          <span>•</span>
                                          <span className="flex items-center gap-1">
                                            ⭐ {item.vote_average.toFixed(1)}
                                          </span>
                                        </>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Trending indicator if popular */}
                              {item.popularity && item.popularity > 100 && (
                                <TrendingUp className="h-4 w-4 text-green-400 flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-slate-400 text-sm">
                        No suggestions found
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Filter Buttons */}
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-4 gap-2 p-1 bg-[#111111]/50 rounded-lg">
            {contentTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.value;
              return (
                <button
                  key={type.value}
                  onClick={() => {
                    setSelectedType(type.value);
                    setPage(1);
                    setShowAutocomplete(false);
                    inputRef.current?.focus();
                  }}
                  className={`
                    flex flex-col items-center justify-center p-3 rounded-lg
                    transition-all duration-200 gap-2
                    ${
                      isSelected
                        ? "bg-green-500/20 text-green-400 shadow-lg"
                        : "hover:bg-green-600/50 text-gray-400 hover:text-green-200"
                    }
                  `}
                >
                  <Icon
                    className={`h-5 w-5 ${isSelected ? "text-green-400" : ""}`}
                  />
                  <span className="text-xs font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Section */}
        <div className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {!debouncedQuery ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20 text-gray-400"
              >
                <div className="text-4xl mb-4">{typeSearch}</div>
                <p className="text-xl">{`Start typing to search ${selectedType}`}</p>
                <p className="text-sm mt-2 text-slate-500">
                  Use ↑↓ to navigate autocomplete, Enter to select
                </p>
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
            ) : data?.results?.length === 0 ? (
              <motion.div
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20 text-slate-400"
              >
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-xl">
                  No results found for "{debouncedQuery}"
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
              >
                {allMovies.map((movie: Movie, index: number) => (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {(selectedType === "multi" &&
                      movie.media_type === "person") ||
                    selectedType === "person" ? (
                      <CastsCard numberOrder={false} member={movie} />
                    ) : (
                      <MovieCard movie={movie} />
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {data?.total_pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-green-400 
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
                      ? "bg-green-500/20 text-green-400"
                      : "bg-slate-800 text-slate-400 hover:text-green-400"
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-green-400 
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
        <ScrollToTopButton />
      </div>
    </>
  );
};

export default SearchResultsPage;