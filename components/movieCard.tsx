import { Movie } from "@/types/movie.";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Rating } from "./common/Rating";

const MovieCard = ({ movie }: { movie: Movie }) => {
  return (
    <motion.div
      className="group relative bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow"
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Link href={`/${movie.id}`}>
        <div className="relative aspect-[2/3]">
          <Image
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title ?? movie.name ?? ""}
            fill
            className="object-cover group-hover:opacity-75 transition-opacity"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white text-lg font-semibold truncate">
            {movie.title}
          </h3>
          <div className="flex items-center justify-between mt-2">
            <span className="text-cyan-400 text-sm">
              {new Date(movie.release_date).getFullYear()}
            </span>
            <Rating value={movie.vote_average} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default MovieCard;
