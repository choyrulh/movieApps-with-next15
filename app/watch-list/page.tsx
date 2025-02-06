// src/components/WatchlistPage.tsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useWatchlistStore } from "@/store/useWatchListStore";
import { Trash2 } from "lucide-react";
import Link from "next/link";

const WatchlistPage = () => {
  const { watchlist, removeFromWatchlist } = useWatchlistStore();
  console.log("watchlist: ", watchlist);

  return (
    <div className="min-h-screen dark:bg-gray-900 p-8 pt-28">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-8 text-slate-300 dark:text-white"
        >
          My Watchlist ({watchlist.length})
        </motion.h1>

        <AnimatePresence mode="popLayout">
          {watchlist.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
                Your watchlist is empty
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg"
              >
                Browse Movies
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="watchlist-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            >
              <AnimatePresence>
                {watchlist.map((item: any) => (
                  <Link
                    key={item.id}
                    href={`/${item.media_type}/${item.id}`}
                  >
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="relative group bg-transparent/10 backdrop-blur-lg shadow-lg dark:bg-gray-800 rounded-xl border border-transparent/20 overflow-hidden"
                    >
                      <button
                        onClick={() => removeFromWatchlist(item.id)}
                        className="absolute top-2 right-2 z-10 p-1.5 bg-transparent/80 dark:bg-gray-700/80 rounded-full backdrop-blur-sm hover:bg-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-800 dark:text-gray-200 hover:text-white" />
                      </button>

                      <div className="relative aspect-[2/3]">
                        <Image
                          src={
                            item.poster_path
                              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                              : "/placeholder.png"
                          }
                          alt={item.title || item.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </div>

                      <div className="p-3">
                        <h3 className="font-semibold text-gray-300 dark:text-white truncate">
                          {item.title || item.name}
                        </h3>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-purple-600 dark:text-purple-400">
                            {item.media_type === "movie"
                              ? "🎬 Movie"
                              : "📺 TV Show"}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(
                              item.release_date || item.first_air_date
                            ).getFullYear()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WatchlistPage;
