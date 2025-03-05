'use client'

import { useUserProfile } from "@/hook/useUserProfile";
import { Clock, Play, Tv, Film, History } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import {formatIndonesianDate, getTimeAgo} from "@/lib/function/dateFormatter"


const MovieHistoryCard = ({ item }: { item: any }) => {
  const progressColor = item.progressPercentage >= 90 
    ? "bg-green-500" 
    : item.progressPercentage >= 50
    ? "bg-yellow-500"
    : "bg-red-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-4 p-4 rounded-xl bg-gray-800 hover:bg-gray-750 transition-colors"
    >
      {/* Poster */}
      <div className="relative flex-shrink-0">
        <img
          src={`https://image.tmdb.org/t/p/w200${item.posterPath}`}
          alt={item.title}
          className="w-24 h-36 rounded-lg object-cover"
        />
        <div className="absolute bottom-1 left-1 bg-black/80 px-2 py-1 rounded text-xs">
          {Math.floor(item.durationWatched / 60)}h {item.durationWatched % 60}m
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold truncate">{item.title}</h3>
          <span className="text-xs text-gray-400">
            {formatIndonesianDate(new Date(item.watchedDate))}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="h-2 bg-gray-700 rounded-full">
            <div 
              className={`h-full rounded-full ${progressColor} transition-all duration-300`}
              style={{ width: `${item.progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs">
            <span>{item.progressPercentage}% Complete</span>
            <span>
              {Math.floor(item.totalDuration / 60)}h {item.totalDuration % 60}m total
            </span>
          </div>
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-2">
          {item.genres?.map((genre: string) => (
            <span
              key={genre}
              className="px-2 py-1 text-xs font-medium rounded-full bg-gray-700 text-gray-300"
            >
              {genre}
            </span>
          ))}
        </div>

        {/* Watched Time Ago */}
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <History className="w-4 h-4" />
          <span>
            Ditonton {getTimeAgo(new Date(item.watchedDate))}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default function Page () {
  const { data: history, isLoading, error } = useUserProfile({
    queryType: "history",
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-full bg-blue-500/85">
          <Clock className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Riwayat Nonton</h1>
          <p className="text-gray-400">Film dan series yang pernah kamu tonton</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-500">
          Gagal memuat riwayat nonton
        </div>
      ) : history?.length > 0 ? (
        <motion.div className="space-y-4">
          {history?.history.map((item: any) => (
            <MovieHistoryCard key={item._id} item={item} />
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Film className="h-16 w-16 text-gray-600 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-400 mb-2">
            Belum ada riwayat
          </h2>
          <p className="text-gray-600 max-w-md">
            Mulai tonton film atau series favoritmu dan akan muncul di sini
          </p>
        </div>
      )}
    </div>
  );
};