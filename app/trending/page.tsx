"use client";

import { useQuery } from "@tanstack/react-query";
import { getTrending } from "@/Service/fetchMovie";
import { Movie } from "@/types/movie.";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import MovieCard from "@/components/movieCard";
import { Skeleton } from "@/components/ui/skeleton";

const TrendingPage = () => {
  const [timeWindow, setTimeWindow] = useState<"day" | "week">("day");

  const { data, isLoading } = useQuery({
    queryKey: ["trending", timeWindow],
    queryFn: () => getTrending("movie", timeWindow),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6 mt-16">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Trending Now
            </h1>
            <p className="text-slate-300 font-light">
              What's popular {timeWindow === "day" ? "today" : "this week"}
            </p>
          </div>

          <div className="flex gap-2 p-1 rounded-full bg-slate-800">
            <button
              onClick={() => setTimeWindow("day")}
              className={cn(
                "px-6 py-2 rounded-full transition-colors",
                timeWindow === "day"
                  ? "bg-cyan-500 text-white"
                  : "hover:bg-slate-700 text-slate-300"
              )}
            >
              Today
            </button>
            <button
              onClick={() => setTimeWindow("week")}
              className={cn(
                "px-6 py-2 rounded-full transition-colors",
                timeWindow === "week"
                  ? "bg-cyan-500 text-white"
                  : "hover:bg-slate-700 text-slate-300"
              )}
            >
              This Week
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <Skeleton
                key={i}
                className="aspect-[2/3] rounded-xl bg-slate-800"
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          >
            {data?.results?.map((movie: Movie, index: number) => (
              <motion.div
                key={movie.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <MovieCard
                  movie={movie}
                  // badge={
                  //   <div className="absolute top-2 left-2 flex items-center bg-slate-900/80 px-2 py-1 rounded-full text-cyan-400 text-sm">
                  //     #{index + 1}
                  //   </div>
                  // }
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TrendingPage;
