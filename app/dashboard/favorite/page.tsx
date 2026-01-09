"use client";

import { useUserProfile } from "@/hook/useUserProfile";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Play, Star, X, Calendar, ChevronDown } from "lucide-react";
import Image from "next/image";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { AddFavoriteButton } from "@/components/AddFavoriteButton";
import { Metadata } from "@/app/Metadata";

const FavoriteCard = ({
  movie,
  onClickRemove,
}: {
  movie: any;
  onClickRemove: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 ease-out group"
    >
      <div className="relative aspect-[2/3]">
        <ImageWithFallback
          src={`https://image.tmdb.org/t/p/w780${movie.imagePath}`}
          alt={movie.title}
          className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
          fallbackText="No Poster"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#333333] via-20% via-[#333333]/20 to-transparent" />

        {/* Top Right Actions - Adjusted for mobile */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5">
          <div className="flex items-center bg-gray-800/90 px-2 py-1 rounded-full backdrop-blur-sm text-xs sm:text-sm">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-amber-400 mr-1" />
            <span className="font-medium text-white">
              {Number(movie.vote_average).toFixed(1)}
            </span>
          </div>

          <AddFavoriteButton item={movie} />
        </div>
      </div>

      {/* Content Section - Adjusted padding for mobile */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 space-y-2 sm:space-y-3">
        <div>
          <h3 className="text-sm sm:text-xl font-bold text-white line-clamp-2 mb-1 leading-tight">
            {movie.title}
          </h3>
          <div className="flex items-center text-gray-300 text-xs sm:text-sm">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            {new Date(movie.release_date).getFullYear()}
            <span className="mx-1 sm:mx-2">•</span>
            <span className="font-medium truncate">
              {movie.genres[0]?.name}
            </span>
          </div>
        </div>

        {/* Action Buttons - Stack vertically on mobile */}
        <div className="flex flex-row gap-2">
          <Link
            href={`/${movie.type}/${movie.itemId}`}
            className="py-2 px-3 sm:py-2 sm:px-4 text-center bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors text-xs sm:text-sm font-medium text-white"
          >
            View Details
          </Link>
          <Link
            href={`/${movie.type}/${movie.itemId}/watch`}
            className="p-2 sm:p-2.5 bg-green-500/85 hover:bg-green-600 rounded-lg transition-colors flex items-center justify-center"
          >
            <Play className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default function Page() {
  const {
    data: favorites,
    isLoading,
    error,
  } = useUserProfile({
    queryType: "favorites",
  });
  const { removeFromFavorites } = useFavoriteStore();

  if (error) return <div className="text-red-500">Error loading favorites</div>;

  return (
    <>
      <Metadata
        seoTitle="Favorit - Dashboard"
        seoDescription="Favorit tontonan yang disimpan"
        seoKeywords="Favorite, histori, tontonan"
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6">
        {/* Header - Stack vertically on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Favorite Movies
          </h1>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button className="flex items-center text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">
              <span>Sort by</span>
              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {[...Array(10)].map((_, i) => (
              <Skeleton
                key={i}
                className="aspect-[2/3] w-full rounded-xl sm:rounded-2xl"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
              {favorites?.map((movie: any) => (
                <FavoriteCard
                  key={movie._id}
                  movie={movie}
                  onClickRemove={() =>
                    removeFromFavorites(movie._id, movie.type)
                  }
                />
              ))}
            </div>

            {favorites?.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center px-4">
                <Heart className="h-12 w-12 sm:h-16 sm:w-16 text-gray-600 mb-3 sm:mb-4" />
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-400 mb-1.5 sm:mb-2">
                  No favorites yet
                </h2>
                <p className="text-gray-600 text-sm sm:text-base max-w-md">
                  Start adding movies to your favorites by clicking the heart
                  icon on any movie page.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
