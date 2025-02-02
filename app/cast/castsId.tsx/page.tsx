'use client'

import { useState, use } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { getCastsDetailMovie, getDetailCasts } from "@/Service/fetchMovie";
import { Loader } from "@/components/common/Loader";

type Props = {
  params: Promise<{ id: string }>;
};

type CastMember = {
  id: number;
  name: string;
  character: string;
  profile_path?: string;
  order: number;
};

export default function MovieCastPage({ params }: Props) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState("cast");
  const [visibleCast, setVisibleCast] = useState(12);

  const { data: movie, isLoading: isMovieLoading } = useQuery({
    queryKey: ["movie", id],
    queryFn: () => getDetailCasts(id as unknown as string),
  });

  const {
    data: credits,
    isLoading: isCastLoading,
    isError: isCastError,
  } = useQuery({
    queryKey: ["movie-credits", id],
    queryFn: () => getCastsDetailMovie(id as unknown as string),
    enabled: activeTab === "cast",
  });

  if (isMovieLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Backdrop Art */}
      <div className="relative h-96">
        {movie?.backdrop_path && (
          <Image
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={movie.title}
            fill
            className="object-cover opacity-20"
            priority
          />
        )}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 -mt-48 relative z-10">
        {/* Tabbed Interface */}
        <div className="glass-panel-xl">
          {/* Tab Headers */}
          <div className="relative mb-8">
            <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
              {["Cast", "Production", "Financials"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`relative px-6 py-2 text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.toLowerCase()
                      ? "text-cyan-400"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  {tab}
                  {activeTab === tab.toLowerCase() && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-400 animate-underline" />
                  )}
                </button>
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
          </div>

          {/* Cast Tab Content */}
          {activeTab === "cast" && (
            <div className="space-y-8">
              {/* Cast Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {isCastLoading
                  ? [...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="group relative aspect-[2/3] animate-pulse"
                      >
                        <div className="absolute inset-0 bg-slate-800 rounded-2xl" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent rounded-2xl" />
                      </div>
                    ))
                  : credits?.cast
                      ?.slice(0, visibleCast)
                      .map((member: CastMember) => (
                        <div
                          key={member.id}
                          className="group relative aspect-[2/3] transition-transform duration-300 hover:-translate-y-2"
                        >
                          {/* Image Container */}
                          <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl">
                            {member.profile_path ? (
                              <Image
                                src={`https://image.tmdb.org/t/p/w500${member.profile_path}`}
                                alt={member.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 768px) 50vw, 33vw"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                                <span className="text-2xl font-bold text-white uppercase">
                                  {member.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent" />
                          </div>

                          {/* Text Overlay */}
                          <div className="absolute inset-0 p-4 flex flex-col justify-end space-y-1">
                            <h3 className="text-white font-semibold truncate drop-shadow-lg">
                              {member.name}
                            </h3>
                            <p className="text-sm text-cyan-300 truncate font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                              {member.character}
                            </p>
                            <div className="absolute right-3 top-3 flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/20 backdrop-blur-sm text-cyan-400 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                              {member.order + 1}
                            </div>
                          </div>

                          {/* Hover Border */}
                          <div className="absolute inset-0 rounded-2xl border-2 border-transparent transition-all duration-300 group-hover:border-cyan-400/30" />
                        </div>
                      ))}
              </div>

              {/* Load More Button */}
              {credits?.cast?.length > visibleCast && (
                <div className="flex justify-center">
                  <button
                    onClick={() => setVisibleCast((prev) => prev + 12)}
                    className="glow-button px-8 py-3 rounded-full font-semibold text-white flex items-center gap-2 group"
                  >
                    <span>Show More Cast</span>
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </button>
                </div>
              )}

              {/* Error State */}
              {isCastError && (
                <div className="text-center py-12 text-red-400/80">
                  Failed to load cast information
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
