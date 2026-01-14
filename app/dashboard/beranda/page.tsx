"use client";

import {
  Home,
  Heart,
  Clock,
  Settings,
  LogOut,
  User,
  Film,
  TrendingUp,
  PlayCircle,
  ChevronRight,
} from "lucide-react";
import { useUserProfile } from "@/hook/useUserProfile";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import useIsMobile from "@/hook/useIsMobile";
import WatchStatistics from "@/Fragments/WatchStatistics";
import { Metadata } from "@/app/Metadata";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

// Data dummy untuk contoh
const userData = {
  subscription: "Premium",
};

export default function page() {
  const [mounted, setMounted] = useState(false);
  const { user: data, isLoadingUser: isLoading } = useAuth();
  const [statsType, setStatsType] = useState<"month" | "week">("week");
  const { data: watchlistData } = useUserProfile({ queryType: "watchlist" });
  const { data: favoritesData } = useUserProfile({ queryType: "favorites" });
  const { data: historyData } = useUserProfile({ queryType: "history" });
  const { data: statsData } = useUserProfile({
    queryType: "stats",
    type: statsType,
  });
  const isMobile = useIsMobile();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}j ${minutes}m`;
  };

  return (
    <>
      <Metadata
        seoTitle="Statistik - Dashboard"
        seoDescription="Statistik Histori Tontonan"
        seoKeywords="statistik, histori, tontonan"
      />

      {/* Background with subtle gradient instead of flat black */}
      <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-green-500/30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-10"
          >
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  Dashboard
                </h1>
                <div className="text-zinc-400 mt-1">
                  Overview aktivitas menonton anda.
                </div>
              </div>

              <div className="flex items-center gap-4 bg-zinc-900/50 p-2 pr-4 rounded-full border border-zinc-800/50 backdrop-blur-sm">
                <Avatar className="h-10 w-10 rounded-full overflow-hidden border border-zinc-700">
                  <AvatarImage
                    src={data?.data?.profile?.avatar || ""}
                    alt={data?.data?.name || "User"}
                    className="object-cover h-full w-full"
                  />
                  <AvatarFallback className="flex h-full w-full items-center justify-center bg-zinc-800 text-xs font-bold">
                    {data?.data?.name?.substring(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-400">Welcome back,</span>
                  <span className="text-sm font-semibold leading-none">
                    {data?.data?.name}
                  </span>
                </div>
              </div>
            </header>

            {/* Quick Stats Grid - Cleaner Look */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={<User className="w-5 h-5" />}
                title="Paket Saat Ini"
                value={userData.subscription}
                subValue="Active"
              />
              <StatCard
                icon={<Clock className="w-5 h-5" />}
                title="Watchlist"
                value={statsData?.data?.overall?.totalWatchlist || 0}
                subValue="Judul disimpan"
              />
              <StatCard
                icon={<Heart className="w-5 h-5" />}
                title="Favorit"
                value={statsData?.data?.overall?.totalFavorites || 0}
                subValue="Judul disukai"
              />
              <StatCard
                icon={<Film className="w-5 h-5" />}
                title="Selesai"
                value={statsData?.data?.overall?.totalCompletedContent || 0}
                subValue="Total ditonton"
              />
            </div>

            {/* Content Sections */}
            <div className="space-y-8">
              {/* Recently Watched */}
              <SectionHeader
                title="Lanjutkan Menonton"
                link="/dashboard/history-watch"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {historyData?.history.slice(0, 3).map((movie: any) => (
                  <RecentMovieCard
                    key={movie._id}
                    movie={movie}
                    isMobile={isMobile}
                  />
                ))}
              </div>

              {/* Watch Statistics Component */}
              <div className="pt-4">
                <WatchStatistics
                  statsType={statsType}
                  setStatsType={setStatsType}
                  statsData={statsData}
                />
              </div>

              {/* Grid 2 Column for Watchlist & Favorites */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <SectionHeader
                    title="Daftar Lihat"
                    link="/dashboard/watchlist"
                  />
                  <div className="space-y-4 mt-4">
                    {watchlistData?.slice(0, 3).map((movie: any) => (
                      <CompactListCard
                        key={movie._id}
                        movie={movie}
                        isMobile={isMobile}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <SectionHeader
                    title="Film Favorit"
                    link="/dashboard/favorite"
                  />
                  <div className="space-y-4 mt-4">
                    {favoritesData?.slice(0, 3).map((movie: any) => (
                      <CompactListCard
                        key={movie._id}
                        movie={movie}
                        isMobile={isMobile}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

// --- Sub Components ---

const SectionHeader = ({ title, link }: { title: string; link: string }) => (
  <div className="flex justify-between items-end mb-4 border-b border-zinc-800 pb-2">
    <h2 className="text-xl font-bold text-zinc-100">{title}</h2>
    <Link href={link} legacyBehavior>
      <a className="text-sm font-medium text-green-500 hover:text-green-400 flex items-center gap-1 transition-colors">
        Lihat Semua <ChevronRight className="w-4 h-4" />
      </a>
    </Link>
  </div>
);

const StatCard = ({ icon, title, value, subValue }: any) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl backdrop-blur-sm hover:border-zinc-700 transition-colors"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="p-2 bg-zinc-800/50 rounded-lg text-zinc-400 border border-zinc-700/50">
        {icon}
      </div>
      {/* Optional: Add trend indicator here */}
    </div>
    <div>
      <h3 className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-1">
        {title}
      </h3>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-bold text-white">{value}</div>
        <span className="text-xs text-zinc-500">{subValue}</span>
      </div>
    </div>
  </motion.div>
);

const RecentMovieCard = ({
  movie,
  isMobile,
}: {
  movie: any;
  isMobile: boolean;
}) => {
  return (
    <motion.div
      className="group relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-sm"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {/* Image Container */}
      <div className="relative aspect-video w-full overflow-hidden">
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all z-10" />
        <ImageWithFallback
          src={`https://image.tmdb.org/t/p/${isMobile ? "w300" : "w500"}${
            movie.backdrop_path
          }`}
          alt={movie.title ?? ""}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          fallbackText="No Image"
        />

        {/* Play Button Overlay */}
        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 relative z-20 bg-zinc-900">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-white font-semibold truncate pr-2 flex-1">
            {movie.title}
          </h3>
          <span className="text-[10px] font-medium text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
            {movie.genres?.[0]?.name || movie.genres?.[0] || "Movie"}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Progress</span>
            <span>{movie.progressPercentage}%</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${movie.progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// New Compact Card Design for lists
const CompactListCard = ({
  movie,
  isMobile,
}: {
  movie: any;
  isMobile: boolean;
}) => (
  <motion.div
    whileHover={{ x: 4 }}
    className="flex gap-4 p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all cursor-pointer group"
  >
    <div className="relative w-24 aspect-video rounded-md overflow-hidden flex-shrink-0">
      <ImageWithFallback
        src={`https://image.tmdb.org/t/p/w300${movie.backdrop_path}`}
        alt={movie.title}
        fill
        className="object-cover"
        fallbackText=""
      />
    </div>
    <div className="flex flex-col justify-center min-w-0">
      <h4 className="text-sm font-medium text-zinc-200 truncate group-hover:text-green-400 transition-colors">
        {movie.title}
      </h4>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-zinc-500">
          {movie.release_date
            ? new Date(movie.release_date).getFullYear()
            : "-"}
        </span>
        <span className="text-zinc-600 text-[10px]">•</span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-yellow-500/80">★</span>
          <span className="text-xs text-zinc-400">
            {movie.vote_average ? Number(movie.vote_average).toFixed(1) : "-"}
          </span>
        </div>
      </div>
    </div>
  </motion.div>
);
