"use client";

import { Movie } from "@/types/movie.";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Rating } from "./common/Rating";
import { memo } from "react";
import { useShallow } from "zustand/react/shallow";
import { State, useStore } from "@/store/useStore";
import useIsMobile from "@/hook/useIsMobile";

const parseReleaseDate = (dateStr: string): Date | null => {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (year && month && day) {
    return new Date(year, month - 1, day);
  }
  return null;
};

const getBadgeStyle = (label: string | null) => {
  switch(label) {
    case 'Baru':
      return {
        background: 'bg-green-500',
        shadow: 'shadow-green-500/20',
        after: 'after:border-green-700'
      };
    case 'Upcoming':
      return {
        background: 'bg-purple-500',
        shadow: 'shadow-purple-500/20',
        after: 'after:border-purple-700'
      };
    case 'Rilis Bulan Ini':
      return {
        background: 'bg-blue-500',
        shadow: 'shadow-blue-500/20',
        after: 'after:border-blue-700'
      };
    case 'Belum Rilis':
      return {
        background: 'bg-gray-500',
        shadow: 'shadow-gray-500/20',
        after: 'after:border-gray-700'
      };
    case 'TBA':
      return {
        background: 'bg-red-500',
        shadow: 'shadow-red-500/20',
        after: 'after:border-red-700'
      };
    default:
      return {
        background: '',
        shadow: '',
        after: ''
      };
  }
};


const MovieCard = ({ movie }: { movie: Movie }) => {
  const isMobile = useIsMobile();
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

    const badgeStyle = getBadgeStyle(label);
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
              src={`https://image.tmdb.org/t/p/${isMobile ? "w300" : "w500"}${movie.poster_path}`}
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
            <div className="absolute -right-2 top-4">
              <div className={`
                relative
                flex
                items-center
                py-1
                pl-3
                pr-4
                text-xs
                font-bold
                text-white
                ${badgeStyle.background}
                ${badgeStyle.shadow}
                shadow-lg
                before:absolute
                before:right-0
                before:top-full
                before:w-2
                before:h-2
                before:bg-inherit
                before:brightness-75
                before:clip-path-triangle
                after:absolute
                after:left-0
                after:top-0
                after:bottom-0
                after:w-3
                after:-translate-x-1/2
                after:bg-inherit
                after:rounded-l-full
              `}>
                <span className="relative z-10">{label}</span>
              </div>
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

const styles = `
  @layer utilities {
    .clip-path-triangle {
      clip-path: polygon(100% 0, 0 0, 100% 100%);
    }
  }
`;