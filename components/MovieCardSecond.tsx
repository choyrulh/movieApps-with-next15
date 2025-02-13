"use client";

import { memo } from "react";
import Link from "next/link";
import { Rating } from "./common/Rating";
import  Image  from "next/image";

export const MovieCardSecond = memo(({ movie }: { movie: any }) => (
  <div className="group relative aspect-[2/3] overflow-hidden rounded-2xl shadow-xl transition-transform duration-300 hover:-translate-y-2">
    <Link href={`/movie/${movie.id}`}>
      <div className="absolute inset-0">
        {movie.poster_path ? (
          <Image
            width={500}
            height={500}
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title ? movie.title : movie.name }
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-purple-600 to-cyan-500">
            <span className="text-center text-2xl font-bold text-white">
              {movie.title
                ?.split(" ")
                .map((word: string) => word[0])
                .join("")}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent" />
      </div>

      <div className="absolute inset-0 flex flex-col justify-end p-4">
        <h3 className="text-lg font-semibold text-white line-clamp-2">
          {movie.title ? movie.title : movie.name }
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <Rating value={movie.vote_average} className="text-sm" />
          <span className="text-sm text-slate-300">
            {movie.release_date || movie.first_air_date
              ? new Date(movie.release_date || movie.first_air_date).getFullYear()
              : "N/A"}
          </span>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="rounded-full bg-cyan-500/90 px-6 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-cyan-600">
          View Details
        </div>
      </div>
    </Link>
  </div>
));

