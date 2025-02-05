import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "@/store/useStore";

const HistoryTontonan = () => {
  const { setHistoryData } = useStore(
    useShallow((state) => ({
      setHistoryData: state.setHistoryData,
    }))
  );
  const [mediaDataHistory, setMediaDataHistory] = useState<any[]>([]);

  useEffect(() => {
    // Ambil data dari localStorage dan konversi ke array
    const localData = localStorage.getItem("vidLinkProgress");
    if (localData) {
      const parsedData = JSON.parse(localData);
      setMediaDataHistory(Object.values(parsedData));
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://vidlink.pro") return;

      if (event.data?.type === "MEDIA_DATA") {
        const mediaData = event.data.data;
        const dataArray = Object.values(mediaData);

        // Simpan sebagai objek ke localStorage
        localStorage.setItem("vidLinkProgress", JSON.stringify(mediaData));
        // Update state dengan array
        setMediaDataHistory(dataArray);
        setHistoryData(event.data);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (!mediaDataHistory || mediaDataHistory.length === 0) return null;
  console.log("mediaDataHistory: ", mediaDataHistory);

  // Calculate progress percentage
  const calculateProgress = (media: any) => {
    if (!media.progress) return 0;
    if (typeof media.progress === "number") return media.progress;

    const { watched, duration } = media.progress;
    if (!watched || !duration) return 0;

    return Math.round((watched / duration) * 100);
  };

  return (
    <div className="px-4 py-6">
      <h2 className="text-xl font-bold mb-4 text-gray-200">History Tontonan</h2>
      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
        {mediaDataHistory?.map((media, index) => {
          const progressPercentage = calculateProgress(media);
          return (
            <Link
              href={`/${media.type}/${media.id}/watch`}
              key={index}
              className="flex-shrink-0 w-48 bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="relative h-32 rounded-t-lg overflow-hidden">
                <Image
                  src={`https://image.tmdb.org/t/p/original${media.backdrop_path}`}
                  alt={media.title}
                  layout="fill"
                  objectFit="cover"
                  className="hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <span className="text-white text-sm font-medium block truncate">
                    {media.title}
                  </span>
                  <span className="text-gray-200 text-xs">
                    Eps {media.last_episode_watched}
                  </span>
                </div>
              </div>
              <div className="p-2">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 rounded-full h-1.5 transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Tonton {progressPercentage}%
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryTontonan;
