"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useWatchlistStore } from "@/store/useWatchListStore";
import { Trash2, Star, Film, Heart, Award } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const WatchlistPage = () => {
  const [data, setData] = useState();
  const { isAuthenticated } = useAuth();
  const { watchlist, removeFromWatchlist, syncWithServer } =
    useWatchlistStore();

  useEffect(() => {
    syncWithServer(); // Sinkronisasi saat komponen dimuat
  }, []);

  // Categorize items
  const movies = isAuthenticated
    ? watchlist?.filter((item) => item.type === "movie")
    : watchlist?.filter((item) => item.media_type === "movie");

  const tvShows = isAuthenticated
    ? watchlist?.filter((item) => item.type === "tv")
    : watchlist?.filter((item) => item.media_type === "tv");

  const people = isAuthenticated
    ? watchlist?.filter((item) => item.type === "person")
    : watchlist?.filter((item) => item.media_type === "person");

  return (
    <div className="min-h-screen dark:bg-gray-900 p-8 pt-28">
      <div className="max-w-7xl mx-auto space-y-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-slate-300 dark:text-white text-center"
        >
          My Watchlist ✨
        </motion.h1>

        <AnimatePresence>
          {watchlist.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 space-y-6"
            >
              <div className="text-6xl">🎥</div>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Start building your cinematic universe
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg"
              >
                Explore Content
              </motion.button>
            </motion.div>
          ) : (
            <div className="space-y-16">
              {/* Movies Section */}
              {movies?.length > 0 && (
                <section className="space-y-6">
                  <motion.h2
                    initial={{ x: -20 }}
                    animate={{ x: 0 }}
                    className="text-2xl font-bold text-slate-300 dark:text-white flex items-center gap-2"
                  >
                    <span className="bg-purple-600 w-2 h-8 rounded"></span>
                    Movies ({movies.length})
                  </motion.h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    <AnimatePresence>
                      {movies.map((item) => (
                        <MediaCard
                          key={item.movieId}
                          item={item}
                          remove={removeFromWatchlist}
                          type="movie"
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              )}

              {/* TV Shows Section */}
              {tvShows?.length > 0 && (
                <section className="space-y-6">
                  <motion.h2
                    initial={{ x: -20 }}
                    animate={{ x: 0 }}
                    className="text-2xl font-bold text-slate-300 dark:text-white flex items-center gap-2"
                  >
                    <span className="bg-teal-600 w-2 h-8 rounded"></span>
                    TV Shows ({tvShows.length})
                  </motion.h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    <AnimatePresence>
                      {tvShows.map((item, index) => (
                        <MediaCard
                          key={index}
                          item={item}
                          remove={removeFromWatchlist}
                          type="tv"
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              )}

              {/* People Section */}
              {people?.length > 0 && (
                <section className="space-y-6">
                  <motion.h2
                    initial={{ x: -20 }}
                    animate={{ x: 0 }}
                    className="text-2xl font-bold text-slate-300 dark:text-white flex items-center gap-2"
                  >
                    <span className="bg-pink-500 w-2 h-8 rounded"></span>
                    Favorite Stars ({people.length})
                  </motion.h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    <AnimatePresence>
                      {people.map((person) => (
                        <PersonCard
                          key={person.id}
                          person={person}
                          remove={removeFromWatchlist}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const PersonCard = ({ person, remove }: any) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="group relative w-full bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl overflow-hidden border border-slate-700/50 transition-all duration-500"
  >
    {/* Remove button with improved animation */}
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={(e) => {
        e.preventDefault();
        remove(person.id);
      }}
      className="absolute top-3 right-3 z-30 p-2 bg-red-500/90 hover:bg-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg shadow-red-500/20"
    >
      <Heart className="w-4 h-4 text-white" strokeWidth={2.5} />
    </motion.button>

    <Link href={`/person/${person.id}`} className="block">
      <div className="relative">
        {/* Image container with enhanced hover effect */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="h-full w-full"
          >
            <Image
              src={
                person.profile_path
                  ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
                  : "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=500"
              }
              alt={person.name}
              fill
              className="object-cover transition-all duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </motion.div>

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-transparent to-transparent" />

          {/* Popularity badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 backdrop-blur-sm rounded-full border border-yellow-500/30"
          >
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-semibold text-yellow-200">
              {Math.round(person.popularity)}
            </span>
          </motion.div>
        </div>

        {/* Content section */}
        <div className="relative p-6 pt-5">
          {/* Name with gradient effect */}
          <h3 className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-pink-200 to-purple-200">
            {person.name}
          </h3>

          {/* Role badge */}
          <div className="inline-flex items-center px-3 py-1 mb-4 bg-purple-600/80 border border-purple-600/20 rounded-full">
            <Award className="w-4 h-4 mr-2 text-pink-400" />
            <span className="text-sm font-medium text-pink-200">
              {person.known_for_department}
            </span>
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
);

const MediaCard = ({ item, remove, type }: any) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="relative group bg-gradient-to-b from-white/5 to-transparent rounded-xl overflow-hidden hover:shadow-xl transition-shadow"
  >
    <button
      onClick={() => remove(item.id || item.movieId)}
      className="absolute top-3 right-3 z-10 p-1.5 bg-gray-800/80 rounded-lg backdrop-blur-sm hover:bg-red-500/80 transition-colors"
    >
      <Trash2 className="w-4 h-4 text-gray-300 hover:text-white" />
    </button>
    <Link href={`/${type}/${item.id || item.movieId}`}>
      <div className="relative aspect-[2/3]">
        <Image
          src={
            item.poster
              ? `https://image.tmdb.org/t/p/w500${item.poster}`
              : `https://image.tmdb.org/t/p/w500${item.poster_path}`
          }
          alt={item.title || item.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="font-semibold text-gray-100 truncate">
          {item.title || item.name}
        </h3>
        <div className="flex justify-between items-center mt-2 text-sm">
          <span className="bg-purple-600/80 px-2 py-1 rounded-md">
            {type === "movie" ? "🎬 Movie" : "📺 TV Show"}
          </span>
          <span className="text-gray-300">
            {new Date(item.release_date || item.first_air_date).getFullYear()}
          </span>
        </div>
      </div>
    </Link>
  </motion.div>
);

export default WatchlistPage;
