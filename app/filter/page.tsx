"use client";

import { useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FilterSection,
  genres,
  years,
  lang,
  ratings,
  types,
} from "@/components/common/FilterComponent";
import { useQuery } from "@tanstack/react-query";
import { getFiltered } from "@/Service/fetchMovie";
import MovieCard from "@/components/movieCard";
import { Movie } from "@/types/movie.";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Metadata } from "../Metadata";
import { cn } from "@/lib/utils";

function page() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    genre: [],
    sort: "",
    type: "movie",
    country: [],
    rating: 0,
    lang: [],
    year: [],
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["movies", { ...filters, page }],
    queryFn: () => getFiltered({ ...filters, page }),
    // keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  const handleFilterChange = (name: string, value: any) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  // Cek apakah ada filter yang aktif
  const hasFilters = useMemo(() => {
    return (
      filters.genre.length > 0 ||
      filters.year.length > 0 ||
      filters.lang.length > 0 ||
      filters.rating > 0 ||
      filters.type !== "movie" ||
      filters.sort !== ""
    );
  }, [filters]);

// Pastikan handleReset menggunakan array baru
const handleReset = () => {
  setFilters({
    genre: [],
    sort: "",
    type: "movie",
    country: [],
    rating: 0,
    lang: [],
    year: [],
  });
  setPage(1);
};

  return (
    <>
      <Metadata
        seoTitle="Filter"
        seoDescription="Filter movies by genre, year, country, rating, language, and type."
        seoKeywords="Filter, Genre, Year, Country, Rating, Language, Type"
      />
      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Search and Filters Row */}
        <div className="mb-8 space-y-4">
          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4">
            <FilterSection
              title="Genre"
              options={genres}
              selected={filters.genre}
              onChange={(v) => handleFilterChange("genre", v)}
              resetValue=""
            />

            <FilterSection
              title="Tahun"
              options={years}
              selected={filters.year}
              onChange={(v) => handleFilterChange("year", v)}
              resetValue=""
            />

            <FilterSection
              title="Negara"
              options={lang}
              selected={filters.lang}
              onChange={(v) => handleFilterChange("lang", v)}
              resetValue=""
            />

            <FilterSection
              title="Rating"
              options={ratings}
              selected={[filters.rating.toString()]}
              onChange={(v) => handleFilterChange("rating", parseInt(v))}
              resetValue="0"
            />

            <FilterSection
              title="Tipe"
              options={types}
              selected={[filters.type]}
              onChange={(v) => handleFilterChange("type", v)}
              resetValue="movie"
            />

            <FilterSection
              title="Urutkan"
              options={[
                { value: "newest", label: "Terbaru" },
                { value: "oldest", label: "Terlama" },
                { value: "__RESET__", label: "Cancel" }
              ]}
              selected={filters.sort}
              onChange={(value) => handleFilterChange("sort", value)}
              resetValue=""
            />


            {hasFilters && (
              <button
                onClick={handleReset}
                className={cn(
      "px-3 py-1.5 text-sm font-medium",
      "bg-gray-700/80 dark:bg-gray-800 hover:bg-red-500/20",
      "border border-red-500/30 hover:border-red-500/50",
      "text-red-400 hover:text-red-300",
      "rounded-xl transition-all duration-200",
      "flex items-center gap-2",
      "shadow-sm hover:shadow-red-500/10"
    )}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset Filter</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-lg" />
            ))}
          </div>
        ) : data?.results?.length === 0 ? (
          <p className="text-center text-lg text-gray-400">Tidak ada data</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {data?.results?.map((movie: Movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex justify-center items-center gap-4">
              <button
                onClick={() => setPage((old) => Math.max(old - 1, 1))}
                disabled={page === 1}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronLeft />
              </button>

              <span className="font-medium">
                Halaman {page} dari {data?.total_pages}
              </span>

              <button
                onClick={() => setPage((old) => (!isFetching ? old + 1 : old))}
                disabled={isFetching || page >= data?.total_pages}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronRight />
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default page;
