"use client";

import { DropdownGenre } from "@/components/DropdownGenre";
import MovieCard from "@/components/movieCard";
import MovieCardSkeleton from "@/components/MovieCardSkeleton";
import { Button } from "@/components/ui/button";
import CardFragments from "@/Fragments/CardFragments";
import { getPopularMovie } from "@/Service/fetchMovie";
import { Movie } from "@/types/movie.";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { Suspense, useState } from "react";

const Banner = dynamic(() => import("@/components/Banner"), {
  ssr: true,
});
export default function Home() {
  const [page, setPage] = useState(1);

  const {
    data: movies,
    isLoading,
    isError,
  } = useQuery<Movie[]>({
    queryKey: ["movie Popular", page],

    queryFn: () => getPopularMovie(page, {}),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });
  const data = movies;
  return (
    <main className="min-h-screen">
      <Suspense fallback={<div>loading...</div>}>
        <Banner />
      </Suspense>
      <div className="container mx-auto px-4 py-8">
        <DropdownGenre />
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
              onClick={() => {
                setPage((prev) => prev + 1);
              }}
              className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg text-white font-semibold transition-colors"
            >
              Load More
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
