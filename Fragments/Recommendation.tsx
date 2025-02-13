// import { MovieCardSecond } from '@/components/MovieCardSecond';
// import  MovieCard  from '@/components/movieCard';
import { getRecommendedMovies, getSimilarMovies } from '@/Service/fetchMovie';
import { Movie } from '@/types/movie.';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import React, { useRef } from 'react'
import dynamic from 'next/dynamic';
const DynamicMovieCard = dynamic(() => import('@/components/movieCard'), {
  ssr: false,
})

function Recommendation({ id, type }: { id: string, type: string }) {
    const scrollContainerRefSimilar = useRef<HTMLDivElement>(null);
    const scrollContainerRefRecommended = useRef<HTMLDivElement>(null);


  const { data: similarMovies, isLoading: isSimilarLoading } = useQuery({
      queryKey: ["similarMovies", id],
      queryFn: () => getSimilarMovies(id as unknown as string, type),
      staleTime: 5 * 60 * 1000,
    });
  
    const { data: recommendedMovies, isLoading: isRecommendedLoading } = useQuery(
      {
        queryKey: ["recommendedMovies", id],
        queryFn: () => getRecommendedMovies(id as unknown as string, type ),
        staleTime: 5 * 60 * 1000,
      }
    );
  
    const handleScrollSimilar = (direction: "left" | "right") => {
      const container = scrollContainerRefSimilar.current;
      console.log("container similar: ", container);
      if (container) {
        const scrollAmount = container.children[0]?.clientWidth + 16; // item width + gap (1rem = 16px)
        container.scrollBy({
          left: direction === "left" ? -scrollAmount : scrollAmount,
          behavior: "smooth",
        });
      }
    };
    const handleScrollRecommended = (direction: "left" | "right") => {
      const container = scrollContainerRefRecommended.current;
      console.log("container recommended: ", container);
      if (container) {
        const scrollAmount = container.children[0]?.clientWidth + 16; // item width + gap (1rem = 16px)
        container.scrollBy({
          left: direction === "left" ? -scrollAmount : scrollAmount,
          behavior: "smooth",
        });
      }
    };
  return (
    <div className="mt-12 space-y-16 container mx-auto px-4">
      {/* Similar Movies Section */}
      {similarMovies?.results?.length > 0 && (
        <section>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">{`Similar ${type === "tv" ? "Series" : "Movie" }`}</h2>
            <div className="hidden md:flex gap-2">
              <button
                onClick={() => handleScrollSimilar("left")}
                className=" rounded-full bg-white/10 p-2 hover:bg-white/20"
              >
                <ChevronLeftIcon className="h-6 w-6 text-white" />
              </button>
              <button
                onClick={() => handleScrollSimilar("right")}
                className=" rounded-full bg-white/10 p-2 hover:bg-white/20"
              >
                <ChevronRightIcon className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>

          {isSimilarLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] animate-pulse rounded-2xl bg-slate-800"
                />
              ))}
            </div>
          ) : (
            <div
              ref={scrollContainerRefSimilar}
              className="scrollbar-hide relative overflow-x-auto pb-4"
            >
              <div className="flex gap-4">
                {similarMovies?.results?.map((movie: Movie) => (
                  <div key={movie.id} className="w-[200px] flex-shrink-0">
                    <DynamicMovieCard movie={movie} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}  
      

      {/* Recommended Movies Section */}
      {recommendedMovies?.results?.length > 0 && (
        <section>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">{`Recommended ${type === "tv" ? "Series" : "Movie" }`}</h2>
            <div className="hidden md:flex gap-2">
              <button
                onClick={() => handleScrollRecommended("left")}
                className=" rounded-full bg-white/10 p-2 hover:bg-white/20"
              >
                <ChevronLeftIcon className="h-6 w-6 text-white" />
              </button>
              <button
                onClick={() => handleScrollRecommended("right")}
                className=" rounded-full bg-white/10 p-2 hover:bg-white/20"
              >
                <ChevronRightIcon className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>

          {isRecommendedLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] animate-pulse rounded-2xl bg-slate-800"
                />
              ))}
            </div>
          ) : (
            <div
              ref={scrollContainerRefRecommended}
              className="scrollbar-hide relative overflow-x-auto pb-4"
            >
              <div className="flex gap-4">
                {recommendedMovies?.results?.map((movie: Movie) => (
                  <div key={movie.id} className="w-[200px] flex-shrink-0">
                    <DynamicMovieCard movie={movie} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      
    </div>
  );
}

export default Recommendation