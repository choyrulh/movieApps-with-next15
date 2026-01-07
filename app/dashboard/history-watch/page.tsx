"use client";

import {
  Clock,
  Play,
  Tv,
  Film,
  History,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { formatIndonesianDate, getTimeAgo } from "@/lib/function/dateFormatter";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  removeRecentlyWatched,
  clearAllRecentlyWatched,
} from "@/Service/actionUser";
import { toast } from "sonner";
import { Modal } from "@/components/common/Modal";
import { Metadata } from "@/app/Metadata";
import { getHistoryWatchUser } from "@/Service/fetchUser";

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
      className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-xl bg-[#111111] hover:bg-[#111111]/80 transition-colors relative group"
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

const HistorySkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <Skeleton key={i} className="h-32 w-full rounded-xl bg-[#111111]" />
    ))}
  </div>
);

export default function Page() {
  const queryClient = useQueryClient();
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  // --- INFINITE QUERY ---
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["history-dashboard"],
    queryFn: ({ pageParam = 1 }) => getHistoryWatchUser(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasMore ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
  });

  // --- NATIVE INTERSECTION OBSERVER LOGIC ---
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isFetchingNextPage) return; // Jangan observe jika sedang loading
      if (observer.current) observer.current.disconnect(); // Putus observer lama

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage(); // Panggil page selanjutnya saat elemen terlihat
        }
      });

      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  const allHistory = data?.pages.flatMap((page) => page.history) || [];

  return (
    <>
      <Metadata
        seoTitle="Riwayat Nonton"
        seoDescription="Histori tontonan Anda"
      />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500/20">
              <Clock className="text-green-500" />
            </div>
            <h1 className="text-2xl font-bold">Riwayat Nonton</h1>
          </div>
          {allHistory.length > 0 && (
            <button
              onClick={() => setShowClearAllModal(true)}
              className="text-red-500 text-sm hover:underline"
            >
              Hapus Semua
            </button>
          )}
        </div>

        {isLoading ? (
          <HistorySkeleton />
        ) : allHistory.length > 0 ? (
          <div className="space-y-4">
            {allHistory.map((item: any, index: number) => {
              // Jika ini adalah elemen terakhir, pasang ref observer
              const isLast = index === allHistory.length - 1;
              return (
                <div key={item._id} ref={isLast ? lastElementRef : null}>
                  {/* Gunakan komponen MovieHistoryCard Anda yang sudah ada di page.tsx */}
                  <MovieHistoryCard
                    item={item}
                    onDelete={() =>
                      queryClient.invalidateQueries({
                        queryKey: ["history-dashboard"],
                      })
                    }
                  />
                </div>
              );
            })}

            {/* Loading indicator saat fetch page baru */}
            {isFetchingNextPage && (
              <div className="py-4 flex justify-center">
                <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            Belum ada riwayat
          </div>
        )}
      </div>

      <Modal
        isOpen={showClearAllModal}
        onClose={() => setShowClearAllModal(false)}
        onConfirm={async () => {
          await clearAllRecentlyWatched();
          refetch();
          setShowClearAllModal(false);
        }}
        title="Hapus Semua"
        message="Yakin ingin menghapus semua riwayat?"
      />
    </>
  );
}
