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
      className={`relative flex items-center justify-center gap-2 px-4 py-2 rounded-full transition-all duration-300 overflow-hidden ${
        isInWatchlist
          ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-600/30"
          : "bg-white/10 backdrop-blur-sm text-gray-200 dark:text-white border border-white/20 hover:bg-white/20"
      }`}
      aria-label={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
    >
      <AnimatePresence mode="wait">
        {isInWatchlist ? (
          <motion.div
            key="in-watchlist"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <Heart className="w-5 h-5 fill-white" />
            {!isMobile && (
              <span className="text-sm font-medium">In Watchlist</span>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="not-in-watchlist"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <Heart className="w-5 h-5 text-purple-400" />
            {!isMobile && (
              <span className="text-sm font-medium">Add Favorite</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Background pulse effect when added */}
      {isInWatchlist && (
        <motion.div
          initial={{ scale: 0, opacity: 0.7 }}
          animate={{ 
            scale: 2, 
            opacity: 0,
            transition: { 
              repeat: Infinity,
              duration: 1.5,
              repeatDelay: 0.5
            }
          }}
          className="absolute inset-0 bg-white rounded-full pointer-events-none"
        />
      )}
    </motion.button>
  );
};