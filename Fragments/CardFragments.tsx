"use client";

import { DropdownGenre } from "@/components/DropdownGenre";
import MovieCardSkeleton from "@/components/MovieCardSkeleton";
// import MovieCard from "@/components/movieCard";
import { Button } from "@/components/ui/button";
import { getNowPlaying, getPopularMovie } from "@/Service/fetchMovie";
import { Movie } from "@/types/movie.";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";

const MovieCard = dynamic(() => import("@/components/movieCard"), {
  ssr: false,
});

function CardFragments() {
  const {
    data: movies,
    isLoading,
    isError,
  } = useQuery<Movie[]>({
    queryKey: ["movie Popular"],

    queryFn: () => getPopularMovie(1, {}),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });
  const data = movies;
  console.log("data1:", movies);

  return (
    <div>
      <h2 className="text-3xl font-bold text-black mb-8 mt-5">
        Popular Movies
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {isLoading ? (
          <MovieCardSkeleton />
        ) : (
          data?.map((movie: Movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))
        )}
      </div>
      <div className="flex justify-center mt-8">
        <Button
          type="button"
          // onClick={() => setPage((prev) => prev + 1)}
          className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg text-white font-semibold transition-colors"
        >
          Load More
        </Button>
      </div>
    </div>
  );
}

export default CardFragments;
