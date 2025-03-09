// components/WatchStatistics.tsx
"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Film, Tv, Clock, Star, Zap, Calendar } from "lucide-react";

interface WatchStatisticsProps {
  statsData: any;
  statsType: "month" | "week";
  setStatsType: (type: "month" | "week") => void;
}

const WatchStatistics = ({ statsData, statsType, setStatsType }: WatchStatisticsProps) => {

  // Format data period
  const periodData = statsData?.data?.period?.data || [];
  const summaryData = statsData?.data?.period?.summary || {};
  const overallData = statsData?.data?.overall || {};

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Statistik Menonton</h2>
          <p className="text-gray-400 text-sm">
            {statsType === "month" 
              ? statsData?.data?.period?.label 
              : "7 Hari Terakhir"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setStatsType("month")}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              statsType === "month"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <Calendar size={18} />
            Bulanan
          </button>
          <button
            onClick={() => setStatsType("week")}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              statsType === "week"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <Zap size={18} />
            Mingguan
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
          <StatBox 
          icon={<Clock size={20} />}
          title="Total Durasi"
          value={overallData.formattedWatchTime}
          color="text-blue-400"
          />

          <StatBox
            icon={<Film size={20} />}
            title="Film Ditonton"
            value={overallData.totalContentWatched}
            color="text-purple-400"
          />

          <StatBox
            icon={<Star size={20} />}
            title="Rate Penyelesaian"
            value={`${summaryData.completionRate || 0}%`}
            color="text-yellow-400"
          />

          <StatBox
            icon={<Tv size={20} />}
            title="Rasio Film:Series"
            value={`${summaryData.totalMovies || 0}:${summaryData.totalTVEpisodes || 0}`}
            color="text-green-400"
          />

        </div>

        <div className="mt-6 ">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Aktivitas Menonton</span>
            <span>
              {statsType === "month" ? "Bulan Ini" : "Minggu Ini"}
            </span>
          </div>
          <div className="h-16 flex items-end space-x-2">
            {statsData?.data?.period?.data?.map(
              (entry: any, index: number) => {
                const maxDuration = Math.max(
                  ...statsData.data.period.data.map(
                    (e: any) => e.totalDuration
                  )
                );
                const height =
                  (entry.totalDuration / (maxDuration || 1)) * 100;

                return (
                  <motion.div
                    key={index}
                    className="bg-blue-600 rounded-t w-full hover:bg-blue-500 transition-colors"
                    style={{ height: `${height}%` }}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.05,
                      type: 'spring'
                    }}
                  />
                );
              }
            )}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            {statsData?.data?.period.data.map(
              (entry: any, index: number) => (
                <span key={index}>
                  {statsType === "month"
                    ? `${entry.label}`
                    : `${entry.dayOfWeek}`}
                </span>
              )
            )}
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-700">
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-2 text-sm">
              <Clock size={16} className="text-blue-400" />
              <span className="font-medium">Waktu Nonton Favorit:</span>
              <span className="text-gray-300">
                {summaryData.favoriteWatchTimes?.[0]?.timeOfDay || "-"}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Film size={16} className="text-purple-400" />
              <span className="font-medium">Genre Dominan:</span>
              <div className="flex gap-2">
                {overallData.mostWatchedGenres?.slice(0, 3).map((genre: any, i: number) => (
                  <span key={i} className="px-2 py-1 bg-gray-700 rounded-full text-xs">
                    {genre.genre}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-2 text-sm">
              <Star size={16} className="text-yellow-400" />
              <span className="font-medium">Rata-rata Progress:</span>
              <span className="text-gray-300">
                {summaryData.avgProgressPercentage?.toFixed(1) || 0}%
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Zap size={16} className="text-green-400" />
              <span className="font-medium">Durasi Harian:</span>
              <span className="text-gray-300">
                {summaryData.averageWatchTimePerDay || "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ icon, title, value, color }: any) => (
  <motion.div 
    className="bg-gray-800/50 p-4 rounded-xl transition-colors relative overflow-hidden"
    whileHover={{ 
      scale: 1.02,
      transition: { duration: 0.2 }
    }}
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-opacity-20 ${color.replace('text', 'bg')}`}>
        {icon}
      </div>
      <div>
        <div className="text-sm text-gray-400 mb-1">{title}</div>
        <div className={`text-xl font-semibold ${color}`}>
          {value || "-"}
        </div>
      </div>
    </div>
  </motion.div>
)

export default WatchStatistics;