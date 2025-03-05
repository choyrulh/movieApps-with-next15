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

export const AddFavoriteButton = ({ item }: { item: FavoriteItem }) => {
  console.log("item: ", item)
  const token = getCookie("user");
  const { favorites, addToFavorites, removeFromFavorites, syncWithServer } =
    useFavoriteStore();
  // const [isFavorite, setIsFavorite] = useState(favorites?.some((i) => i.itemId === item.id && i.type === item.type));
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { isAuthenticated } = useAuth();
  const isFavorite = favorites?.some((i: FavoriteItem) => i.itemId === item.id || item.itemId) ?? false;

  // Determine item type from URL path
  // const itemType = pathname.split("/")[1] === 'movies' ? 'movie' :
  //                 pathname.split("/")[1] === 'tv' ? 'tv' :
  //                 'movie'; // default to movie

  useEffect(() => {
    syncWithServer();
  }, [syncWithServer]);

  // useEffect(() => {
  //   setIsFavorite(
  //     token
  //       ? favorites?.some((i) => i.itemId === item.id && i.type === itemType)
  //       : favorites?.some((i) => i.id === item.id)
  //   );
  // }, [favorites, token, item.id]);

  const handleToggleFavorite = async () => {
    if (token && isAuthenticated) {
      try {
        const endpoint = isFavorite
          ? `https://backend-movie-apps-api-one.vercel.app/api/favorites/${
              item.id || item.itemId
            }?type=${item.media_type || item.type}`
          : `https://backend-movie-apps-api-one.vercel.app/api/favorites`;

        const response = await fetch(endpoint, {
          method: isFavorite ? "DELETE" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: isFavorite
            ? undefined
            : JSON.stringify({
                itemId: item.id,
                type: item.media_type,
                title: item.title || item.name,
                name: item.name || item.title,
                imagePath: item.poster_path || item.profile_path,
                release_date: item.release_date || item.first_air_date,
                backdrop_path: item.backdrop_path,
                vote_average: item.vote_average?.toString(),
                genres: item.genres || [],
              }),
        });

        isFavorite
          ? toast("Removed From Favorites")
          : toast("Added to Favorites");

        if (!response.ok) {
          throw new Error("Failed to update favorites");
        }

        syncWithServer();
      } catch (error) {
        console.error(error);
      }
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
