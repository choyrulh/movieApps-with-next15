"use client";

import { useState, use, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { getCreditPerson, getDetailPerson } from "@/Service/fetchMovie";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { AddFavoriteButton } from "@/components/AddFavoriteButton";
import BiographySection from "@/components/common/Biography"

const PersonDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<"movies" | "tv">("movies");

  const {
    data: personData,
    isLoading: isLoadingPerson,
    error: personError,
  } = useQuery({
    queryKey: ["personDetail", id],
    queryFn: () => getDetailPerson(id),
  });

  const {
    data: creditsData,
    isLoading: isLoadingCredits,
    error: creditsError,
  } = useQuery({
    queryKey: ["creditsPerson", id],
    queryFn: () => getCreditPerson(id),
    enabled: !!personData, // Only fetch credits after person data is available
  });

  if (!personData || !creditsData) return <LoadingSkeleton />;

  const sortedCredits = [...creditsData.cast].sort(
    (a, b) =>
      new Date(b.release_date || b.first_air_date).getTime() -
      new Date(a.release_date || a.first_air_date).getTime()
  );
  const tabs = ["movies", "tv"];
  const handleClick = (
    tab: "movies" | "tv",
    setActiveTab: (tab: "movies" | "tv") => void
  ) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen">
      {/* Person Details Section */}
      <section className="max-w-7xl mx-auto pt-[7rem] pb-[2rem] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-8 md:gap-12"
      >
        {/* Profile Image - Improved */}
        <div className="relative h-[52vh] w-full md:w-64 lg:w-72 aspect-[2/3] rounded-2xl overflow-hidden shadow-xl ring-1 ring-white/10">
          <Image
            src={`https://image.tmdb.org/t/p/w780${personData?.profile_path}`} // Higher quality image
            alt={personData?.name}
            fill
            priority // Prioritize loading for above-the-fold image
            className="object-cover object-top" // Ensure face stays at top
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 30vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
        </div>

          {/* Personal Info */}
          <div className="flex-1 space-y-4 px-4 md:px-0">
            <h1 className="text-4xl font-bold text-gray-100 dark:text-white">
              {personData?.name}
            </h1>

            <div className="flex gap-4 text-gray-200 dark:text-gray-300">
              <p>
                🎂 {new Date(personData?.birthday).toLocaleDateString()} (
                {new Date().getFullYear() -
                  new Date(personData?.birthday).getFullYear()}{" "}
                tahun)
              </p>
              {personData?.deathday && (
                <p>
                  ⚰️ {new Date(personData?.deathday).toLocaleDateString()} (
                  {new Date(personData?.deathday).getFullYear() -
                    new Date(personData?.birthday).getFullYear()}{" "}
                  tahun)
                </p>
              )}
              <p>📍 {personData?.place_of_birth}</p>
            </div>

            <BiographySection biography={personData?.biography} />

            <div className="flex gap-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-full">
                <span className="text-purple-600 dark:text-purple-400 font-semibold">
                  Popularity: {Math.round(personData?.popularity)}
                </span>
              </div>
              <AddFavoriteButton
                item={{
                  ...personData,
                  name: personData.name ?? "",
                  media_type: "person",
                }}
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Filmography Section */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="flex gap-4 border-b pb-4 border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() =>
                  handleClick(tab as "movies" | "tv", setActiveTab)
                }
                className={`px-6 py-2 text-lg font-medium ${
                  activeTab === tab
                    ? "border-b-2 border-purple-600 text-purple-600 dark:text-purple-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-white dark:hover:text-gray-200"
                }`}
              >
                {tab === "movies" ? "Movies" : "TV Shows"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {sortedCredits
              .filter((credit) =>
                activeTab === "movies"
                  ? credit.media_type === "movie"
                  : credit.media_type === "tv"
              )
              .map((credit) => (
                <Link
                  href={`/${credit.media_type}/${credit.id}`}
                  key={credit.id}
                >
                  <motion.div
                    key={credit.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -5 }}
                    className="bg-slate-900/10 border border-slate-900/20 dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                  >
                    <div className="relative aspect-[2/3]">
                      <Image
                        src={
                          credit.poster_path
                            ? `https://image.tmdb.org/t/p/w500${credit.poster_path}`
                            : "/placeholder-movie.jpg"
                        }
                        alt={credit.title || credit.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-100 dark:text-white truncate">
                        {credit.title || credit.name}
                      </h3>
                      <p className="text-sm text-gray-300/50 dark:text-gray-300 truncate">
                        as {credit.character || " - "}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-purple-600 dark:text-purple-400">
                          {credit.media_type === "movie"
                            ? "🎬 Movie"
                            : "📺 TV Show"}
                        </span>
                        <span className="text-sm text-gray-400">
                          {new Date(
                            credit.release_date || credit.first_air_date
                          ).getFullYear()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="min-h-screen">
    <div className="max-w-7xl mx-auto pt-[7rem] pb-[2rem] py-8 animate-pulse">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 lg:w-1/4 aspect-square rounded-2xl" />
        <div className="flex-1 space-y-4">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default PersonDetailPage;
