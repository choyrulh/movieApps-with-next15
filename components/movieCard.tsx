"use client";

import { Movie } from "@/types/movie.";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Rating } from "./common/Rating";
import { memo, useState } from "react";
import { Play, Users } from "lucide-react";
import useIsMobile from "@/hook/useIsMobile";
import { useStore } from "@/store/useStore";

const MovieCard = ({ movie }: { movie: Movie }) => {
  const isMobile = useIsMobile();
  const [isHovered, setIsHovered] = useState(false);
  
  const selectedType = useStore((state) => state.selectedType);

  const getBadge = () => {
    const releaseDate = movie.release_date || movie.first_air_date;
    if (!releaseDate) return null;
    const diffDays = Math.ceil((new Date().getTime() - new Date(releaseDate).getTime()) / (1000 * 3600 * 24));
    if (diffDays >= 0 && diffDays <= 30) return "Baru";
    if (diffDays < 0) return "Upcoming";
    return null;
  };

  const badge = getBadge();
  const year = movie.release_date ? movie.release_date.split("-")[0] : movie.first_air_date?.split("-")[0] || "TBA";

  // Ambil maksimal 2-3 genre
  const displayGenres = movie.genre_ids?.slice(0, 2) || [];

  // Mapping genre IDs ke nama genre (sesuaikan dengan data TMDB)
  const genreMap: { [key: number]: string } = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Sci-Fi",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western",
    // TV Genres
    10759: "Action & Adventure",
    10762: "Kids",
    10763: "News",
    10764: "Reality",
    10765: "Sci-Fi & Fantasy",
    10766: "Soap",
    10767: "Talk",
    10768: "War & Politics"
  };

  return (
    <motion.div
      className="relative w-[150px] sm:w-[180px] md:w-[230px] aspect-[2/3] flex-shrink-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={!isMobile ? { scale: 1.05, zIndex: 50 } : {}}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/${selectedType}/${movie.id}`} className="block h-full w-full">
        <div className="relative h-full w-full rounded-xl overflow-hidden bg-zinc-900 shadow-lg">
          <Image
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title || movie.name || ""}
            fill
            className="object-cover transition-transform duration-300"
          />

          {/* Badge */}
          {badge && (
            <div className={`absolute top-2 left-2 z-10 px-3 py-1 text-[10px] md:text-sm font-bold text-white rounded-full shadow-lg backdrop-blur-sm ${
              badge === "Baru" ? "bg-green-500/90" : "bg-purple-500/90"
            }`}>
              {badge}
            </div>
          )}

          {/* Info Normal - Gradient lebih halus */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
            <h3 className="text-white text-sm md:text-lg font-bold line-clamp-2 leading-tight">
              {movie.title || movie.name}
            </h3>
            
            <div className="flex items-center gap-3">
              <Rating value={movie.vote_average} />
              {/*<span className="text-xs md:text-base text-yellow-400 font-bold">
                {movie.vote_average.toFixed(1)}
              </span>*/}
              {/*<span className="text-xs text-gray-400">{year}</span>*/}
            </div>
          </div>
        </div>

        {/* Detail Hover */}
        <AnimatePresence>
          {isHovered && !isMobile && (
            <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.3,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 z-50 bg-zinc-900 rounded-xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Preview Image */}
              <div className="relative h-32 w-full">
                <Image
                  src={`https://image.tmdb.org/t/p/w500${movie.backdrop_path || movie.poster_path}`}
                  alt="preview"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-900" />
                
                {/* Play Button */}
                <div className="absolute bottom-3 left-3">
                  <div className="bg-white/90 hover:bg-white rounded-full p-2 transition-colors cursor-pointer shadow-lg">
                    <Play size={14} fill="black" className="text-black ml-0.5" />
                  </div>
                </div>

                {/* Badge di hover */}
                {badge && (
                  <div className={`absolute top-2 right-2 px-2 py-1 text-[10px] font-bold text-white rounded-full ${
                    badge === "Baru" ? "bg-green-500" : "bg-purple-500"
                  }`}>
                    {badge}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-3 flex flex-col gap-3 flex-1">
                {/* Title & Year */}
                <div>
                  <h4 className="text-white text-lg font-bold line-clamp-2 mb-1 leading-tight">
                    {movie.title || movie.name}
                  </h4>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-400 font-semibold">{year}</span>
                    
                    {/* Genre Tags */}
                    {displayGenres.length > 0 && (
                      <>
                        <span className="text-gray-500">•</span>
                        <div className="flex items-center gap-1 flex-wrap">
                          {displayGenres.map((genreId) => (
                            <span 
                              key={genreId}
                              className="px-2 py-0.5 bg-white/10 text-gray-300 rounded-full text-[11px]"
                            >
                              {genreMap[genreId] || "Unknown"}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Rating & Reviews */}
                <div className="flex items-center justify-between py-2 border-y border-white/10">
                  <div className="flex items-center gap-2">
                    <Rating value={movie.vote_average} />
                    {/*<span className="text-yellow-400 text- font-bold">
                      {movie.vote_average.toFixed(1)}
                    </span>*/}
                  </div>
                  
                  <div className="flex items-center gap-1 text-gray-400">
                    <Users size={12} />
                    <span className="text-[12px]">
                      {movie.vote_count?.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Overview */}
                <p className="text-[13px] text-gray-400 line-clamp-3 leading-relaxed">
                  {movie.overview || "Tidak ada deskripsi untuk film ini."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>
    </motion.div>
  );
};

export default memo(MovieCard);