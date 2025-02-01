import { Rating } from "@/components/common/Rating";
import { getSearch } from "@/Service/fetchMovie";
import { Movie } from "@/types/movie.";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Loader, StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Recommendation = ({ movieTitle }: { movieTitle: string }) => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, isRefetching } = useQuery<{
    results: Movie[];
  }>({
    queryKey: ["recommendations", movieTitle],
    queryFn: () => getSearch(movieTitle.substring(0, 3)),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  if (isLoading) {
    return <RecommendationSkeleton />;
  }

  if (isError) {
    return null;
  }
  if (data?.results.length === 0) {
    return (
      <section className="mt-16 pb-16 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-8">
            Recommended Movies
          </h2>
          <div className="text-slate-400 text-center py-8">
            No recommendations available
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-16 pb-16 relative" aria-label="Recommended movies">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-white mb-8">
          Recommended Movies
        </h2>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent z-20 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-900 via-slate-900/80 to-transparent z-20 pointer-events-none" />

          <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide">
            {data?.results.slice(0, 8).map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Extracted Movie Card Component
const MovieCard = ({ movie }: { movie: Movie }) => (
  <Link
    href={`/movie/${movie.id}`}
    className="group relative min-w-[260px] flex-1 transition-transform duration-300 hover:z-10"
    aria-label={`View details for ${movie.title}`}
  >
    <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
      {movie.poster_path ? (
        <Image
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title || "Movie poster"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 260px"
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        />
      ) : (
        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
          <span className="text-slate-500 text-center px-2">
            No image available
          </span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="text-white font-semibold line-clamp-2">{movie.title}</p>
        <div className="flex items-center gap-2 text-sm">
          <Rating value={movie.vote_average / 2} />{" "}
          {/* Adjust for 5-star scale */}
          <span className="text-slate-400">
            {movie.release_date?.split("-")[0] || "N/A"}
          </span>
        </div>
      </div>
    </div>

    <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-slate-900/80 rounded-full backdrop-blur-sm">
      <StarIcon className="w-4 h-4 text-amber-400" />
      <span className="text-white text-sm">
        {movie.vote_average.toFixed(1)}
      </span>
    </div>
  </Link>
);

// Extracted Skeleton Component
const RecommendationSkeleton = () => (
  <div className="mt-16 pb-16">
    <div className="h-8 w-40 bg-slate-800 rounded-full mb-8 animate-pulse" />
    <div className="flex gap-6 overflow-x-auto pb-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="min-w-[260px] flex-1">
          <div className="relative aspect-[2/3] bg-slate-800 rounded-xl overflow-hidden shadow-lg animate-pulse" />
          <div className="h-4 bg-slate-800 rounded-full mt-4 w-3/4 mx-auto" />
        </div>
      ))}
    </div>
  </div>
);

export default Recommendation;
