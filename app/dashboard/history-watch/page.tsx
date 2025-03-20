"use client";

import { useUserProfile } from "@/hook/useUserProfile";
import {
  Clock,
  Play,
  Tv,
  Film,
  History,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { formatIndonesianDate, getTimeAgo } from "@/lib/function/dateFormatter";
import { useState } from "react";
import {
  removeRecentlyWatched,
  clearAllRecentlyWatched,
} from "@/Service/actionUser";
import { toast } from "sonner";
import { Modal } from "@/components/common/Modal";
import { Metadata } from "@/app/Metadata";

const MovieHistoryCard = ({
  item,
  onDelete,
}: {
  item: any;
  onDelete: () => void;
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const progressColor =
    item.progressPercentage >= 90
      ? "bg-green-500"
      : item.progressPercentage >= 50
      ? "bg-yellow-500"
      : "bg-red-500";

  const handleDelete = async () => {
    // if (!confirm(`Hapus ${item.title} dari riwayat?`)) return;
    try {
      await removeRecentlyWatched(item._id);
      toast("Berhasil dihapus dari riwayat");
      onDelete();
    } catch (error) {
      if (error instanceof Error) {
        //check if error is an instance of Error
        toast(error.message);
      } else {
        toast("Terjadi kesalahan yang tidak diketahui"); //handle other cases
      }
    } finally {
      setShowDeleteModal(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-xl bg-gray-800 hover:bg-gray-750 transition-colors relative group"
    >
      {/* Delete Button */}
      <button
        onClick={() => setShowDeleteModal(true)}
        className="absolute top-2 right-2 p-1.5 hover:bg-gray-700 rounded-full transition-opacity opacity-0 group-hover:opacity-100 text-red-500 disabled:opacity-50"
        aria-label="Hapus riwayat"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      {/* Poster */}
      <div className="relative flex-shrink-0 w-full sm:w-32 lg:w-24">
        <img
          src={`https://image.tmdb.org/t/p/w200${item.poster}`}
          alt={item.title}
          className="w-full h-48 sm:h-36 object-cover rounded-lg"
        />
        <div className="absolute bottom-1 left-1 bg-black/80 px-2 py-1 rounded text-xs">
          {Math.floor(item.durationWatched / 3600).toFixed(0)}h{" "}
          {Math.floor((item.durationWatched % 3600) / 60)}m
        </div>
        {item.type === "tv" && (
          <div className="absolute top-1 right-1 bg-black/80 px-2 py-1 rounded text-xs">
            S{item.season} E{item.episode}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2 w-full">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold truncate">{item.title}</h3>
          <span className="text-xs text-gray-400 hidden sm:inline-block">
            {formatIndonesianDate(new Date(item.watchedDate))}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="h-2 bg-gray-700 rounded-full">
            <motion.div
              className={`h-full rounded-full ${progressColor} transition-all duration-300`}
              // style={{ width: `${item.progressPercentage}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${item.progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between text-xs">
            <span>{item.progressPercentage}% Selesai</span>
            <span>
              {Math.floor(item.totalDuration / 3600).toFixed(0)}h{" "}
              {(item.totalDuration % 60).toFixed(0)}m total
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

        {/* Mobile Date and Time Ago */}
        <div className="sm:hidden flex flex-col gap-1 text-sm text-gray-400">
          <span>{formatIndonesianDate(new Date(item.watchedDate))}</span>
          <div className="flex items-center gap-1">
            <History className="w-4 h-4" />
            <span>Ditonton {getTimeAgo(new Date(item.watchedDate))}</span>
          </div>
        </div>

        {/* Desktop Time Ago */}
        <div className="hidden sm:flex items-center gap-1 text-sm text-gray-400">
          <History className="w-4 h-4" />
          <span>Ditonton {getTimeAgo(new Date(item.watchedDate))}</span>
        </div>
      </div>
      {/* Modal konfirmasi */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Hapus dari Riwayat"
        message={`Apakah Anda yakin ingin menghapus "${item.title}" dari riwayat tontonan?`}
      />
    </motion.div>
  );
};

export default function Page() {
  const {
    data: historyData,
    isLoading,
    error,
    refetch,
  } = useUserProfile({
    queryType: "history",
  });
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  const handleClearAllConfirm = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus semua riwayat?")) return;
    try {
      await clearAllRecentlyWatched();
      toast("Semua riwayat berhasil dihapus");
      refetch();
    } catch (error) {
      if (error instanceof Error) {
        //check if error is an instance of Error
        toast(error.message);
      } else {
        toast("Terjadi kesalahan yang tidak diketahui"); //handle other cases
      }
    } finally {
      setShowClearAllModal(false);
    }
  };

  return (
    <>
      <Metadata
        seoTitle="Histori Tontonan - Dashboard"
        seoDescription="Histori tontonan yang pernah kamu tonton"
        seoKeywords="History, histori, tontonan"
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/85">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Riwayat Nonton</h1>
              <p className="text-gray-400">
                Film dan series yang pernah kamu tonton
              </p>
            </div>
          </div>

          {historyData?.history?.length > 0 && (
            <button
              onClick={() => setShowClearAllModal(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              Hapus Semua
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-500 flex flex-col items-center gap-4">
            <AlertTriangle className="w-12 h-12" />
            <p>Gagal memuat riwayat nonton</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : historyData?.history?.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {historyData.history.map((item: any) => (
              <MovieHistoryCard key={item._id} item={item} onDelete={refetch} />
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
        <Modal
          isOpen={showClearAllModal}
          onClose={() => setShowClearAllModal(false)}
          onConfirm={handleClearAllConfirm}
          title="Hapus Semua Riwayat"
          message="Apakah Anda yakin ingin menghapus semua riwayat tontonan? Tindakan ini tidak dapat dibatalkan."
        />
      </div>
    </>
  );
}
