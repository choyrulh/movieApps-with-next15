"use client";

import { BannerSkeleton } from "@/components/Banner";
import { DropdownGenre } from "@/components/DropdownGenre";
import MovieCard from "@/components/movieCard";
import MovieCardSkeleton from "@/components/MovieCardSkeleton";
import { Button } from "@/components/ui/button";
import HistoryTontonan from "@/Fragments/HistoryWatch";
import { getPopularMovie, getSearchByGenre } from "@/Service/fetchMovie";
import { useStore } from "@/store/useStore";
import { Movie } from "@/types/movie.";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import axios from "axios";

const Banner = dynamic(() => import("@/components/Banner"), {
  ssr: true,
});
export default function Home() {
  const [page, setPage] = useState(1);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const pathname = usePathname();
  const { genresId, setSelectedGenresId, historyData } = useStore(
    useShallow((state) => ({
      genresId: state.genresId,
      historyData: state.historyData,
      setSelectedGenresId: state.setSelectedGenresId,
    }))
  );

  const {
    data: movies,
    isLoading,
    isError,
  } = useQuery<Movie[]>({
    queryKey: ["movie Popular", page],
    enabled: !genresId,
    queryFn: () => getPopularMovie(page, {}),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });

  const {
    data: moviesGenre,
    isLoading: isLoadingGenre,
    isError: isErrorGenre,
  } = useQuery<{ results: Movie[] }>({
    queryKey: ["movie Genre", genresId, page],
    enabled: !!genresId,
    queryFn: () => getSearchByGenre(genresId as string, page),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });

  useEffect(() => {
    // Kirim request tracking saat komponen dimount
    const trackAccess = async () => {
      try {
        await axios.post(
          "https://backend-movie-apps-api-one.vercel.app/api/logs",
          {},
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      } catch (error) {
        console.error("Tracking error:", error);
      }
    };

    trackAccess();
  }, []);

  useEffect(() => {
    if (genresId && moviesGenre) {
      setAllMovies(moviesGenre?.results);
    } else if (movies && !genresId) {
      setAllMovies((prevMovies) => {
        const movieSet = new Set(prevMovies.map((m) => m.id));
        const uniqueMovies = movies?.filter((m) => !movieSet.has(m.id));
        return [...prevMovies, ...uniqueMovies];
      });
    }
  }, [movies, moviesGenre, genresId]);

  const data = movies;
  return (
    <main className="min-h-screen">
      <Suspense fallback={<BannerSkeleton />}>
        <Banner type={pathname === "/" ? "movie" : "tv"} />
      </Suspense>
      <div className="container mx-auto px-4 py-8">
        <HistoryTontonan />
        <div className="flex items-center gap-4 mb-4">
          <DropdownGenre />
          {genresId && (
            <button
              onClick={() => {
                setSelectedGenresId(null), setAllMovies([]);
              }}
              className="text-slate-400"
            >
              Cancel
            </button>
          )}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-300 mb-8 mt-5">
            {genresId ? "" : "Popular Movies"}
          </h2>
          {isLoading && allMovies.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              <MovieCardSkeleton />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {allMovies?.map((movie: Movie, index: number) => (
                  <MovieCard 
                  key={movie.id || `movie-${index}`} 
                  movie={movie} />
                ))}
              </div>
              <div className="flex justify-center mt-8">
                <Button
                  type="button"
                  onClick={() => {
                    setPage((prev) => prev + 1);
                  }}
                  className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg text-white font-semibold transition-colors"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> loading
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
      <ScrollToTopButton />
    </main>
  );
}
