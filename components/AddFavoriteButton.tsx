// src/components/AddToWatchlistButton.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useFavoriteStore, FavoriteItem } from "@/store/useFavoriteStore";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import useIsMobile from "@/hook/useIsMobile";
import { getCookie } from "@/Service/fetchUser";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export const AddFavoriteButton = ({ item }: { item: any }) => {
  const token = getCookie("user");
  const { favorites, addToFavorites, removeFromFavorites, syncWithServer } =
    useFavoriteStore();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { isAuthenticated } = useAuth();
  // Improved isFavorite logic
  const isFavorite =
    favorites?.some(
      (i: FavoriteItem) =>
        i.itemId === (item.itemId ?? item.id) &&
        i.type === (item.type ?? item.media_type)
    ) ?? false;

  useEffect(() => {
    syncWithServer();
  }, [syncWithServer]);

  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        const idToRemove = item.id || item.itemId;
        const type = item.media_type || item.type || "movie";
        await removeFromFavorites(idToRemove, type);
        toast("Removed From Favorites");
      } else {
        const payload: FavoriteItem = {
          itemId: item.id,
          type: item.media_type || item.type || "movie",
          title: item.title || item.name,
          name: item.name || item.title,
          imagePath: item.poster_path || item.profile_path,
          release_date: item.release_date || item.first_air_date,
          backdrop_path: item.backdrop_path,
          vote_average: item.vote_average,
          genres: item.genres || [],
          id: item.id,
          media_type: item.media_type || item.type || "movie",
        };
        await addToFavorites(payload);
        toast("Added to Favorites");
      }
    } catch (error) {
      console.error(error);
      toast("Failed to update favorites");
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleToggleFavorite}
      className="flex items-center"
    >
      <Heart
        className={`w-8 h-8 ${
          isFavorite
            ? "text-red-500 fill-red-500"
            : "text-gray-200 dark:text-white fill-none"
        }`}
      />
    </motion.button>
  );
};
