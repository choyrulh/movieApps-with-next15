"use client";

import { getDetailShow } from "@/Service/fetchMovie";
import { useStore } from "@/store/useStore";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

function page() {
  const pathname = usePathname();
  const id = pathname.split("/")[2];
  const { historyData } = useStore(
    useShallow((state) => ({
      historyData: state.historyData,
    }))
  );
  const [season, setSeason] = useState("1");
  const [episode, setEpisode] = useState("1");
  const [mediaDataHistory, setMediaDataHistory] = useState<any>();

  const { data, isLoading, isError } = useQuery<any>({
    queryKey: ["showDetail", id],
    queryFn: () => getDetailShow(id as unknown as number, {}),

    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });

  useEffect(() => {
    window.addEventListener("message", (event) => {
      if (event.origin !== "https://vidlink.pro") return;

      if (event.data?.type === "MEDIA_DATA") {
        const mediaData = event.data.data;
        localStorage.setItem("vidLinkProgress", JSON.stringify(mediaData));
      }
    });
  }, []);

  const totalSeasons = data?.number_of_seasons || 0;
  const selectedSeasonData = data?.seasons?.find(
    (s: any) => s.season_number === parseInt(season)
  );
  const totalEpisodes = selectedSeasonData?.episode_count || 0;

  // Construct the video URL directly
  const videoUrl = `https://vidlink.pro/tv/${id}/${season}/${episode}`;
  // const videoUrl = `https://vidlink.pro/tv/${id}/1/1`;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="max-w-7xl mx-auto px-4 pt-28 space-y-4">
        {/* Season and Episode Controls */}
        <div className="flex flex-col gap-4">
          {data && (
            <>
              {totalSeasons > 1 && (
                <select
                  value={season}
                  onChange={(e) => {
                    setSeason(e.target.value);
                    setEpisode("1");
                  }}
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg w-fit transition-all hover:bg-gray-700"
                >
                  {Array.from({ length: totalSeasons }, (_, i) => (
                    <option key={i + 1} value={(i + 1).toString()}>
                      Season {i + 1}
                    </option>
                  ))}
                </select>
              )}

              <div className="flex flex-wrap gap-2">
                {Array.from({ length: totalEpisodes }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setEpisode((i + 1).toString())}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      episode === (i + 1).toString()
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-800 hover:bg-gray-700"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Video Player */}
        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden shadow-xl">
          <iframe
            key={`${season}-${episode}`} // Add key prop to force re-render
            src={videoUrl}
            frameBorder="0"
            allowFullScreen
            width="100%"
            height="100%"
            className="animate-fade-in"
          />
        </div>
      </main>
    </div>
  );
}

export default page;
