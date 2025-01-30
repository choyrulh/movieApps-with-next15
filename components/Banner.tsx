"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getTrending } from "@/Service/fetchMovie";
import { Movie } from "@/types/movie.";
import { ChevronLeft, ChevronRight, Info, Play, Star } from "lucide-react";
import Link from "next/link";

function Banner({ type }: { type: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [pauseAutoSlide, setPauseAutoSlide] = useState(false);
  const [progress, setProgress] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["trendingMovies", type],

    queryFn: () => getTrending(type, {}),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // Auto-slide functionality
  useEffect(() => {
    if (isLoading || isError || pauseAutoSlide || !data?.results) return;

    const totalMovies = data.results.length;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalMovies);
      setProgress(0); // Reset progress bar
    }, 8000);

    return () => clearInterval(interval);
  }, [isLoading, isError, pauseAutoSlide, data?.results]);

  console.log("data:", data);

  // Progress bar animation
  useEffect(() => {
    if (pauseAutoSlide) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + 100 / (8000 / 100);
      });
    }, 100);

    return () => clearInterval(timer);
  }, [pauseAutoSlide]);

  if (isLoading) {
    return (
      <div className="relative h-[60vh] md:h-[80vh]">
        <div className="h-full w-full rounded-none" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 space-y-4">
          <div className="h-8 w-3/4 bg-gray-500" />
          <div className="h-4 w-1/2 bg-gray-500" />
          <div className="flex gap-4">
            <div className="h-10 w-32 rounded-lg bg-gray-500" />
            <div className="h-10 w-32 rounded-lg bg-gray-500" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data?.results?.length) {
    return (
      <div className="h-[60vh] md:h-[80vh] flex flex-col items-center justify-center gap-4 bg-slate-900 text-red-400">
        <span className="text-4xl">⚠️</span>
        <p className="text-xl font-medium">Failed to load banner</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? data.results.length - 1 : prev - 1));
    setProgress(0);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === data.results.length - 1 ? 0 : prev + 1));
    setProgress(0);
  };

  const currentMovie = data.results[activeIndex];

  return (
    <div
      className="relative h-[60vh] md:h-[80vh] overflow-hidden"
      onMouseEnter={() => setPauseAutoSlide(true)}
      onMouseLeave={() => setPauseAutoSlide(false)}
    >
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 z-50 bg-slate-700/50">
        <motion.div
          className="h-full bg-red-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Carousel Items */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {/* Background Image with Gradient Overlay */}
          {currentMovie.backdrop_path && (
            <Image
              src={`https://image.tmdb.org/t/p/original${currentMovie.backdrop_path}`}
              alt={currentMovie.title}
              fill
              priority
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-6 md:p-8 lg:p-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl space-y-4 text-white"
        >
          <h1 className="text-3xl md:text-5xl font-bold drop-shadow-2xl">
            {currentMovie.title ? currentMovie.title : currentMovie.name}
          </h1>

          <div className="flex items-center gap-4 text-sm md:text-base">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span>{currentMovie.vote_average.toFixed(1)}</span>
            </div>
            <span>•</span>
            <span>
              {new Date(
                currentMovie.release_date
                  ? currentMovie.release_date
                  : currentMovie.first_air_date
              ).getFullYear()}
            </span>
            <span>•</span>
            <span>{currentMovie.original_language.toUpperCase()}</span>
          </div>

          <p className="line-clamp-3 text-sm md:text-base text-slate-200">
            {currentMovie.overview}
          </p>

          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-2 bg-white/90 text-slate-900 rounded-lg font-semibold hover:bg-white transition-colors hover:cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              Watch Now
            </motion.button>
            <Link href={`/${currentMovie.id}`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-2 bg-slate-500/50 text-white rounded-lg font-semibold hover:bg-slate-500/70 transition-colors hover:cursor-pointer"
              >
                <Info className="w-5 h-5" />
                More Info
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Navigation Controls */}
      <div className="lg:h-[38rem] md:h-[32rem] sm:h-[28rem] h-[26rem] absolute inset-0 flex items-center justify-between p-4">
        <motion.button
          onClick={handlePrev}
          whileHover={{ scale: 1.1 }}
          className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </motion.button>

        <motion.button
          onClick={handleNext}
          whileHover={{ scale: 1.1 }}
          className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </motion.button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-50">
        {data.results.map((_: Movie, index: number) => (
          <button
            key={index}
            onClick={() => {
              setActiveIndex(index);
              setProgress(0);
            }}
            className={`w-3 h-3 rounded-full transition-all ${
              index === activeIndex
                ? "w-6 bg-red-500"
                : "bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default Banner;
