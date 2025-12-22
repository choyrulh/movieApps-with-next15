"use client";

import { memo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getPopularCasts } from "@/Service/fetchMovie";
import { ChevronRight, Film, Filter, Loader, Tv } from "lucide-react";
import { PopularityChart } from "@/components/PopularityChart";
import { NetworkGraph } from "@/components/NetworkGraph";
import Link from "next/link";
import { Metadata } from "../Metadata";

export type Person = {
  id: number;
  name: string;
  profile_path: string;
  popularity: any;
  known_for_department: string;
  known_for: Array<{
    title?: string;
    name?: string;
    media_type: string;
    poster_path?: string;
  }>;
};

type ViewMode = "simple" | "detailed";

const StatBox = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) => (
  <div className={`p-2 md:p-3 rounded-lg bg-[#222222] shadow-lg`}>
    <div className="text-xs md:text-sm text-gray-400">{label}</div>
    <div className={`text-base md:text-lg font-semibold text-${color}-400`}>
      {value}
    </div>
  </div>
);

const WorkThumbnail = ({ work }: { work: any }) => (
  <div className="relative w-20 h-28 md:w-24 md:h-32 rounded-md overflow-hidden border border-gray-600">
    <Image
      src={`https://image.tmdb.org/t/p/w200${work?.poster_path}`}
      alt={work.title || work.name || ""}
      fill
      className="object-cover"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent p-2 flex items-end">
      <span className="text-xs font-medium text-white line-clamp-1">
        {work.title || work.name}
      </span>
    </div>
  </div>
);

const HighlightPerson = ({ person }: { person: Person }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-xl bg-gradient-to-br from-[#222222] to-[#333333] overflow-hidden"
    >
      <div className="flex flex-col md:flex-row items-center p-4 md:p-6 gap-4 md:gap-6">
        <Link
          href={`/person/${person.id}`}
          className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden transition-transform hover:scale-105"
        >
          <Image
            src={`https://image.tmdb.org/t/p/w300${person.profile_path}`}
            alt={person.name}
            fill
            className="object-cover"
            loading="eager"
          />
        </Link>

        <div className="flex-1 space-y-3 md:space-y-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-100">
            {person.name}
          </h1>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <StatBox
              label="Popularity"
              value={person.popularity.toFixed(0)}
              color="green"
            />
            <StatBox
              label="Department"
              value={person.known_for_department}
              color="blue"
            />
            <StatBox
              label="Works"
              value={person.known_for.length}
              color="pink"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {person.known_for.slice(0, 4).map((work, index) => (
              <WorkThumbnail key={index} work={work} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PersonCard = memo(
  ({ person, viewMode }: { person: Person; viewMode: ViewMode }) => {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#111111] rounded-lg hover:border-green-500/40 transition-all"
      >
        <div className="p-3 space-y-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/person/${person.id}`}
              className="relative w-12 h-12 rounded-md overflow-hidden"
            >
              <Image
                src={
                  person.profile_path
                    ? `https://image.tmdb.org/t/p/w200${person.profile_path}`
                    : "/placeholder-dark.png"
                }
                alt={person.name}
                fill
                className="object-cover"
                loading="lazy"
              />
            </Link>

            <div className="flex-1">
              <h3 className="font-semibold text-gray-100">{person.name}</h3>
              <div className="w-full h-1 bg-gray-700 rounded-full mt-1">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(person.popularity, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {viewMode === "detailed" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-400">
                <span>Top {Math.ceil(person.popularity / 10)}%</span>
              </div>

              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {person.known_for.slice(0, 2).map((work, index) => (
                  <WorkThumbnail key={index} work={work} />
                ))}
              </div>
            </div>
          )}

          <Link
            href={`/person/${person.id}`}
            className="flex items-center justify-center gap-1 text-sm text-green-400 hover:text-green-300 transition-colors group"
          >
            View Profile
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </motion.div>
    );
  }
);

const MemoizedFilterIcon = memo(Filter);

const DepartmentButton = memo(
  ({
    dept,
    isSelected,
    onClick,
  }: {
    dept: string;
    isSelected: boolean;
    onClick: (dept: string) => void;
  }) => {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onClick(dept)}
        className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all border ${
          isSelected
            ? "bg-gradient-to-r from-green-500 to-blue-500 text-white border-transparent shadow-lg"
            : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
        }`}
      >
        <MemoizedFilterIcon className="shrink-0" />
        {dept}
      </motion.button>
    );
  }
);

const DepartmentFilter = ({
  selected,
  setSelected,
}: {
  selected: string;
  setSelected: (s: string) => void;
}) => {
  const departments = ["Acting", "Directing", "Production", "Writing", "Sound"];

  return (
    <div className="bg-[#222222] p-3 rounded-lg border border-gray-700">
      <div className="flex flex-wrap gap-2">
        {departments.map((dept) => (
          <motion.button
            key={dept}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelected(dept === selected ? "" : dept)}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              selected === dept
                ? "bg-green-600/90 text-white"
                : "bg-[#222222] text-gray-300 hover:bg-green-600/30"
            }`}
          >
            {dept}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

const ViewToggle = memo(
  ({
    viewMode,
    setViewMode,
  }: {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
  }) => (
    <div className="flex gap-1 bg-[#222222] p-1 rounded-full border border-gray-700">
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setViewMode("simple")}
        className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm transition-colors ${
          viewMode === "simple"
            ? "bg-gray-700 text-green-400"
            : "text-gray-400 hover:bg-gray-700/50"
        }`}
      >
        <Film className="w-4 h-4" />
        Simple
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setViewMode("detailed")}
        className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm transition-colors ${
          viewMode === "detailed"
            ? "bg-gray-700 text-blue-400"
            : "text-gray-400 hover:bg-gray-700/50"
        }`}
      >
        <Tv className="w-4 h-4" />
        Detailed
      </motion.button>
    </div>
  )
);

// Add page parameter to the query function
const fetchPopularPeople = async ({ pageParam = 1 }) => {
  const data = await getPopularCasts(String(pageParam));
  return {
    results: data.results,
    total_pages: data.total_pages,
    page: pageParam,
  };
};
export default function PopularPeoplePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("simple");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["popularPeople"],
    queryFn: fetchPopularPeople,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) return lastPage.page + 1;
      return undefined;
    },
    initialPageParam: 1,
  });

  // Flatten all pages into single array
  const allPeople = data?.pages.flatMap((page) => page.results) || [];
  const filteredPeople = selectedDepartment
    ? allPeople.filter((p) => p.known_for_department === selectedDepartment)
    : allPeople;

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorState />;

  return (
    <>
      <Metadata
        seoTitle="Popular Actors"
        seoDescription="Discover the most popular and trending actors in the movie industry, from Hollywood legends to rising stars."
        seoKeywords="popular actors, famous movie stars, best Hollywood actors, trending film stars, award-winning actors, top movie stars, rising actors in film"
      />

      <div className="min-h-screen p-4 md:p-6 ">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 pt-[5rem]">
          {allPeople.length > 0 && <HighlightPerson person={allPeople[0]} />}

          <DepartmentFilter
            selected={selectedDepartment}
            setSelected={setSelectedDepartment}
          />

          <div className="bg-[#111111] rounded-xl p-4 grid lg:grid-cols-2 gap-6">
            <PopularityChart people={filteredPeople} />
            <NetworkGraph people={filteredPeople} />
          </div>

          <div className="space-y-5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <h2 className="text-lg md:text-xl font-bold text-gray-100">
                {selectedDepartment || "All"} Stars
                <span className="text-green-400 ml-2">
                  ({filteredPeople.length})
                </span>
              </h2>
              <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              <AnimatePresence>
                {filteredPeople.slice(1).map((person) => (
                  <PersonCard
                    key={person.id}
                    person={person}
                    viewMode={viewMode}
                  />
                ))}
              </AnimatePresence>
            </div>

            <div className="flex justify-center mt-4">
              <button
                onClick={() => fetchNextPage()}
                disabled={!hasNextPage || isFetchingNextPage}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader className="animate-spin w-4 h-4" />
                    Loading...
                  </>
                ) : hasNextPage ? (
                  "Load More"
                ) : (
                  "End of List"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Add loading skeleton component
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-black dark:bg-gray-900 p-8">
    <div className="max-w-7xl mx-auto space-y-8 pt-[5rem]">
      <div className="h-96 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl animate-pulse border border-dashed border-gray-300 dark:border-gray-700" />
      <div className="h-12 bg-black dark:bg-gray-800 rounded-full w-1/3 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-48 bg-black dark:bg-gray-800 rounded-xl animate-pulse"
          />
        ))}
      </div>
    </div>
  </div>
);

// Add error state component
const ErrorState = () => (
  <div className="min-h-screen bg-black dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center p-8 max-w-2xl">
      <div className="text-6xl mb-4 text-red-500">⚠️</div>
      <h2 className="text-2xl font-bold dark:text-white mb-4">
        Oops! Something went wrong
      </h2>
      <p className="text-gray-600 dark:text-gray-300">
        We're having trouble loading the data. Please check your internet
        connection or try refreshing the page.
      </p>
    </div>
  </div>
);
