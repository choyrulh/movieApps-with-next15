"use client";

import { useUserProfile } from "@/hook/useUserProfile";
import Link from "next/link";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Play, X, Calendar } from "lucide-react";
import Image from "next/image";
import { useWatchlistStore } from "@/store/useWatchListStore";
import { AddToWatchListButton } from "@/components/AddWatchListButton";
import { Metadata } from "@/app/Metadata";

export default function Page() {
  const {
    data: watchlist,
    isLoading,
    error,
  } = useUserProfile({
    queryType: "watchlist",
  });
  const { removeFromWatchlist } = useWatchlistStore();

  if (error)
    return <div className="text-red-500 px-4">Error loading watchlist</div>;

  return (
    <>
      <Metadata
        seoTitle="Watchlist - Dashboard"
        seoDescription="Watchlist Histori Tontonan"
        seoKeywords="Watchlist, histori, tontonan"
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6">
        {/* Header */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 px-2">
          My Watchlist
        </h1>

        {isLoading ? (
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
            {[...Array(10)].map((_, i) => (
              <Skeleton
                key={i}
                className="aspect-[2/3] w-full rounded-lg sm:rounded-xl"
              />
            ))}
          </div>
        ) : watchlist?.length > 0 ? (
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
            {watchlist?.map((movie: any) => (
              <MovieCard
                key={movie._id}
                movie={movie}
                onClickRemove={() => removeFromWatchlist(movie._id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center px-4">
            <div className="mb-4 p-4 bg-gray-800 rounded-full">
              <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-300 mb-2">
              Your Watchlist is Empty
            </h2>
            <p className="text-gray-400 text-sm sm:text-base max-w-md">
              Start adding movies to watch later by clicking the "+ Watchlist"
              button on any movie page.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

const MovieCard = ({
  movie,
  onClickRemove,
}: {
  movie: any;
  onClickRemove: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative aspect-[2/3] w-full rounded-lg sm:rounded-xl bg-gray-900 shadow-lg hover:shadow-xl transition-shadow"
    >
      {/* Image Container */}
      <div className="relative h-full w-full overflow-hidden rounded-lg sm:rounded-xl">
        <Image
          src={`https://image.tmdb.org/t/p/w780${movie.poster}`}
          alt={movie.title}
          fill
          className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-2 sm:p-3 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent">
          {/* Rating Badge */}
          <div className="flex items-center bg-black/80 px-2 py-1 sm:px-3 sm:py-1 rounded-full backdrop-blur-sm">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-amber-400 mr-1" />
            <span className="text-xs sm:text-sm font-medium text-white">
              {Number(movie.vote_average).toFixed(1)}
            </span>
          </div>

          {/* Remove Button */}
          <AddToWatchListButton item={movie} />
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-gray-900 via-50% via-gray-900/20 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 space-y-2 sm:space-y-3">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white line-clamp-2 leading-tight">
            {movie.title}
          </h3>

          <div className="flex items-center text-gray-300 text-xs sm:text-sm">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            {new Date(movie.release_date).getFullYear()}
            <span className="mx-1 sm:mx-2">•</span>
            <span className="truncate">
              {movie.genres?.map((g: any) => g.name).join(", ")}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row gap-2">
            <Link
              href={`/${movie.type}/${movie.movieId}`}
              className="py-2 px-3 sm:py-2 sm:px-4 text-center bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors text-xs sm:text-sm font-medium text-white"
            >
              View Details
            </Link>
            <Link
              href={`/${movie.type}/${movie.movieId}/watch`}
              className="p-2 sm:p-2.5 bg-blue-500/85 hover:bg-blue-600 rounded-lg transition-colors flex items-center justify-center"
            >
              <Play className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
