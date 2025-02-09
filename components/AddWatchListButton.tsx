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
      className={`flex items-center gap-2 px-4 py-2 rounded-full ${
        isInWatchlist
          ? "bg-purple-600 text-white"
          : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
      }`}
    >
      {isInWatchlist ? (
        <>
          <Check className="w-5 h-5" />
          <span>In Watchlist</span>
        </>
      ) : (
        <>
          <Bookmark className="w-5 h-5" />
          <span>{isMobile ? "watchlist" : "Add to Watchlist"}</span>
        </>
      )}
    </motion.button>
  );
};
