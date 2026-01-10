// src/components/AddToWatchlistButton.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useWatchlistStore, WatchlistItem } from "@/store/useWatchListStore";
import { Bookmark } from "lucide-react";
import { motion } from "framer-motion";
import useIsMobile from "@/hook/useIsMobile";
import { getCookie } from "@/Service/fetchUser";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export const AddToWatchListButton = ({ item }: { item: WatchlistItem }) => {
  const token = getCookie("user");
  const { watchlist, addToWatchlist, removeFromWatchlist, syncWithServer } =
    useWatchlistStore();
  const [isInWatchlist, setIsInWatchlist] = useState(() => {
    if (!watchlist) return false;

    const movieId = item.movieId
      ? item.movieId.toString()
      : item.id?.toString();

    return token
      ? watchlist.some(
          (i: WatchlistItem) => i.movieId && i.movieId.toString() === movieId
        )
      : watchlist.some((i) => i.id && i.id.toString() === movieId);
  });
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    syncWithServer();
  }, [syncWithServer]);

  useEffect(() => {
    if (!watchlist) {
      setIsInWatchlist(false);
      return;
    }

    const movieId = item.movieId
      ? item.movieId.toString()
      : item.id?.toString();

    setIsInWatchlist(
      token
        ? watchlist.some(
            (i: WatchlistItem) => i.movieId && i.movieId.toString() === movieId
          )
        : watchlist.some((i) => i.id && i.id.toString() === movieId)
    );
  }, [watchlist, token, item.id, item.movieId]);

  const handleToggleWatchlist = async () => {
    try {
      if (isInWatchlist) {
        const idToRemove = item.id || item.movieId;
        await removeFromWatchlist(idToRemove);
        toast("Removed From Watchlist");
      } else {
        const payload: WatchlistItem = {
          ...item,
          movieId: item.id, // ID dari film
          title: item.title || item.name || "", // Gunakan langsung dari `item`
          poster_path: item.poster_path, // Gunakan langsung dari `item`
          type: (pathname.split("/")[1] || item.type || "movie") as
            | "movie"
            | "tv"
            | "person",
          release_date: item.release_date || item.first_air_date,
          backdrop_path: item.backdrop_path,
          vote_average: item.vote_average,
          genres: item.genres,
          media_type:
            item.media_type || (pathname.split("/")[1] as any) || "movie",
        };
        await addToWatchlist(payload);
        toast("Added to Watchlist");
      }
      // Sync is called inside store
    } catch (error) {
      console.error(error);
      toast("Failed to update watchlist");
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleToggleWatchlist}
      className="flex items-center"
    >
      <Bookmark
        className={`w-10 h-10 ${
          isInWatchlist
            ? "text-yellow-500 fill-yellow-500"
            : "text-gray-200 dark:text-white fill-none"
        }`}
      />
    </motion.button>
  );
};
