// src/components/WatchlistPage.tsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useWatchlistStore } from "@/store/useWatchListStore";
import { Trash2, Film, Tv, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const WatchlistPage = () => {
  const { watchlist, removeFromWatchlist } = useWatchlistStore();
  const [activeTab, setActiveTab] = useState<'movies' | 'tvshows' | 'actors'>('movies');
  
  const movies = watchlist.filter(item => item.media_type === "movie");
  const tvShows = watchlist.filter(item => item.media_type === "tv");
  const actors = watchlist.filter(item => item.media_type === "person");

  return (
    <div className="min-h-screen p-8 pt-20">
      <div className="max-w-7xl container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center justify-between mb-12"
        >
          <h1 className="text-3xl font-bold text-slate-300 dark:text-white mb-4 md:mb-0">
            {activeTab === "actors" ? "My Favorite Actor" : "My Watchlist"}
          </h1>
          
          <div className="flex space-x-2 bg-slate-900/10 backdrop-blur-sm p-1 rounded-xl">
            <TabButton 
              icon={<Film className="w-4 h-4 mr-2" />}
              isActive={activeTab === 'movies'} 
              onClick={() => setActiveTab('movies')}
              label={`Movies (${movies.length})`}
            />
            <TabButton 
              icon={<Tv className="w-4 h-4 mr-2" />}
              isActive={activeTab === 'tvshows'} 
              onClick={() => setActiveTab('tvshows')}
              label={`TV Shows (${tvShows.length})`}
            />
            <TabButton 
              icon={<Users className="w-4 h-4 mr-2" />}
              isActive={activeTab === 'actors'} 
              onClick={() => setActiveTab('actors')}
              label={`Actors (${actors.length})`}
            />
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {watchlist.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {activeTab === 'movies' && <MovieGrid items={movies} removeFromWatchlist={removeFromWatchlist} />}
              {activeTab === 'tvshows' && <TVShowGrid items={tvShows} removeFromWatchlist={removeFromWatchlist} />}
              {activeTab === 'actors' && <ActorGrid items={actors} removeFromWatchlist={removeFromWatchlist} />}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const TabButton = ({ isActive, onClick, label, icon }: any) => (
  <motion.button
    whileHover={{ scale: 1.03 }}
    onClick={onClick}
    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive 
        ? 'bg-purple-600 text-white shadow-lg' 
        : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-slate-900/5'
    }`}
  >
    {icon}
    {label}
  </motion.button>
);

const EmptyState = () => (
  <motion.div
    key="empty-state"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="text-center py-24"
  >
    <div className="max-w-md mx-auto">
      <Image 
        src="/empty-watchlist.svg" 
        alt="Empty watchlist" 
        width={200} 
        height={200} 
        className="mx-auto mb-6 opacity-50"
      />
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
        Your watchlist is empty
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        className="bg-purple-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:bg-purple-700 transition-colors"
      >
        Discover Movies & Shows
      </motion.button>
    </div>
  </motion.div>
);

const MovieGrid = ({ items, removeFromWatchlist }) => (
  <motion.div
    key="movie-grid"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
  >
    <AnimatePresence>
      {items.map((item) => (
        <motion.div
          key={item.id}
          layout
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="relative group bg-slate-900/5 backdrop-blur-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-white/10"
        >
          <RemoveButton onRemove={() => removeFromWatchlist(item.id)} />
          <Link href={`/movie/${item.id}`}>
            <div className="relative aspect-[2/3]">
              <Image
                src={
                  item.poster_path
                    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                    : "/placeholder.png"
                }
                alt={item.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-200 dark:text-white truncate group-hover:text-purple-400 transition-colors">
                {item.title}
              </h3>
              <div className="flex justify-between items-center mt-2">
                <span className="inline-flex items-center text-xs font-medium text-purple-500 dark:text-purple-400">
                  <Film className="w-3 h-3 mr-1" />
                  Movie
                </span>
                <span className="text-xs text-gray-500">
                  {item.release_date ? new Date(item.release_date).getFullYear() : 'N/A'}
                </span>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </AnimatePresence>
  </motion.div>
);

const TVShowGrid = ({ items, removeFromWatchlist }) => (
  <motion.div
    key="tvshow-grid"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
  >
    <AnimatePresence>
      {items.map((item) => (
        <motion.div
          key={item.id}
          layout
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="relative group bg-slate-900/5 backdrop-blur-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-white/10"
        >
          <RemoveButton onRemove={() => removeFromWatchlist(item.id)} />
          <Link href={`/tv/${item.id}`}>
            <div className="relative aspect-[2/3]">
              <Image
                src={
                  item.poster_path
                    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                    : "/placeholder.png"
                }
                alt={item.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-200 dark:text-white truncate group-hover:text-teal-400 transition-colors">
                {item.name}
              </h3>
              <div className="flex justify-between items-center mt-2">
                <span className="inline-flex items-center text-xs font-medium text-teal-500 dark:text-teal-400">
                  <Tv className="w-3 h-3 mr-1" />
                  TV Show
                </span>
                <span className="text-xs text-gray-500">
                  {item.first_air_date ? new Date(item.first_air_date).getFullYear() : 'N/A'}
                </span>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </AnimatePresence>
  </motion.div>
);

const ActorGrid = ({ items, removeFromWatchlist }) => (
  <motion.div
    key="actor-grid"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
  >
    <AnimatePresence>
      {items.map((item) => (
        <motion.div
          key={item.id}
          layout
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="group relative flex flex-col items-center"
        >
          <div className="relative w-full aspect-square group-hover:-translate-y-1 transition-all duration-300">
            {/* Circular frame */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
              
              {/* Image container */}
              <div className="relative w-full h-full">
                <Image
                  src={
                    item.profile_path
                      ? `https://image.tmdb.org/t/p/w500${item.profile_path}`
                      : "/placeholder-person.png"
                  }
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            </div>
            
            {/* Border effect */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-400/50 rounded-full transition-colors duration-300 z-20" />
            
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 z-0" />
            
            {/* Remove button - fixed positioning */}
            <RemoveButton 
              onRemove={() => removeFromWatchlist(item.id)} 
              isRound={true} 
              className="top-0 right-0 translate-x-1/4 -translate-y-1/4"
            />
          </div>
          
          <motion.div 
            className="text-center w-full px-2 mt-4"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Link href={`/person/${item.id}`}>
              <h3 className="font-medium text-gray-200 dark:text-white truncate transition-colors
                group-hover:text-purple-400">
                {item.name}
              </h3>
            </Link>
            
            <div className="relative">
              <div className="h-0.5 w-0 bg-gradient-to-r from-purple-400 to-pink-400 absolute left-1/2 -translate-x-1/2 group-hover:w-16 transition-all duration-300" />
              
              <motion.p 
                className="text-xs text-gray-400 flex items-center justify-center pt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Users className="w-3 h-3 mr-1.5 text-purple-400" />
                <span className="truncate">{item.gender === 2 ? "Actor" : "Actrees"}</span>
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      ))}
    </AnimatePresence>
  </motion.div>
);

const RemoveButton = ({ onRemove, isRound = false }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onRemove}
    className={`absolute top-2 right-2 z-10 p-1.5 bg-black/50 backdrop-blur-sm 
      hover:bg-red-500 transition-colors ${isRound ? 'rounded-full' : 'rounded-lg'}`}
  >
    <Trash2 className="w-4 h-4 text-white opacity-70 hover:opacity-100" />
  </motion.button>
);

export default WatchlistPage;