// src/components/AddToWatchlistButton.tsx
"use client";
import { useWatchlistStore, WatchlistItem } from "@/store/useWatchListStore";
import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useIsMobile from "@/hook/useIsMobile";

export const AddFavoriteButton = ({ item }: { item: WatchlistItem }) => {
  const { watchlist, addToWatchlist, removeFromWatchlist } =
    useWatchlistStore();
  const isMobile = useIsMobile();
  const isInWatchlist = watchlist.some((i) => i.id === item?.id);
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() =>
        isInWatchlist ? removeFromWatchlist(item.id) : addToWatchlist(item)
      }
      className={`relative flex items-center`}
      aria-label={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
    >
      <Heart className={`w-8 h-8 ${isInWatchlist ? "text-red-500 fill-red-500" : "text-gray-200 dark:text-white fill-none"}`} />
    </motion.button>
  );
};
