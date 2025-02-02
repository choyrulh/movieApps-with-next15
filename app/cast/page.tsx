"use client";

import { useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getPopularCasts } from "@/Service/fetchMovie";
import {
  Award,
  ChevronDown,
  ChevronRight,
  Film,
  Filter,
  Loader,
  Star,
  TrendingUp,
  Tv,
  Zap,
} from "lucide-react";
import { PopularityChart } from "@/components/PopularityChart";
import { NetworkGraph } from "@/components/NetworkGraph";

export type Person = {
  id: number;
  name: string;
  profile_path: string;
  popularity: number | string;
  known_for_department: string;
  known_for: Array<{
    title?: string;
    name?: string;
    media_type: string;
  }>;
};

type ViewMode = "simple" | "detailed";

const HighlightPerson = ({ person }: { person: Person }) => {
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
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/30 isolate"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
        <motion.div
          className="absolute inset-0 opacity-50"
          animate={{
            background: [
              "radial-gradient(circle at 0% 0%, purple 0%, transparent 50%)",
              "radial-gradient(circle at 100% 100%, blue 0%, transparent 50%)",
              "radial-gradient(circle at 0% 100%, indigo 0%, transparent 50%)",
              "radial-gradient(circle at 0% 0%, purple 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity }}
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

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      <div className="relative flex flex-col md:flex-row items-center p-8 gap-8">
        {/* Profile Image */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          className="w-48 h-48 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl relative group"
        >
          <Image
            src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
            alt={person.name}
            width={200}
            height={200}
            className="object-cover transform group-hover:scale-110 transition-transform duration-500"
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-purple-500/30 to-transparent"
            whileHover={{ opacity: 0 }}
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
        <div className="text-white space-y-6 flex-1">
          <motion.div variants={itemVariants}>
            <h1 className="text-5xl font-bold">
              <span className="bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 bg-clip-text text-transparent">
                {person.name}
              </span>
            </h1>
            <p className="text-lg text-white/80 mt-2">
              {person.known_for_department} Artist
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="flex gap-4 flex-wrap">
            <motion.div
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(255, 255, 255, 0.15)",
              }}
              className="bg-white/10 backdrop-blur-sm px-6 py-2.5 rounded-xl flex items-center gap-2 border border-white/20 transition-all duration-300"
            >
              <Star className="text-yellow-400 text-lg" />
              <span className="font-medium">
                {person.popularity.toFixed(1)} Rating
              </span>
            </motion.div>
            <motion.div
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(255, 255, 255, 0.15)",
              }}
              className="bg-white/10 backdrop-blur-sm px-6 py-2.5 rounded-xl flex items-center gap-2 border border-white/20 transition-all duration-300"
            >
              <TrendingUp className="text-green-400 text-lg" />
              <span className="font-medium">
                Trending #{Math.floor(Math.random() * 50 + 1)}
              </span>
            </motion.div>
            <motion.div
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(255, 255, 255, 0.15)",
              }}
              className="bg-white/10 backdrop-blur-sm px-6 py-2.5 rounded-xl flex items-center gap-2 border border-white/20 transition-all duration-300"
            >
              <Award className="text-blue-400 text-lg" />
              <span className="font-medium">
                {person.known_for.length} Notable Works
              </span>
            </motion.div>
          </motion.div>

          {/* Notable Works */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-xl font-semibold text-white/90 flex items-center gap-2">
              <Film className="text-purple-400" />
              Featured Productions
            </h3>
            <div className="flex flex-wrap gap-3">
              {person.known_for.slice(0, 3).map((work, index) => (
                <motion.div
                  key={index}
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                  }}
                  className="group px-4 py-2.5 bg-white/10 rounded-xl text-sm backdrop-blur-sm flex items-center gap-3 border border-white/20 transition-all duration-300"
                >
                  {work.media_type === "movie" ? (
                    <Film className="text-pink-400" />
                  ) : (
                    <Tv className="text-blue-400" />
                  )}
                  <span className="font-medium">{work.title || work.name}</span>
                  <ChevronRight className="text-white/60 group-hover:translate-x-1 transition-transform" />
                </motion.div>
              ))}
            </div>
          </motion.div>
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
  const renderBadge = (
    icon: React.ReactNode,
    text: string,
    colorClass: string
  ) => (
    <motion.span
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${colorClass} px-3 py-1 rounded-full text-sm flex items-center gap-1.5 border shadow-sm backdrop-blur-sm transition-all duration-300`}
    >
      {icon}
      <span className="font-medium">{text}</span>
    </motion.span>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{
        duration: 0.3,
        type: "spring",
        stiffness: 300,
      }}
      className="bg-white dark:bg-gray-800/90 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden backdrop-blur-sm border border-white/10"
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10"
        animate={{
          opacity: [0, 0.5, 0],
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      {/* Spotlight effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-blue-500/20 animate-pulse" />
      </div>

      <div className="relative flex gap-6">
        {/* Profile Image Section */}
        <div className="flex-shrink-0 relative">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-24 h-24 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg relative group"
          >
            <Image
              src={
                person.profile_path
                  ? `https://image.tmdb.org/t/p/w200${person.profile_path}`
                  : "/placeholder.png"
              }
              alt={person.name}
              width={96}
              height={96}
              className="object-cover transform group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>

          {/* Enhanced ID Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2.5 py-1 rounded-full text-xs shadow-lg flex items-center gap-1.5 border border-white/20"
          >
            <Zap className="w-3 h-3" />
            <span className="font-semibold">#{person.id}</span>
          </motion.div>
        </div>

        {/* Content Section */}
        <div className="space-y-3 flex-1">
          <motion.h3
            layout
            className="text-xl font-bold dark:text-white group-hover:text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
          >
            {person.name}
          </motion.h3>

          {/* Badges Section */}
          <div className="flex gap-2 flex-wrap">
            {renderBadge(
              <Star className="w-4 h-4 text-yellow-500" />,
              person.popularity.toFixed(0),
              "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-100 border-yellow-200/50 dark:border-yellow-700/50"
            )}

            {viewMode === "detailed" && (
              <>
                {renderBadge(
                  <Filter className="w-4 h-4 text-blue-500" />,
                  person.known_for_department,
                  "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-100 border-blue-200/50 dark:border-blue-700/50"
                )}

                {person.known_for.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full mt-2"
                  >
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">
                      <Film className="w-4 h-4" />
                      <p className="font-medium">
                        Known for:{" "}
                        <span className="text-purple-600 dark:text-purple-400">
                          {person.known_for
                            .slice(0, 2)
                            .map((item) => item.title || item.name)
                            .join(", ")}
                        </span>
                      </p>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>

          {/* Extra Details for Detailed View */}
          {viewMode === "detailed" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-2"
            >
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <TrendingUp className="w-4 h-4" />
                <span>
                  Trending Score: {(person.popularity / 10).toFixed(1)}
                </span>
              </div>
            </motion.div>
          )}
        </div>
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
      className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl backdrop-blur-sm border border-gray-200 dark:border-gray-700"
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

// const PopularityChart = ({ people }: { people: Person[] }) => (
//   <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
//     <h3 className="text-2xl font-bold mb-6 dark:text-white">
//       Popularity Distribution
//     </h3>
//     <ResponsiveContainer width="100%" height={300}>
//       <BarChart data={people.slice(0, 8)}>
//         <XAxis dataKey="name" tick={{ fill: "#6B7280" }} />
//         <YAxis tick={{ fill: "#6B7280" }} />
//         <Tooltip
//           contentStyle={{
//             background: "#4F46E5",
//             color: "#fff",
//             borderRadius: "12px",
//           }}
//           itemStyle={{ color: "#fff" }}
//         />
//         <Bar
//           dataKey="popularity"
//           fill="#8B5CF6"
//           radius={[4, 4, 0, 0]}
//           animationDuration={800}
//         />
//       </BarChart>
//     </ResponsiveContainer>
//   </div>
// );

// const NetworkGraph = ({ people }: { people: Person[] }) => (
//   <motion.div
//     initial={{ opacity: 0 }}
//     animate={{ opacity: 1 }}
//     className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 shadow-2xl"
//   >
//     <h3 className="text-2xl font-bold text-white mb-6">
//       Collaboration Network
//     </h3>
//     <div className="grid grid-cols-3 md:grid-cols-5 gap-6">
//       {people.slice(0, 5).map((person) => (
//         <div key={person.id} className="text-center">
//           <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white mx-auto shadow-lg">
//             <Image
//               src={`https://image.tmdb.org/t/p/w200${person.profile_path}`}
//               alt={person.name}
//               width={64}
//               height={64}
//               className="object-cover"
//             />
//           </div>
//           <p className="text-sm text-white mt-2 font-medium">{person.name}</p>
//         </div>
//       ))}
//       <div className="col-span-3 md:col-span-5 flex justify-center items-center my-4">
//         <div className="h-1 bg-white/20 w-full rounded-full" />
//       </div>
//       <div className="text-center col-span-3 md:col-span-5">
//         <p className="text-white/80 text-lg">
//           Connected through 128 common projects
//         </p>
//       </div>
//     </div>
//   </motion.div>
// );

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

  // if (isLoading)
  //   return (
  //     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
  //       <div className="max-w-7xl mx-auto space-y-8">
  //         <motion.div
  //           initial={{ opacity: 0 }}
  //           animate={{ opacity: 1 }}
  //           className="h-96 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl animate-pulse border border-dashed border-gray-300 dark:border-gray-700"
  //         />
  //         <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-full w-1/3 animate-pulse" />
  //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  //           {[...Array(6)].map((_, i) => (
  //             <div
  //               key={i}
  //               className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"
  //             />
  //           ))}
  //         </div>
  //       </div>
  //     </div>
  //   );

  // if (error)
  //   return (
  //     <div className="text-center p-8 text-red-500">Error loading data</div>
  //   );

  // Flatten all pages into single array
  const allPeople = data?.pages.flatMap((page) => page.results) || [];
  const filteredPeople = selectedDepartment
    ? allPeople.filter((p) => p.known_for_department === selectedDepartment)
    : allPeople;

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorState />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
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
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-100 dark:border-gray-700"
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
