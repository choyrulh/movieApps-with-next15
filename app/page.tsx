"use client";

import { DropdownGenre } from "@/components/DropdownGenre";
import MovieCard from "@/components/movieCard";
import MovieCardSkeleton from "@/components/MovieCardSkeleton";
import { Button } from "@/components/ui/button";
import { getPopularMovie, getSearchByGenre } from "@/Service/fetchMovie";
import { useStore } from "@/store/useStore";
import { Movie } from "@/types/movie.";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const Banner = dynamic(() => import("@/components/Banner"), {
  ssr: true,
});
export default function Home() {
  const [page, setPage] = useState(1);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const pathname = usePathname();
  const { genresId } = useStore();

  // Menyimpan hasil fetching ke dalam state movies tanpa menghapus yang sebelumnya

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
    queryKey: ["movie Genre", genresId],
    enabled: !!genresId,
    queryFn: () => getSearchByGenre(genresId),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });

  useEffect(() => {
    if (genresId && moviesGenre) {
      setAllMovies(moviesGenre?.results);
    } else if (movies) {
      setAllMovies((prevMovies) => {
        const movieSet = new Set(prevMovies.map((m) => m.id));
        const uniqueMovies = movies.filter((m) => !movieSet.has(m.id));
        return [...prevMovies, ...uniqueMovies];
      });
    }
  }, [movies, moviesGenre, genresId]);

  const data = movies;
  return (
    <main className="min-h-screen">
      <Suspense>
        <Banner type={pathname === "/" ? "movie" : "tv"} />
      </Suspense>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <DropdownGenre />
          {genresId && <button className="text-slate-400">Cancel</button>}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-300 mb-8 mt-5">
            {genresId ? "" : "Popular Movies"}
          </h2>
          {isLoading && allMovies.length === 0 ? (
            <MovieCardSkeleton />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {allMovies?.map((movie: Movie) => (
                  <MovieCard key={movie.id} movie={movie} />
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
                  {isLoading ? "Loading..." : "Load More"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
