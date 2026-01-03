"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MovieCard from "./movieCard";
import { Movie } from "@/types/movie.";

interface MovieRowProps {
  title: string;
  movies: Movie[];
  id: string;
}

const MovieRow = ({ title, movies, id }: MovieRowProps) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const onScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const slide = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth
          : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <div className="relative space-y-3 my-8 group/row">
      <h2 className="px-4 md:px-12 text-xl md:text-2xl font-bold text-white">
        {title}
      </h2>

      <div className="relative px-4 md:px-12">
        {/* Tombol Panah Kiri */}
        {showLeftArrow && (
          <button
            onClick={() => slide("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-40 w-12 h-full md:w-14 bg-black/70 backdrop-blur-sm opacity-0 group-hover/row:opacity-100 transition-all duration-300 flex items-center justify-center text-white hover:bg-black/80 rounded-r-md"
            aria-label="Scroll left"
          >
            <div className="bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors">
              <ChevronLeft size={28} strokeWidth={2.5} />
            </div>
          </button>
        )}

        {/* Container Horizontal Scroll */}
        <div
          ref={rowRef}
          onScroll={onScroll}
          className="flex items-center gap-2 md:gap-4 overflow-x-auto scrollbar-hide py-4 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>

        {/* Tombol Panah Kanan */}
        {showRightArrow && (
          <button
            onClick={() => slide("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-40 w-12 h-full md:w-14 bg-black/70 backdrop-blur-sm opacity-0 group-hover/row:opacity-100 transition-all duration-300 flex items-center justify-center text-white hover:bg-black/80 rounded-l-md"
            aria-label="Scroll right"
          >
            <div className="bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors">
              <ChevronRight size={28} strokeWidth={2.5} />
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

export default MovieRow;
