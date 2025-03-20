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
              multi
            />

            <FilterSection
              title="Tahun"
              options={years}
              selected={filters.year}
              onChange={(v) => handleFilterChange("year", v)}
              multi
            />

            <FilterSection
              title="Negara"
              options={lang}
              selected={filters.lang}
              onChange={(v) => handleFilterChange("lang", v)}
              multi
            />

            <FilterSection
              title="Rating"
              options={ratings}
              selected={[filters.rating.toString()]}
              onChange={(v) => handleFilterChange("rating", v[0])}
              multi={false}
            />

            <FilterSection
              title="Tipe"
              options={types}
              selected={[filters.type]}
              onChange={(v) => handleFilterChange("type", v[0])}
              multi={false}
            />

            <Select
              value={filters.sort}
              onValueChange={(value) => handleFilterChange("sort", value)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Urutan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Terbaru</SelectItem>
                <SelectItem value="oldest">Terlama</SelectItem>
              </SelectContent>
            </Select>

            {hasFilters && (
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-background border hover:bg-accent text-foreground rounded-md text-sm font-medium transition-all flex items-center gap-2 shadow-sm hover:shadow-md duration-200"
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
