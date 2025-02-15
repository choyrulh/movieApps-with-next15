// src/components/AddToWatchlistButton.tsx
"use client";
import { useWatchlistStore, WatchlistItem } from "@/store/useWatchListStore";
import { Bookmark, Check } from "lucide-react";
import { motion } from "framer-motion";
import useIsMobile from "@/hook/useIsMobile"

export const AddToWatchListButton = ({ item }: { item: WatchlistItem }) => {
  const { watchlist, addToWatchlist, removeFromWatchlist } =
    useWatchlistStore();
    const isMobile = useIsMobile();

  const isInWatchlist = watchlist.some((i) => i.id === item.id);

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() =>
        isInWatchlist ? removeFromWatchlist(item.id) : addToWatchlist(item)
      }
      className="flex items-center"
    >
      <Bookmark className={`w-10 h-10 ${isInWatchlist ? "text-yellow-500 fill-yellow-500" : "text-gray-200 dark:text-white fill-none"}`} />
    </motion.button>
  );
};
