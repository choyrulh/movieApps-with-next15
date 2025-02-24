"use client";

import { Movie } from "@/types/movie.";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Rating } from "./common/Rating";
import { memo } from "react";
import { useShallow } from "zustand/react/shallow";
import { State, useStore } from "@/store/useStore";

const parseReleaseDate = (dateStr: string): Date | null => {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (year && month && day) {
    return new Date(year, month - 1, day);
  }
  return null;
};

const getBadgeClass = (label: string | null) => {
  switch(label) {
    case 'Baru':
      return 'bg-green-500';
    case 'Upcoming':
      return 'bg-purple-500';
    case 'Rilis Bulan Ini':
      return 'bg-blue-500';
    case 'Belum Rilis':
      return 'bg-gray-500';
    case 'TBA':
      return 'bg-red-500';
    default:
      return '';
  }
};


const MovieCard = ({ movie }: { movie: Movie }) => {
  const { selectedType } = useStore(
    useShallow((state) => ({
      selectedType: state.selectedType,
    }))
  );

  const releaseDateStr = movie.release_date || movie.first_air_date;
  let releaseDate: Date | null = null;
  let label: string | null = null;

  if (releaseDateStr) {
    releaseDate = parseReleaseDate(releaseDateStr);
  }

  if (releaseDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(releaseDate.getTime())) {
      label = 'TBA';
    } else {
      releaseDate.setHours(0, 0, 0, 0);

      if (releaseDate > today) {
        const isCurrentMonth = releaseDate.getMonth() === today.getMonth() &&
          releaseDate.getFullYear() === today.getFullYear();

        if (isCurrentMonth) {
          label = 'Rilis Bulan Ini';
        } else {
          const timeDiff = releaseDate.getTime() - today.getTime();
          const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

          if (dayDiff <= 30) {
            label = 'Upcoming';
          } else {
            label = 'Belum Rilis';
          }
        }
      } else {
        const timeDiff = today.getTime() - releaseDate.getTime();
        const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

        if (dayDiff <= 90) {
          label = 'Baru';
        }
      }
    }
  } else {
    label = 'TBA';
  }


  return (
    <motion.div
      className="group relative bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow"
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Link href={`/${selectedType}/${movie.id}`}>
        <div className="relative aspect-[2/3]">
          {movie.poster_path ? (
            <Image
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title ?? movie.name ?? ""}
              fill
              className="object-cover group-hover:opacity-75 transition-opacity"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-auto h-full bg-slate-800 flex items-center justify-center">
              <span className="text-sm text-white/60">No poster available</span>
            </div>
          )}
          {label && (
            <div className="absolute top-2 right-2">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white shadow-md ${getBadgeClass(label)}`}>
                {label}
              </span>
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white text-lg font-semibold truncate">
            {movie.title ?? movie.name ?? ""}
          </h3>
          <div className="flex items-center justify-between mt-2">
            <span className="text-cyan-400 text-sm">
              {releaseDateStr ? new Date(releaseDateStr).getFullYear() : 'TBA'}
            </span>
            <Rating value={movie.vote_average} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default memo(MovieCard);
