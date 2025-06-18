"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getCastsDetailShow,
  getDetailShow,
  getTrailerTV,
} from "@/Service/fetchMovie";
import { Genre, Movie, Video } from "@/types/movie.";
import { memo, Suspense, use, useMemo, useState } from "react";
import { Loader } from "@/components/common/Loader";
import Head from "next/head";
import Image from "next/image";
import { Rating } from "@/components/common/Rating";
import TrailerModal from "@/components/TrailerModal";
import { CalendarIcon, ForwardIcon, Heart, Play } from "lucide-react";
import {
  BanknotesIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/solid";
import { AddToWatchListButton } from "@/components/AddWatchListButton";
import GoWatchButton from "@/components/ui/GoWatchButton";
import useIsMobile from "@/hook/useIsMobile";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { AddFavoriteButton } from "@/components/AddFavoriteButton";
import { Metadata } from "@/app/Metadata";

const DynamicRecommendation = dynamic(
  () => import("@/Fragments/Recommendation"),
  {
    ssr: false,
  }
);

function DetailShow({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState("details");
  const [visibleCasts, setVisibleCasts] = useState(12);
  const isMobile = useIsMobile();
  const { isAuthenticated } = useAuth();

  const {
    data: show,
    isLoading,
    isError,
  } = useQuery<Movie>({
    queryKey: ["show", id],
    queryFn: () =>
      getDetailShow(id as unknown as number, {
        append_to_response: "videos",
      }),

    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });

  const {
    data: casts,
    isLoading: isCastLoading,
    isError: isCastError,
  } = useQuery({
    queryKey: ["casts", id],
    queryFn: () => getCastsDetailShow(id as unknown as string),
    enabled: activeTab === "cast", // Only fetch when cast tab is active
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });

  const { data: trailers, isLoading: isLoadingTrailer } = useQuery({
    queryKey: ["trailer tv", id],
    queryFn: () => getTrailerTV(id as unknown as string),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });

  const trailer = trailers?.results?.find(
    (video: Video) => video.site === "YouTube" && video.type === "Trailer"
  );

  if (isLoading) {
    return (
      <>
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <Loader />
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="text-white text-xl">Failed to load show data</div>
        </div>
      </>
    );
  }

  if (!show) {
    return (
      <>
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="text-white text-xl">series not found</div>
        </div>
      </>
    );
  }

  const TabButton = memo(
    ({
      tab,
      activeTab,
      onClick,
    }: {
      tab: string;
      activeTab: string;
      onClick: (tab: string) => void;
    }) => {
      const isActive = activeTab === tab.toLowerCase();

      return (
        <button
          onClick={() => onClick(tab.toLowerCase())}
          className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 ${
            isActive ? "text-cyan-400" : "text-slate-400 hover:text-slate-300"
          }`}
        >
          {tab}
          {isActive && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-400 animate-underline" />
          )}
        </button>
      );
    }
  );

  function Tabs() {
    // Gunakan useMemo agar daftar tab tidak dihitung ulang di setiap render
    const tabs = useMemo(
      () => [
        "Details",
        "Financials",
        "Production",
        "Languages",
        "Status",
        "Cast",
      ],
      []
    );

    return (
      <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <TabButton
            key={tab}
            tab={tab}
            activeTab={activeTab}
            onClick={setActiveTab}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <Metadata
        seoTitle={show.name ?? null}
        seoDescription={show.overview}
        seoKeywords={show.genres?.map((genre) => genre.name).join(", ")}
      />

      <div className="min-h-screen pb-[5rem]">
        <main>
          {/* Backdrop Image */}
          <div className="relative h-[100vh]">
            {show.backdrop_path && (
              <Image
                src={`https://image.tmdb.org/t/p/original${
                  isMobile ? show.poster_path : show.backdrop_path
                }`}
                alt={show.title ?? show.name ?? ""}
                fill
                priority
                className="object-cover opacity-30"
              />
            )}
          </div>

          {/* Movie Content */}
          <div className="container mx-auto px-4 lg:-mt-[34rem] sm:-mt-[22rem] md:-mt-[24rem] relative z-10">
            <div className="flex flex-col md:flex-row gap-8 -mt-[34rem] sm:-mt-unset">
              {/* Poster */}
              <div className="w-auto self-center sm:self-auto">
                <div className="relative h-[18rem] lg:h-[30rem] sm:h-[18rem] md:[22rem] lg:w-[20rem] w-[12rem] sm:w-[12rem] md:w-[16rem] rounded-xl overflow-hidden shadow-xl">
                  {show.poster_path && (
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                      alt={show.title ?? show.name ?? ""}
                      fill
                      priority
                      className="object-cover"
                    />
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="w-full md:w-2/3 text-white">
                <h1 className="text-4xl font-bold mb-4 inline-flex items-center gap-2">
                  {show.name}
                  {isAuthenticated && (
                    <AddFavoriteButton
                      item={{
                        ...show,
                        title: show.name ?? "",
                        media_type: "tv",
                        itemId: show.id,
                        type: "tv",
                      }}
                    />
                  )}
                </h1>

                <div className="flex items-center gap-4 mb-6">
                  <Rating value={show.vote_average} />
                  <span className="text-slate-400">
                    {show?.first_air_date
                      ? new Date(show.first_air_date).toLocaleDateString()
                      : "N/A"}
                  </span>
                  {show.runtime ||
                    (show.episode_run_time && (
                      <span className="text-slate-400">
                        {show.runtime || show.episode_run_time} mins
                      </span>
                    ))}
                  {/* add if statement for adult and add the logo */}
                  {show.adult && <span className="text-red-500">18+</span>}
                </div>

                {show.genres && (
                  <div className="flex flex-wrap gap-4 mb-6">
                    {show.genres.map((genre: Genre) => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 bg-cyan-500 rounded-full text-sm"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-lg text-slate-300 mb-8">{show.overview}</p>
                <div className="flex gap-5">
                  {trailer && <TrailerModal videoKey={trailer.key} />}
                  <div className="flex gap-3">
                    {/* <button className="w-10 h-10 flex items-center justify-center bg-gray-700 rounded-full hover:bg-gray-600 transition">
                      <Heart className="text-white w-7 h-7" />
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center bg-gray-700 rounded-full hover:bg-gray-600 transition">
                      <ForwardIcon className="text-white w-7 h-7" />
                    </button> */}
                    <AddToWatchListButton
                      item={{
                        ...show,
                        title: show.title ?? "",
                        media_type: "tv",
                      }}
                    />
                    <GoWatchButton params={id} typeData={"tv"}>
                      <Play /> Play
                    </GoWatchButton>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 bg-slate-800/10 shadow-lg backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              {/* Tab Headers with Animated Underline */}
              <div className="relative mb-8">
                <Tabs />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
              </div>

              {/* Tab Content Container */}
              <div className="transition-all duration-300 ease-&lsqb;cubic-bezier(0.4,0,0.2,1)&rsqb;">
                {activeTab === "details" && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* Seasons */}
                    <div className="gradient-card p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <span className="text-purple-400 font-bold">S</span>
                        </div>
                        <div>
                          <h3 className="text-sm text-purple-300 mb-1">
                            Seasons
                          </h3>
                          <p className="text-xl font-semibold text-white">
                            {show.number_of_seasons}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Episodes */}
                    <div className="gradient-card p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                          <span className="text-green-400 font-bold">E</span>
                        </div>
                        <div>
                          <h3 className="text-sm text-green-300 mb-1">
                            Episodes
                          </h3>
                          <p className="text-xl font-semibold text-white">
                            {show.number_of_episodes}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* First Air */}
                    <div className="gradient-card p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                          <CalendarIcon className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="text-sm text-cyan-300 mb-1">
                            First Air
                          </h3>
                          <p className="text-white">
                            {show?.first_air_date
                              ? new Date(
                                  show.first_air_date
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Last Air */}
                    <div className="gradient-card p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                          <CalendarIcon className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="text-sm text-cyan-300 mb-1">
                            Last Air
                          </h3>
                          <p className="text-white">
                            {show?.first_air_date
                              ? new Date(
                                  show.first_air_date
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Next Episode */}
                    {show.next_episode_to_air && (
                      <div className="gradient-card p-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                            <CalendarIcon className="w-6 h-6 text-cyan-400" />
                          </div>
                          <div>
                            <h3 className="text-sm text-cyan-300 mb-1">
                              Next Episode
                            </h3>
                            <p className="text-white">
                              {new Date(
                                show.next_episode_to_air.air_date
                              ).toLocaleDateString()}
                              <br />
                              Episode {show.next_episode_to_air.episode_number}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Financials Tab */}
                {activeTab === "financials" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="gradient-card group">
                      <div className="flex items-center justify-between">
                        <BanknotesIcon className="w-8 h-8 text-cyan-400" />
                        <div className="text-right">
                          <p className="text-sm text-cyan-300 mb-1">Budget</p>
                          <p className="text-2xl font-bold text-white">
                            {show.budget
                              ? `$${show.budget.toLocaleString()}`
                              : "-"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 transition-all duration-1000"
                          style={{
                            width: `${Math.min(
                              ((show?.budget ?? 0) /
                                (show?.revenue ?? (show?.budget ?? 0) * 2)) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="gradient-card group">
                      <div className="flex items-center justify-between">
                        <CurrencyDollarIcon className="w-8 h-8 text-emerald-400" />
                        <div className="text-right">
                          <p className="text-sm text-emerald-300 mb-1">
                            Revenue
                          </p>
                          <p className="text-2xl font-bold text-white">
                            {show.revenue
                              ? `$${show.revenue.toLocaleString()}`
                              : "-"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-1000"
                          style={{
                            width: `${Math.min(
                              ((show?.revenue ?? 0) /
                                ((show?.budget ?? 0) * 4 ||
                                  (show?.revenue ?? 0) * 2)) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Production Tab */}
                {activeTab === "production" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Production Companies */}
                    {show.production_companies?.map((company: any) => (
                      <div
                        key={company.id}
                        className="gradient-card hover:transform hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="flex flex-col items-center text-center p-4">
                          {company.logo_path ? (
                            <div className="relative h-16 w-full mb-4">
                              <Image
                                src={`https://image.tmdb.org/t/p/w500${company.logo_path}`}
                                alt={company.name}
                                fill
                                className="object-contain"
                              />
                            </div>
                          ) : (
                            <BuildingOfficeIcon className="w-12 h-12 text-slate-400 mb-4" />
                          )}
                          <span className="text-white font-medium text-sm">
                            {company.name}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Networks */}
                    {Array.isArray(show.networks) &&
                      show.networks.map((network: any) => (
                        <div
                          key={network.id}
                          className="gradient-card hover:transform hover:-translate-y-1 transition-all duration-300"
                        >
                          <div className="flex flex-col items-center text-center p-4">
                            {network.logo_path ? (
                              <div className="relative h-16 w-full mb-4">
                                <Image
                                  src={`https://image.tmdb.org/t/p/w500${network.logo_path}`}
                                  alt={network.name}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                            ) : (
                              <GlobeAltIcon className="w-12 h-12 text-slate-400 mb-4" />
                            )}
                            <span className="text-white font-medium text-sm">
                              {network.name}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {/* Languages Tab */}
                {activeTab === "languages" && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {show.spoken_languages?.map((lang) => (
                      <div
                        key={lang.iso_639_1}
                        className="gradient-card p-4 text-center group hover:bg-white/5"
                      >
                        <div className="mb-2 text-4xl">
                          {String.fromCodePoint(
                            0x1f1e6 +
                              (lang.iso_639_1.toUpperCase().charCodeAt(0) -
                                "A".charCodeAt(0)),
                            0x1f1e6 +
                              (lang.iso_639_1.toUpperCase().charCodeAt(1) -
                                "A".charCodeAt(0))
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-cyan-400">{lang.name}</p>
                          <p className="text-xs text-slate-300 font-mono">
                            {lang.iso_639_1.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Status Tab */}
                {activeTab === "status" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="gradient-card p-6">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                            <CalendarIcon className="w-6 h-6 text-cyan-400" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm text-cyan-300 mb-1">
                            Release Status
                          </h3>
                          <p className="text-xl font-semibold text-white">
                            {show.status}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="gradient-card p-6">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <GlobeAltIcon className="w-6 h-6 text-purple-400" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm text-purple-300 mb-1">
                            Original Language
                          </h3>
                          <p className="text-xl font-semibold text-white">
                            {new Intl.DisplayNames(["en"], {
                              type: "language",
                            }).of(show.original_language)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Cast Tab */}
                {activeTab === "cast" && (
                  <div className="space-y-6">
                    {isCastLoading ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className="group relative aspect-[2/3] animate-pulse"
                          >
                            <div className="absolute inset-0 bg-slate-800 rounded-2xl" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent rounded-2xl" />
                          </div>
                        ))}
                      </div>
                    ) : isCastError ? (
                      <div className="gradient-card text-center p-6 text-red-400">
                        Failed to load cast information
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {casts?.cast
                          ?.slice(0, visibleCasts)
                          .map((member: any) => (
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
                                        .map((n: string) => n[0])
                                        .join("")}
                                    </span>
                                  </div>
                                )}
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent" />
                              </div>

                              {/* Text Content */}
                              <div className="absolute inset-0 p-4 flex flex-col justify-end space-y-1">
                                <h3 className="text-white font-semibold truncate drop-shadow-lg">
                                  {member.name}
                                </h3>
                                <p className="text-sm text-cyan-300 truncate font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                  {member.character}
                                </p>
                                <div className="absolute right-3 top-3 flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/20 backdrop-blur-sm text-cyan-400 text-sm font-bold transition-opacity opacity-0 group-hover:opacity-100">
                                  {member.order + 1}
                                </div>
                              </div>

                              {/* View Detail Button */}
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Link
                                  href={`/person/${member.id}`}
                                  className="px-4 py-2 bg-cyan-500/90 text-white rounded-lg hover:bg-cyan-600 backdrop-blur-sm transition-colors duration-300 shadow-lg transform hover:scale-105"
                                >
                                  View Details
                                </Link>
                              </div>

                              {/* Hover Border Effect */}
                              <div className="absolute inset-0 rounded-2xl border-2 border-transparent transition-all duration-300 group-hover:border-cyan-400/30 pointer-events-none" />
                            </div>
                          ))}
                        {casts?.cast?.length > visibleCasts && (
                          <div className="flex justify-center mt-8">
                            <button
                              onClick={() =>
                                setVisibleCasts((prev) => prev + 6)
                              }
                              className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full font-semibold text-white 
      transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30
      flex items-center justify-center gap-2 group text-sm sm:text-base"
                            >
                              <span>Load More</span>
                              <svg
                                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
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
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Suspense fallback={<p>Loading...</p>}>
            <DynamicRecommendation id={id} type={"tv"} />
          </Suspense>
        </main>
      </div>
    </>
  );
}

export default DetailShow;
