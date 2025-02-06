"use client";

import { useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getPopularCasts } from "@/Service/fetchMovie";
import {
  Activity,
  Award,
  ChevronDown,
  ChevronRight,
  Film,
  Filter,
  Loader,
  Star,
  TrendingUp,
  Tv,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import { PopularityChart } from "@/components/PopularityChart";
import { NetworkGraph } from "@/components/NetworkGraph";
import Link from "next/link";

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

const HighlightPerson = ({ person }: { person: Person }) => {
  const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 });

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative rounded-2xl overflow-hidden shadow-2xl group"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setGlowPosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
        <div
          className="absolute inset-0 opacity-30 transition-opacity duration-300 group-hover:opacity-50"
          style={{
            background: `radial-gradient(circle at ${glowPosition.x}% ${glowPosition.y}%, 
            rgba(139, 92, 246, 0.4) 0%, 
            rgba(59, 130, 246, 0.2) 50%, 
            transparent 100%)`,
          }}
        />
      </div>

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          initial={{
            x: Math.random() * 100 + "%",
            y: Math.random() * 100 + "%",
          }}
          animate={{
            y: ["-10%", "110%"],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-stripes.png')] opacity-10" />

      <div className="relative flex flex-col md:flex-row items-center p-8 gap-8 backdrop-blur-sm">
        {/* Profile Image */}
        <motion.div
          whileHover="hover"
          className="relative w-48 h-48 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl"
        >
          <Image
            src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
            alt={person.name}
            width={200}
            height={200}
            className="object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-40"
            initial={{ x: "-100%" }}
            animate={{
              x: glowPosition.x > 50 ? "100%" : "-100%",
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Popularity rank badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute bottom-2 right-2 bg-white/90 text-purple-600 px-2 py-1 rounded-full text-xs font-bold shadow-lg"
          >
            Top #{Math.floor(1000 / person.popularity)}
          </motion.div>
        </motion.div>

        {/* Content Section */}
        <div className="flex-1 space-y-6">
          {/* Name with animated underline */}
          <div className="relative inline-block">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">
              {person.name}
            </h1>
            <motion.div
              className="absolute bottom-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <motion.div
              whileHover={{ y: -5 }}
              className="p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Activity className="text-purple-400 text-xl" />
                </div>
                <div>
                  <div className="text-sm text-gray-300">Popularity</div>
                  <div className="text-xl font-bold text-white">
                    {person.popularity.toFixed(0)}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="text-blue-400 text-xl" />
                </div>
                <div>
                  <div className="text-sm text-gray-300">Department</div>
                  <div className="text-xl font-bold text-white">
                    {person.known_for_department}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-500/20 rounded-lg">
                  <Award className="text-pink-400 text-xl" />
                </div>
                <div>
                  <div className="text-sm text-gray-300">Known For</div>
                  <div className="text-xl font-bold text-white">
                    {person.known_for.length} works
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Notable works carousel */}
          <div className="flex gap-4 overflow-x-auto pb-4">
            {person.known_for.slice(0, 5).map((work, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="flex-shrink-0 relative w-32 h-48 rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all"
              >
                <Image
                  src={`https://image.tmdb.org/t/p/w300${work?.poster_path}`}
                  alt={work.title || work.name || ""}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex items-end">
                  <span className="text-sm font-medium text-white">
                    {work.title || work.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PersonCard = ({
  person,
  viewMode,
}: {
  person: Person;
  viewMode: ViewMode;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="relative group bg-transparent/35 dark:bg-gray-900 rounded-2xl backdrop-blur-lg shadow-2xl hover:shadow-3xl transition-all duration-300 border border-transparent hover:border-purple-100/30 dark:hover:border-purple-900/50 overflow-hidden"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onTouchStart={() => setIsTouched(true)}
      onTouchEnd={() => setIsTouched(false)}
    >
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#8B5CF640_0%,transparent_70%)] animate-pulse" />
      </div>

      {/* Hover-Activated Glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: isHovered || isTouched ? 0.3 : 0,
          background: `radial-gradient(circle at ${
            isHovered ? "70%" : "30%"
          } 50%, rgba(139, 92, 246, 0.15), transparent 60%)`,
        }}
        transition={{ duration: 0.4 }}
      />

      <div className="relative flex flex-col p-5 gap-4">
        {/* Interactive Header */}
        <div className="flex items-start gap-4">
          {/* Dynamic Avatar */}
          <motion.div
            animate={{
              transform: isHovered
                ? "translateY(-3px) scale(1.05)"
                : "translateY(0) scale(1)",
            }}
            className="relative flex-shrink-0"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white/20 shadow-xl relative">
              <Image
                src={
                  person.profile_path
                    ? `https://image.tmdb.org/t/p/w200${person.profile_path}`
                    : "/placeholder.png"
                }
                alt={person.name}
                width={64}
                height={64}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg border border-white/20">
              <span>#{person.id.toString().padStart(2, "0")}</span>
            </div>
          </motion.div>

          {/* Smart Metadata */}
          <div className="flex-1 space-y-1.5">
            <h3 className="text-lg font-bold text-gray-300 dark:text-gray-100">
              {person.name}
            </h3>

            {/* Contextual Status Bar */}
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${(person.popularity / 100) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
            </div>
          </div>
        </div>

        {/* Adaptive Content Area */}
        <div className="space-y-3">
          {/* Dynamic Badge System */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 bg-purple-100/70 dark:bg-purple-900/30 px-3 py-1.5 rounded-full text-sm backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/50">
              <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-purple-900 dark:text-purple-300 font-medium">
                Top {Math.ceil(person.popularity / 10)}% Ranked
              </span>
            </div>

            {viewMode === "detailed" && (
              <div className="flex items-center gap-2 bg-blue-100/70 dark:bg-blue-900/30 px-3 py-1.5 rounded-full text-sm backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50">
                <Film className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-700 dark:text-blue-300 font-medium">
                  {person.known_for_department}
                </span>
              </div>
            )}
          </div>

          {/* Smart Preview Panel */}
          {viewMode === "detailed" && person.known_for.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="pt-2 space-y-2"
            >
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                Featured In:
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {person.known_for.slice(0, 3).map((work, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 relative w-20 h-28 rounded-lg overflow-hidden border border-white/20 group/work"
                  >
                    <Image
                      src={
                        work.poster_path
                          ? `https://image.tmdb.org/t/p/w200${work.poster_path}`
                          : "/placeholder.png"
                      }
                      alt={work.title || work.name || ""}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/work:opacity-100 transition-opacity p-2 flex items-end">
                      <span className="text-xs font-medium text-white line-clamp-2">
                        {work.title || work.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Contextual Action Layer */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
          animate={{ opacity: isHovered ? 1 : 0 }}
        >
          <Link
            href={`person/${person.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <UserPlus className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="font-medium text-gray-800 dark:text-gray-100">
              View Full Profile
            </span>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

const DepartmentFilter = ({
  selected,
  setSelected,
}: {
  selected: string;
  setSelected: (s: string) => void;
}) => {
  const departments = ["Acting", "Directing", "Production", "Writing", "Sound"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl backdrop-blur-sm dark:border-gray-700"
    >
      <div className="flex flex-wrap gap-3">
        {departments.map((dept) => (
          <motion.button
            key={dept}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelected(dept === selected ? "" : dept)}
            className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all border ${
              selected === dept
                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white border-transparent shadow-lg"
                : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
            }`}
          >
            <Filter className="shrink-0" /> {dept}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

const ViewToggle = ({
  viewMode,
  setViewMode,
}: {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}) => (
  <motion.div
    className="flex gap-2 bg-gray-100 dark:bg-gray-700 p-2 rounded-full border border-gray-200 dark:border-gray-600"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setViewMode("simple")}
      className={`px-6 py-2 rounded-full flex items-center gap-2 transition-all ${
        viewMode === "simple"
          ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
      }`}
    >
      <Film /> Simple
    </motion.button>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setViewMode("detailed")}
      className={`px-6 py-2 rounded-full flex items-center gap-2 transition-all ${
        viewMode === "detailed"
          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
      }`}
    >
      <Tv /> Detailed
    </motion.button>
  </motion.div>
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
    <div className="min-h-screen dark:bg-gray-900 p-8">
      <div className="max-w-7xl pt-12 mx-auto space-y-12">
        {allPeople.length > 0 && <HighlightPerson person={allPeople[0]} />}

        <DepartmentFilter
          selected={selectedDepartment}
          setSelected={setSelectedDepartment}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid lg:grid-cols-2 gap-6"
        >
          <PopularityChart people={filteredPeople} />
          <NetworkGraph people={filteredPeople} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-trasnparent/20  dark:bg-gray-800 rounded-2xl p-8 backdrop-blur-lg shadow-2xl border border-purple-500 dark:border-gray-700"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <motion.h2
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              className="text-3xl font-bold dark:text-white bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
            >
              {selectedDepartment || "All"} Stars
              <span className="text-purple-500 ml-2">
                ({filteredPeople.length})
              </span>
            </motion.h2>
            <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
          </div>

          <AnimatePresence>
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredPeople.slice(1).map((person) => (
                <PersonCard
                  key={person.id}
                  person={person}
                  viewMode={viewMode}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Load More Button */}
          <div className="mt-8 flex justify-center">
            <motion.button
              onClick={() => fetchNextPage()}
              disabled={!hasNextPage || isFetchingNextPage}
              className={`px-8 py-3 rounded-full flex items-center gap-2 transition-all ${
                hasNextPage
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              }`}
              whileHover={hasNextPage ? { scale: 1.05 } : {}}
              whileTap={hasNextPage ? { scale: 0.95 } : {}}
            >
              {isFetchingNextPage ? (
                <>
                  <Loader className="animate-spin" />
                  Loading...
                </>
              ) : hasNextPage ? (
                <>
                  <ChevronDown className="text-lg" />
                  Load More
                </>
              ) : (
                "No More Results"
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Add loading skeleton component
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="h-96 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl animate-pulse border border-dashed border-gray-300 dark:border-gray-700" />
      <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-full w-1/3 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"
          />
        ))}
      </div>
    </div>
  </div>
);

// Add error state component
const ErrorState = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
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
