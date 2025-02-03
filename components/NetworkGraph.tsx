"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Star, Award, Film, TrendingUp } from "lucide-react";
import { Person } from "@/app/cast/page";

export const NetworkGraph = ({ people }: { people: Person[] }) => {
  const [selectedActor, setSelectedActor] = useState<number>(0);

  // Mock data - replace with real data from your API
  const actorDetails = people.map((person) => ({
    ...person,
    rating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3-5
    awards: Math.floor(Math.random() * 5), // Random number of awards
    topGenres: ["Drama", "Action", "Comedy"]
      .sort(() => Math.random() - 0.5)
      .slice(0, 2),
    recentFilms: 3 + Math.floor(Math.random() * 4), // Random number of recent films
  }));
  console.log("actorDetails", actorDetails);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-2xl p-6 shadow-2xl border border-white/10 backdrop-blur-sm"
    >
      <h2 className="text-2xl font-bold text-white mb-6">Featured Cast</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Actor Cards */}
        <div className="space-y-4">
          {actorDetails.slice(0, 5).map((actor, index) => (
            <motion.div
              key={actor.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl cursor-pointer transition-all ${
                selectedActor === index
                  ? "bg-white/15 shadow-lg"
                  : "bg-white/5 hover:bg-white/10"
              }`}
              onClick={() => setSelectedActor(index)}
            >
              <div className="flex items-center gap-4">
                <motion.img
                  src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                  alt={actor.name}
                  className="w-16 h-16 rounded-lg object-cover"
                  whileHover={{ scale: 1.05 }}
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">
                    {actor.name}
                  </h3>
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>{actor.rating}</span>
                    <span className="mx-2">•</span>
                    <Film className="w-4 h-4" />
                    <span>{actor.recentFilms} recent films</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Detailed View */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedActor}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/5 rounded-xl p-6 space-y-6"
          >
            <div className="relative">
              <motion.img
                src={`https://image.tmdb.org/t/p/w500${actorDetails[selectedActor]?.profile_path}`}
                alt={actorDetails[selectedActor]?.name}
                className="w-full h-64 object-cover rounded-lg"
                layoutId={`actor-image-${selectedActor}`}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
                <h2 className="text-2xl font-bold text-white">
                  {actorDetails[selectedActor]?.name}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {actorDetails[selectedActor]?.rating}
                </div>
                <div className="text-xs text-white/60">Rating</div>
              </div>

              <div className="bg-white/10 rounded-lg p-4 text-center">
                <Award className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {actorDetails[selectedActor]?.awards}
                </div>
                <div className="text-xs text-white/60">Awards</div>
              </div>

              <div className="bg-white/10 rounded-lg p-4 text-center">
                <Film className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {actorDetails[selectedActor]?.recentFilms}
                </div>
                <div className="text-xs text-white/60">Recent Films</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-white/60" />
                <span className="text-white/60">Top Genres</span>
              </div>
              <div className="flex gap-2">
                {actorDetails[selectedActor]?.topGenres.map(
                  (genre: any, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/80"
                    >
                      {genre}
                    </span>
                  )
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
