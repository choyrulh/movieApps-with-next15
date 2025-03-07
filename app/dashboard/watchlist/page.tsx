"use client";

import { useUserProfile } from "@/hook/useUserProfile";
import Link from "next/link";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Play, Info, X, Calendar } from "lucide-react";
import Image from "next/image";
import { useWatchlistStore, WatchlistItem } from "@/store/useWatchListStore";
import { AddToWatchListButton } from "@/components/AddWatchListButton";

export default function Page() {
  const {
    data: watchlist,
    isLoading,
    error,
  } = useUserProfile({
    queryType: "watchlist",
  });
  const { removeFromWatchlist, syncWithServer } = useWatchlistStore();

  if (error) return <div className="text-red-500">Error loading watchlist</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Watchlist</h1>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      ) : watchlist?.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {watchlist?.map((movie: any) => (
            <MovieCard
              key={movie._id}
              movie={movie}
              onClickRemove={() => removeFromWatchlist(movie._id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          No movies in your watchlist yet. Start adding some!
        </div>
      )}
    </div>
  );
}

const MovieCard = ({
  movie,
  onClickRemove,
}: {
  movie: any;
  onClickRemove: () => void;
}) => {
  const ratingPercentage = (movie.vote_average / 10) * 100;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative aspect-[2/3] w-full rounded-xl bg-gray-900 shadow-xl hover:shadow-2xl transition-all"
    >
      {/* Image Container */}
      <div className="relative h-full w-full overflow-hidden rounded-xl">
        <Image
          src={`https://image.tmdb.org/t/p/w780${movie.poster}`}
          alt={movie.title}
          fill
          className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent">
          {/* Rating Badge */}
          <div className="flex items-center bg-black/80 px-3 py-1 rounded-full backdrop-blur-sm">
            <Star className="h-4 w-4 text-amber-400 mr-1" />
            <span className="text-sm font-medium text-white">
              {movie.vote_average}
            </span>
          </div>

          {/* Remove Button */}
          <AddToWatchListButton item={movie} />
          {/*<button 
            onClick={(e) => { e.stopPropagation(); onClickRemove(movie.movieId); }}
            className="p-1.5 bg-black/80 rounded-full backdrop-blur-sm hover:bg-red-500 transition-colors"
            aria-label="Remove from watchlist"
          >
            <X className="h-5 w-5 text-white" />
          </button>*/}
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-gray-900 via-50% via-gray-900/20 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
          <h3 className="text-lg font-semibold text-white line-clamp-2 leading-tight">
            {movie.title}
          </h3>

          <div className="flex items-center text-gray-300 text-sm">
            <Calendar className="h-4 w-4 mr-1.5" />
            {new Date(movie.release_date).getFullYear()}
            <span className="mx-2">•</span>
            <span className="truncate">
              {movie.genres?.map((g: any) => g.name).join(", ")}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Link
              href={`/movie/${movie.movieId}`}
              className="flex-1 py-2 px-4 text-center bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors text-sm font-medium text-white"
            >
              View Details
            </Link>
            <Link href={`/movie/${movie.movieId}/watch`} className="p-2 bg-blue-500/85 hover:bg-blue-600 rounded-lg transition-colors">
              <Play className="h-5 w-5 text-white" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
