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
} from "lucide-react";
import { useUserProfile } from "@/hook/useUserProfile";
import Image from "next/image";
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
  const { data, isLoading, error } = useUserProfile({
    queryType: "userProfile",
  });
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

      <div className="min-h-screen bg-black text-white">
        {/* Main Content */}
        <div className="px-4 md:px-8 py-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Dashboard</h1>

              <div className="flex items-center space-x-4">
                <div className="hidden md:block text-right">
                  <p className="font-bold text-gray-400">
                    Welcome,{" "}
                    <span className="text-gray-400">
                      {data?.data?.name}
                    </span>
                  </p>
                </div>

                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={data?.data?.profile?.avatar || ""}
                    alt={data?.data?.name || "User Avatar"}
                  />
                  <AvatarFallback>
                    {data?.data?.name
                      ? data.data.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>


            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <StatCard
                icon={<User className="w-6 h-6" />}
                title="Paket"
                value={userData.subscription}
              />
              <StatCard
                icon={<Clock className="w-6 h-6" />}
                title="Watchlist"
                value={statsData?.data?.overall?.totalWatchlist}
              />
              <StatCard
                icon={<Heart className="w-6 h-6" />}
                title="Favorit"
                value={statsData?.data?.overall?.totalFavorites}
              />
              <StatCard
                icon={<Film className="w-6 h-6" />}
                title="Film Selesai"
                value={statsData?.data?.overall?.totalCompletedContent}
              />
            </div>

            {/* Recently Watched */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Baru Ditonton</h2>
                <Link href="/dashboard/history-watch" legacyBehavior>
                  <a className="text-sm text-green-500/85 hover:underline">
                    Lihat Semua
                  </a>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {historyData?.history.slice(0, 3).map((movie: any) => (
                  <RecentMovieCard key={movie._id} movie={movie} />
                ))}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Daftar Lihat</h2>
                <Link href="/dashboard/watchlist" legacyBehavior>
                  <a className="text-sm text-green-500/85 hover:underline">
                    Lihat Semua
                  </a>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {watchlistData?.slice(0, 3).map((movie: any) => (
                  <RecommendedMovieCard key={movie._id} movie={movie} />
                ))}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Film Favorit</h2>
                <Link href="/dashboard/favorite" legacyBehavior>
                  <a className="text-sm text-green-500/85 hover:underline">
                    Lihat Semua
                  </a>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {favoritesData?.slice(0, 3).map((movie: any) => (
                  <RecommendedMovieCard key={movie._id} movie={movie} />
                ))}
              </div>
            </div>

            {/* Watch Statistics */}
            <WatchStatistics
              statsType={statsType}
              setStatsType={setStatsType}
              statsData={statsData}
            />
          </motion.div>
        </div>
      </div>
    </>
  );
}

// Komponen Card untuk film yang ditonton baru-baru ini
const RecentMovieCard = ({ movie }: { movie: any }) => {
  const isMobile = useIsMobile();

  return (
    <motion.div
      className="bg-[#222222] rounded-lg overflow-hidden shadow-lg"
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative h-40">
        <div className="absolute inset-0 bg-black/50 z-10 flex items-end">
          <div className="p-3 w-full">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-medium truncate">{movie.title}</h3>
              <span className="text-xs text-gray-300 bg-[#111111] px-2 py-1 rounded">
                {movie.genres[1]}
              </span>
            </div>
            <div className="mt-2 bg-[#111111] h-1 rounded-full w-full">
              <div
                className="bg-green-500/85 h-1 rounded-full"
                style={{ width: `${movie.progressPercentage}%` }}
              ></div>
            </div>
            <div className="mt-1 text-xs text-gray-300 text-right">
              {movie.progressPercentage}%
            </div>
          </div>
        </div>
        <div className="relative w-full h-full">
          <Image
            src={
              `https://image.tmdb.org/t/p/${isMobile ? "w300" : "w500"}${
                movie.backdrop_path
              }` || "/default-poster.jpg"
            }
            alt={movie.title ?? ""}
            fill
            // objectFit="cover"
            className="object-cover"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFdQIQX8Ku3QAAAABJRU5ErkJggg=="
          />
        </div>
      </div>
    </motion.div>
  );
};

// Komponen Card untuk film yang direkomendasikan
const RecommendedMovieCard = ({ movie }: { movie: any }) => {
  const isMobile = useIsMobile();
  return (
    <motion.div
      className="bg-[#222222] rounded-lg overflow-hidden shadow-lg"
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative h-40">
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10 flex items-end">
          <div className="p-3 w-full">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-medium truncate">{movie.title}</h3>
              <span className="text-xs text-white bg-yellow-600 px-2 py-1 rounded-full">
                ★ {Math.floor(movie.vote_average)}
              </span>
            </div>
            <div className="mt-1 text-xs text-gray-300">
              {movie.genres[0]?.name}
            </div>
          </div>
        </div>
        <div className="relative w-full h-full">
          <Image
            src={
              `https://image.tmdb.org/t/p/${isMobile ? "w300" : "w500"}${
                movie.backdrop_path
              }` || "/default-poster.jpg"
            }
            alt={movie.title ?? ""}
            fill
            // objectFit="cover"
            className="object-cover"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFdQIQX8Ku3QAAAABJRU5ErkJggg=="
          />
        </div>
      </div>
    </motion.div>
  );
};

// Komponen Statistik
const StatCard = ({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
}) => (
  <motion.div
    className="bg-[#222222] p-4 rounded-lg"
    whileHover={{ scale: 1.05 }}
    transition={{ duration: 0.2 }}
  >
    <div className="flex items-center space-x-4">
      <div className="bg-green-500/20 p-3 rounded-full text-green-500">
        {icon}
      </div>
      <div>
        <h3 className="text-gray-400 text-sm">{title}</h3>
        <p className="text-white text-xl font-semibold">{value}</p>
      </div>
    </div>
  </motion.div>
);

const AvatarPlaceholder = ({ name }: { name?: string }) => {
  const getInitials = (fullName?: string) => {
    if (!fullName) return "U"; // Default inisial jika nama tidak ada
    const initials = fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
    return initials.length > 2 ? initials.slice(0, 2) : initials;
  };

  return (
    <div className="flex items-center justify-center w-10 h-10 bg-gray-700 text-white font-bold rounded-full">
      {getInitials(name)}
    </div>
  );
};
