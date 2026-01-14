"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Film,
  Tv,
  Clock,
  Star,
  Zap,
  Calendar,
  Activity,
  BarChart3,
  PieChart,
} from "lucide-react";
import capitalize from "@/lib/function/capitalize";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";

interface WatchStatisticsProps {
  statsData: any;
  statsType: "month" | "week";
  setStatsType: (type: "month" | "week") => void;
}

const WatchStatistics = ({
  statsData,
  statsType,
  setStatsType,
}: WatchStatisticsProps) => {
  const periodData = statsData?.data?.period?.data || [];
  const summaryData = statsData?.data?.period?.summary || {};
  const overallData = statsData?.data?.overall || {};
  const recentActivity = statsData?.data?.recentActivity || [];

  const formatHours = (seconds: number) => {
    if (!seconds) return "0j 0m";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}j ${minutes}m`;
  };

  // Mencari nilai maksimum untuk kalkulasi tinggi batang grafik
  const maxDurationValue =
    periodData.length > 0
      ? Math.max(...periodData.map((e: any) => e.totalDuration || 0))
      : 0;
  return (
    <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-6 md:p-8">
      {/* Header Statistik */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
            <BarChart3 className="w-6 h-6 text-green-500" />
            Statistik Menonton
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Analisis aktivitas anda{" "}
            {statsType === "month" ? "bulan ini" : "7 hari terakhir"}.
          </p>
        </div>

        {/* Toggle Switch Modern */}
        <div className="bg-zinc-900 p-1 rounded-lg border border-zinc-800 inline-flex">
          <button
            onClick={() => setStatsType("week")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              statsType === "week"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Mingguan
          </button>
          <button
            onClick={() => setStatsType("month")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              statsType === "month"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Bulanan
          </button>
        </div>
      </div>

      {/* Main Stats Grid - Bento Grid Style */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatBox
          label="Total Durasi"
          value={overallData.formattedWatchTime}
          icon={<Clock size={16} />}
          accentColor="text-green-500"
        />
        <StatBox
          label="Total Judul"
          value={
            (overallData.contentTypeDistribution?.[0]?.count || 0) +
            (overallData.contentTypeDistribution?.[1]?.count || 0)
          }
          icon={<Film size={16} />}
          accentColor="text-blue-500"
        />
        <StatBox
          label="Rate Selesai"
          value={`${summaryData.completionRate || 0}%`}
          icon={<Activity size={16} />}
          accentColor="text-purple-500"
        />
        <StatBox
          label="Dalam Progres"
          value={overallData.totalInProgress || 0}
          icon={<Zap size={16} />}
          accentColor="text-yellow-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section (2/3 width) */}
        <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-zinc-200">Grafik Aktivitas</h3>
            <div className="flex gap-2 text-xs">
              <span className="flex items-center gap-1 text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Waktu Nonton
              </span>
            </div>
          </div>

          <div className="h-auto w-full">
            {periodData?.length > 0 ? (
              <div className="flex items-end justify-between h-full gap-2 md:gap-4">
                {periodData.map((entry: any, index: number) => {
                  const heightPercentage =
                    maxDurationValue > 0
                      ? Math.max(
                          (entry.totalDuration / maxDurationValue) * 100,
                          3
                        )
                      : 0;

                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
                    >
                      <div className="w-full h-40 md:h-48 relative rounded-t-lg overflow-hidden">
                        <motion.div
                          className="absolute bottom-0 w-full text-center bg-green-500/80 group-hover:bg-green-400 transition-colors"
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPercentage}%` }}
                          transition={{
                            duration: 0.8,
                            ease: "easeOut",
                            delay: index * 0.05,
                          }}
                        >
                          {/* Tooltip */}
                          <span className="text-[10px] md:text-xs text-white font-semibold select-none">
                            {formatHours(entry.totalDuration)}
                          </span>
                        </motion.div>
                      </div>

                      <span className="text-[10px] md:text-xs text-zinc-500 uppercase font-medium">
                        {statsType === "month"
                          ? entry.label?.split(" ")[1]
                          : entry.dayOfWeek.substring(0, 3)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-2">
                <Activity className="w-8 h-8 opacity-20" />
                <span>Belum ada data aktivitas</span>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Stats (1/3 width) */}
        <div className="space-y-4">
          {/* Completion Score Card */}
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4 text-zinc-300">
              <Activity className="w-4 h-4 text-green-500" />
              <h3 className="text-sm font-semibold">Konsistensi</h3>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-2xl font-bold text-white">
                  {periodData.filter((d: any) => d.hasActivity).length}
                  <span className="text-sm text-zinc-500 font-normal ml-1">
                    hari aktif
                  </span>
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  Waktu favorit:{" "}
                  <span className="text-zinc-300">
                    {summaryData.favoriteWatchTimes?.[0]?.timeOfDay || "-"}
                  </span>
                </div>
              </div>
              <div className="h-12 w-12">
                <CircularProgress
                  value={
                    (periodData.filter((d: any) => d.hasActivity).length /
                      (statsType === "week" ? 7 : 28)) *
                    100
                  }
                  size={48}
                  strokeWidth={4}
                />
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-4 mt-2">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-zinc-400">Rata-rata Progress</span>
                <span className="text-white font-medium">
                  {summaryData.avgProgressPercentage?.toFixed(0) || 0}%
                </span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-zinc-600 h-full rounded-full"
                  style={{
                    width: `${summaryData.avgProgressPercentage || 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Genre Distribution */}
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3 text-zinc-300">
              <PieChart className="w-4 h-4 text-purple-500" />
              <h3 className="text-sm font-semibold">Top Genre</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {overallData.mostWatchedGenres
                ?.slice(0, 4)
                .map((genre: any, i: number) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 bg-zinc-800 text-zinc-300 rounded-full border border-zinc-700/50"
                  >
                    {genre.genre}
                  </span>
                ))}
              {!overallData.mostWatchedGenres?.length && (
                <span className="text-xs text-zinc-500">-</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity List - Updated with Episode Info */}
      <div className="mt-6 border-t border-zinc-800 pt-6">
        <h3 className="font-semibold text-zinc-200 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-green-500" />
          Aktivitas Terakhir
        </h3>
        <div className="space-y-2">
          {recentActivity.slice(0, 3).map((activity: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 hover:bg-zinc-900/60 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-4 overflow-hidden">
                {/* Thumbnail */}
                <div className="relative w-14 h-14 rounded-md bg-zinc-800 flex-shrink-0 overflow-hidden border border-zinc-700/50">
                  <ImageWithFallback
                    src={`https://image.tmdb.org/t/p/w92${activity.poster}`}
                    alt={activity.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    fallbackText=""
                  />
                </div>

                {/* Info Text */}
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-zinc-100 truncate pr-4">
                    {activity.title}
                  </h4>

                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {/* Badge Type & Episode Info */}
                    {activity.type === "tv" ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] px-1.5 py-0.5 bg-green-500/10 text-green-500 rounded font-bold uppercase tracking-wider">
                          TV
                        </span>
                        <span className="text-xs text-zinc-300 font-medium">
                          {/* Menampilkan S1:E2 atau info episode lainnya */}S
                          {activity.season || 1} : E{activity.episode || 1}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/10 text-blue-500 rounded font-bold uppercase tracking-wider">
                        Movie
                      </span>
                    )}

                    <span className="text-zinc-600 text-[10px]">•</span>
                    <span className="text-xs text-zinc-500">
                      {activity.formattedWatchedDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Value */}
              <div className="text-right flex-shrink-0 ml-4">
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-xs font-mono font-bold ${
                      activity.progressPercentage >= 90
                        ? "text-green-500"
                        : "text-zinc-400"
                    }`}
                  >
                    {activity.progressPercentage}%
                  </span>
                  {/* Progress bar kecil di bawah angka */}
                  <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        activity.progressPercentage >= 90
                          ? "bg-green-500"
                          : "bg-zinc-200"
                      }`}
                      style={{ width: `${activity.progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Fallback if empty */}
          {!recentActivity?.length && (
            <div className="text-center py-8 text-zinc-600 text-sm italic">
              Belum ada histori tontonan terbaru.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Reusable Small Components

const StatBox = ({ label, value, icon, accentColor }: any) => (
  <div className="bg-zinc-900/50 border border-zinc-800/50 p-4 rounded-xl flex flex-col justify-between hover:border-zinc-700 transition-colors">
    <div
      className={`p-2 rounded-lg w-fit mb-3 bg-zinc-950 border border-zinc-800 ${accentColor}`}
    >
      {icon}
    </div>
    <div>
      <div className="text-2xl font-bold text-white tracking-tight">
        {value || 0}
      </div>
      <div className="text-xs text-zinc-500 font-medium mt-1">{label}</div>
    </div>
  </div>
);

const CircularProgress = ({ value, size = 60, strokeWidth = 5 }: any) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#27272a"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#10b981"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-white">
        {Math.round(value)}%
      </span>
    </div>
  );
};

export default React.memo(WatchStatistics);
