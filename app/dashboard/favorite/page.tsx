"use client";

import { useUserProfile } from "@/hook/useUserProfile";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart,
  Play,
  Info,
  Clock,
  Sparkles,
  ChevronDown,
  Star,
  X,
  Calendar,
  Film,
} from "lucide-react";
import Image from "next/image";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { AddFavoriteButton } from "@/components/AddFavoriteButton";

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
      className="relative bg-gray-900 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 ease-out group"
    >
      {/* Image Section with Overlay */}
      <div className="relative aspect-[2/3]">
        <Image
          src={`https://image.tmdb.org/t/p/w780${movie.imagePath}`}
          alt={movie.title}
          className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
          fill
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-20% via-transparent to-transparent" />

        {/* Top Right Actions */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <div className="flex items-center bg-gray-800/90 px-2.5 py-1 rounded-full backdrop-blur-sm">
            <Star className="h-4 w-4 text-amber-400 mr-1" />
            <span className="text-sm font-medium text-white">
              {movie.vote_average}
            </span>
          </div>

          <AddFavoriteButton item={movie} />
          {/*<button
            onClick={(e) => { e.stopPropagation(); onClickRemove(movie.itemId, movie.type); }}
            className="p-1.5 bg-gray-800/90 rounded-full backdrop-blur-sm hover:bg-red-500 transition-colors"
            aria-label="Remove"
          >
            <X className="h-5 w-5 text-gray-300 hover:text-white transition-colors" />
          </button>*/}
        </div>
      </div>

      {/* Content Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
        {/* Title and Metadata */}
        <div>
          <h3 className="text-xl font-bold text-white line-clamp-2 mb-1.5 leading-tight">
            {movie.title}
          </h3>
          <div className="flex items-center text-gray-300 text-sm">
            <Calendar className="h-4 w-4 mr-1.5" />
            {new Date(movie.release_date).getFullYear()}
            <span className="mx-2">•</span>
            <span className="font-medium">{movie.genres[0]?.name}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            href={`/movie/${movie.itemId}`}
            className="flex-1 py-2.5 px-4 text-center bg-white/5 hover:bg-white/10 rounded-lg backdrop-blur-sm transition-colors"
          >
            <span className="text-sm font-semibold text-white">Details</span>
          </Link>
          <button className="p-2.5 bg-blue-500/85 hover:bg-blue-600 rounded-lg transition-colors">
            <Play className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Helper function untuk genre (buat file terpisah)
const getGenreName = (genreId: number) => {
  const genres: { [key: number]: string } = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    // Tambahkan genre lainnya
  };
  return genres[genreId] || "Unknown";
};

export default function Page() {
  const {
    data: favorites,
    isLoading,
    error,
  } = useUserProfile({
    queryType: "favorites",
  });
  const { addToFavorites, removeFromFavorites, syncWithServer } =
    useFavoriteStore();

  if (error) return <div className="text-red-500">Error loading favorites</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Favorite Movies
        </h1>
        <div className="flex items-center space-x-4">
          <button className="flex items-center text-sm text-gray-400 hover:text-white transition-colors">
            <span>Sort by</span>
            <ChevronDown className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {favorites?.map((movie: any) => (
              <FavoriteCard
                key={movie._id}
                movie={movie}
                onClickRemove={() => removeFromFavorites(movie._id, movie.type)}
              />
            ))}
          </div>

          {favorites?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Heart className="h-16 w-16 text-gray-600 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-400 mb-2">
                No favorites yet
              </h2>
              <p className="text-gray-600 max-w-md">
                Start adding movies to your favorites by clicking the heart icon
                on any movie page.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
