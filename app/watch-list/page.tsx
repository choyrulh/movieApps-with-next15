"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useWatchlistStore } from "@/store/useWatchListStore";
import { Trash2, Star, Film } from "lucide-react";
import Link from "next/link";

const WatchlistPage = () => {
  const { watchlist, removeFromWatchlist } = useWatchlistStore();
  
  // Categorize items
  const movies = watchlist.filter(item => item.media_type === 'movie');
  const tvShows = watchlist.filter(item => item.media_type === 'tv');
  const people = watchlist.filter(item => item.media_type === 'person');

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
              {movies.length > 0 && (
                <section className="space-y-6">
                  <motion.h2 
                    initial={{ x: -20 }}
                    animate={{ x: 0 }}
                    className="text-2xl font-bold text-slate-300 dark:text-white flex items-center gap-2">
                    <span className="bg-purple-600 w-2 h-8 rounded"></span>
                    Movies ({movies.length})
                  </motion.h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    <AnimatePresence>
                      {movies.map((item) => (
                        <MediaCard 
                          key={item.id}
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
              {tvShows.length > 0 && (
                <section className="space-y-6">
                  <motion.h2 
                    initial={{ x: -20 }}
                    animate={{ x: 0 }}
                    className="text-2xl font-bold text-slate-300 dark:text-white flex items-center gap-2">
                    <span className="bg-teal-600 w-2 h-8 rounded"></span>
                    TV Shows ({tvShows.length})
                  </motion.h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    <AnimatePresence>
                      {tvShows.map((item) => (
                        <MediaCard 
                          key={item.id}
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
{people.length > 0 && (
  <section className="space-y-6">
    <motion.h2 
      initial={{ x: -20 }}
      animate={{ x: 0 }}
      className="text-2xl font-bold text-slate-300 dark:text-white flex items-center gap-2"
    >
      <span className="bg-pink-500 w-2 h-8 rounded"></span>
      Favorite Stars ({people.length})
    </motion.h2>
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
    initial={{ opacity: 0, scale: 0.95, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9 }}
    whileHover={{ scale: 1.03 }}
    transition={{ type: "spring", stiffness: 300 }}
    className="group relative h-full bg-gradient-to-br from-pink-500/10 to-purple-500/10 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl border border-white/5 hover:border-white/20 transition-all duration-300"
  >
    <button
      onClick={(e) => {
        e.preventDefault();
        remove(person.id);
      }}
      className="absolute top-4 right-4 z-20 p-2 bg-red-500/90 rounded-full backdrop-blur-lg opacity-0 group-hover:opacity-100 transform transition-all duration-300 hover:scale-110 shadow-lg hover:bg-red-400"
    >
      <Trash2 className="w-4 h-4 text-white" />
    </button>

    <Link href={`/person/${person.id}`} className="relative block h-full">
      <div className="relative aspect-square overflow-hidden">
        {/* Dynamic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />

        {/* Profile image with parallax effect */}
        <motion.div
          className="relative h-full w-full"
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <Image
            src={person.profile_path 
              ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
              : '/avatar-placeholder.png'}
            alt={person.name}
            fill
            className="object-cover object-top"
          />
        </motion.div>

        {/* Floating metadata */}
        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2">
          <div className="opacity-0 translate-y-4 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-px bg-pink-400/80"></div>
              <span className="text-xs font-semibold text-pink-300 uppercase tracking-wider">
                {person.known_for_department}
              </span>
            </div>
            
            {person.known_for && (
              <div className="flex flex-wrap gap-2">
                {person.known_for.slice(0, 2).map((work: any) => (
                  <span 
                    key={work.id}
                    className="px-2 py-1 text-xs bg-black/40 backdrop-blur-sm rounded-full text-gray-200 border border-white/10"
                  >
                    {work.title || work.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Name and details */}
      <div className="p-6 pt-4 text-center space-y-3">
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-purple-200 hover:from-pink-300 hover:to-purple-300 transition-all">
          {person.name}
        </h3>
        
        <div className="flex items-center justify-center space-x-3">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-amber-400 fill-current animate-pulse-slow" />
            <span className="text-sm font-medium text-amber-300">
              {Math.round(person.popularity)}
            </span>
          </div>
          
          <div className="h-4 w-px bg-white/20"></div>
          
          <div className="flex items-center space-x-1">
            <Film className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">
              {person.known_for?.length || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 -z-10 bg-radial-gradient from-pink-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
      onClick={() => remove(item.id)}
      className="absolute top-3 right-3 z-10 p-1.5 bg-gray-800/80 rounded-lg backdrop-blur-sm hover:bg-red-500/80 transition-colors"
    >
      <Trash2 className="w-4 h-4 text-gray-300 hover:text-white" />
    </button>
    <Link href={`/${type}/${item.id}`}>
      <div className="relative aspect-[2/3]">
        <Image
          src={item.poster_path 
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : '/placeholder.png'}
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
            {type === 'movie' ? '🎬 Movie' : '📺 TV Show'}
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