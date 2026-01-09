"use client";

import Link from "next/link";
import { Rating } from "./common/Rating";
import Image from "next/image";
import { ImageWithFallback } from "./common/ImageWithFallback";
import { motion } from "framer-motion";

export const MovieCardSecond = ({
  movie,
  type,
}: {
  movie: any;
  type: string;
}) => {
  return (
    // <-- Parenthesis moved to same line as return
    <motion.div
      className="group relative bg-black rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow"
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Link href={`/${type}/${movie.id}`}>
        <div className="relative aspect-[2/3]">
          <ImageWithFallback
            src={
              movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : ""
            }
            alt={movie.title || movie.name || "Movie poster"}
            width={200}
            height={300}
            className="object-cover group-hover:opacity-75 transition-opacity"
            fallbackText="No poster available"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white text-lg font-semibold truncate">
              {movie.title ?? movie.name ?? ""}
            </h3>
            <div className="flex items-center justify-between mt-2">
              <span className="text-gray-400 text-sm">
                {new Date(
                  movie.release_date ?? movie.first_air_date
                ).getFullYear()}
              </span>
              <Rating value={movie.vote_average} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
