"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getCastsDetailShow,
  getDetailShow,
  getTrailerTV,
  getTVEpisodes,
  getTVImages, // Tambahkan import untuk fetch episodes
} from "@/Service/fetchMovie";
import { Genre, Movie, Video } from "@/types/movie.";
import { memo, Suspense, use, useMemo, useState } from "react";
import { Loader } from "@/components/common/Loader";
import Head from "next/head";
import Image from "next/image";
import { Rating } from "@/components/common/Rating";
import TrailerModal from "@/components/TrailerModal";
import {
  CalendarIcon,
  ForwardIcon,
  Heart,
  Play,
  ChevronRight,
  Clock,
  Star,
  Users,
  ImageIcon,
} from "lucide-react";
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
  const [selectedSeason, setSelectedSeason] = useState(1); // State untuk season yang dipilih
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

  // Tambahkan query untuk episodes
  const {
    data: episodes,
    isLoading: isLoadingEpisodes,
    isError: isEpisodesError,
  } = useQuery({
    queryKey: ["episodes", id, selectedSeason],
    queryFn: () => getTVEpisodes(id as unknown as string, selectedSeason),
    enabled: activeTab === "episodes", // Only fetch when episodes tab is active
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });

  const {
    data: images,
    isLoading: isLoadingImages,
    isError: isImagesError,
  } = useQuery({
    queryKey: ["images", id],
    queryFn: () => getTVImages(id as unknown as string),
    enabled: activeTab === "gallery", // Hanya fetch saat tab gallery aktif
    staleTime: 5 * 60 * 1000,
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

  // Fungsi untuk membuat array seasons
  const seasonsArray = useMemo(() => {
    if (!show?.number_of_seasons) return [];
    return Array.from({ length: show.number_of_seasons }, (_, i) => i + 1);
  }, [show?.number_of_seasons]);

  if (isLoading) {
    return (
      <>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Loader />
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-xl">Failed to load show data</div>
        </div>
      </>
    );
  }

  if (!show) {
    return (
      <>
        <div className="min-h-screen bg-black flex items-center justify-center">
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
            isActive ? "text-green-400" : "text-slate-400 hover:text-slate-300"
          }`}
        >
          {tab}
          {isActive && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-green-400 animate-underline" />
          )}
        </button>
      );
    }
  );

  function Tabs() {
    // Tambahkan "Episodes" ke daftar tabs
    const tabs = useMemo(
      () => [
        "Details",
        "Financials",
        "Production",
        "Languages",
        "Status",
        "Cast",
        "Episodes", // Tab baru untuk episodes
        "Gallery",
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
                        className="px-3 py-1 bg-green-500 rounded-full text-sm"
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
                    <AddToWatchListButton
                      item={{
                        ...show,
                        title: show.title ?? "",
                        media_type: "tv",
                      }}
                    />
                  </div>
                  <GoWatchButton params={id} typeData={"tv"} variant="secondary"
  size="sm">
                      {/*<Play /> */}
                      Play
                    </GoWatchButton> 
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
                {/* ... kode untuk tab lainnya tetap sama ... */}
                {activeTab === "details" && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                          <CalendarIcon className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-sm text-green-300 mb-1">
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
                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                          <CalendarIcon className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-sm text-green-300 mb-1">
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
                          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                            <CalendarIcon className="w-6 h-6 text-green-400" />
                          </div>
                          <div>
                            <h3 className="text-sm text-green-300 mb-1">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="gradient-card group">
                      <div className="flex items-center justify-between">
                        <BanknotesIcon className="w-8 h-8 text-green-400" />
                        <div className="text-right">
                          <p className="text-sm text-green-300 mb-1">Budget</p>
                          <p className="text-2xl font-bold text-white">
                            {show.budget
                              ? `$${show.budget.toLocaleString()}`
                              : "-"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all duration-1000"
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                          <p className="text-sm text-green-400">{lang.name}</p>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="gradient-card p-6">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                            <CalendarIcon className="w-6 h-6 text-green-400" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm text-green-300 mb-1">
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
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                                  <div className="w-full h-full bg-gradient-to-br from-green-500 to-purple-600 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-white uppercase">
                                      {member.name
                                        .split(" ")
                                        .map((n: string) => n[0])
                                        .join("")}
                                    </span>
                                  </div>
                                )}
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                              </div>

                              {/* Text Content */}
                              <div className="absolute inset-0 p-4 flex flex-col justify-end space-y-1">
                                <h3 className="text-white font-semibold truncate drop-shadow-lg">
                                  {member.name}
                                </h3>
                                <p className="text-sm text-green-300 truncate font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                  {member.character}
                                </p>
                                <div className="absolute right-3 top-3 flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 backdrop-blur-sm text-green-400 text-sm font-bold transition-opacity opacity-0 group-hover:opacity-100">
                                  {member.order + 1}
                                </div>
                              </div>

                              {/* View Detail Button */}
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Link
                                  href={`/person/${member.id}`}
                                  className="px-4 py-2 bg-green-500/90 text-white rounded-lg hover:bg-green-600 backdrop-blur-sm transition-colors duration-300 shadow-lg transform hover:scale-105"
                                >
                                  View Details
                                </Link>
                              </div>

                              {/* Hover Border Effect */}
                              <div className="absolute inset-0 rounded-2xl border-2 border-transparent transition-all duration-300 group-hover:border-green-400/30 pointer-events-none" />
                            </div>
                          ))}
                        {casts?.cast?.length > visibleCasts && (
                          <div className="flex justify-center mt-8">
                            <button
                              onClick={() =>
                                setVisibleCasts((prev) => prev + 6)
                              }
                              className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-[#333333] rounded-full font-semibold text-white 
      transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/30
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

                {/* Tab Episodes */}
                {activeTab === "episodes" && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Season Selector - Horizontal Scrollable */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-400" />
                        Select Season
                      </h3>
                      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
                        {seasonsArray.map((seasonNum) => (
                          <button
                            key={seasonNum}
                            onClick={() => setSelectedSeason(seasonNum)}
                            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex-shrink-0 ${
                              selectedSeason === seasonNum
                                ? "bg-green-500 text-white shadow-lg shadow-green-500/25 scale-105"
                                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                            }`}
                          >
                            Season {seasonNum}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Episodes Grid/List */}
                    {isLoadingEpisodes ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="bg-slate-black/50 rounded-xl p-4 h-40 animate-pulse flex gap-4"
                          >
                            <div className="w-64 bg-black rounded-lg h-full"></div>
                            <div className="flex-1 space-y-3 py-2">
                              <div className="h-4 bg-black w-1/3 rounded"></div>
                              <div className="h-3 bg-black w-full rounded"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : isEpisodesError ? (
                      <div className="text-center p-10 bg-red-500/10 rounded-xl text-red-400 border border-red-500/20">
                        Failed to load episodes. Please try again later.
                      </div>
                    ) : episodes?.episodes?.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 bg-slate-800/30 rounded-xl">
                        No episodes available for this season yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {episodes?.episodes?.map((episode: any) => (
                          <div
                            key={episode.id}
                            className="group relative bg-transparent hover:bg-transparent/80 border border-white/5 hover:border-green-500/30 rounded-xl overflow-hidden transition-all duration-300 p-3 sm:p-4 flex flex-col sm:flex-row gap-5"
                          >
                            {/* Thumbnail Area */}
                            <div className="relative w-full sm:w-[280px] h-[160px] sm:h-[158px] flex-shrink-0 rounded-lg overflow-hidden bg-slate-900">
                              {episode.still_path ? (
                                <Image
                                  src={`https://image.tmdb.org/t/p/w500${episode.still_path}`}
                                  alt={episode.name}
                                  fill
                                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                  <Image
                                    src="/placeholder-movie.png"
                                    alt="No Preview"
                                    width={50}
                                    height={50}
                                    className="opacity-20"
                                  />
                                </div>
                              )}

                              {/* Overlay Play Icon */}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-green-500/90 flex items-center justify-center pl-1 transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-75">
                                  <Play className="w-6 h-6 text-white fill-current" />
                                </div>
                              </div>

                              {/* Episode Number Badge */}
                              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded border border-white/10">
                                S{selectedSeason} E{episode.episode_number}
                              </div>
                            </div>

                            {/* Info Area */}
                            <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-start gap-4 mb-2">
                                  <h4 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors line-clamp-1">
                                    {episode.name}
                                  </h4>
                                  {episode.vote_average > 0 && (
                                    <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded text-yellow-400 text-xs font-medium border border-yellow-500/20">
                                      <Star className="w-3 h-3 fill-current" />
                                      {episode.vote_average.toFixed(1)}
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400 mb-3">
                                  <span className="flex items-center border border-white/10 gap-1.5 bg-transparent/50 px-2 py-1 rounded">
                                    <CalendarIcon className="w-3.5 h-3.5" />
                                    {episode.air_date
                                      ? new Date(
                                          episode.air_date
                                        ).toLocaleDateString(undefined, {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                        })
                                      : "TBA"}
                                  </span>
                                  {episode.runtime && (
                                    <span className="flex items-center border border-white/10 gap-1.5 bg-transparent/50 px-2 py-1 rounded">
                                      <Clock className="w-3.5 h-3.5" />
                                      {episode.runtime}m
                                    </span>
                                  )}
                                </div>

                                <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed mb-3">
                                  {episode.overview ||
                                    "No overview available for this episode."}
                                </p>
                              </div>

                              {/* Footer Action */}
                              <div className="flex items-center justify-between mt-auto border-t border-white/5 pt-3">
                                <div className="flex -space-x-2">
                                  {/* Guest Stars Avatars (Optional visual flair) */}
                                  {episode.guest_stars?.slice(0, 3).map(
                                    (star: any) =>
                                      star.profile_path && (
                                        <div
                                          key={star.id}
                                          className="w-6 h-6 rounded-full border border-slate-800 relative overflow-hidden bg-transparent"
                                          title={star.name}
                                        >
                                          <Image
                                            src={`https://image.tmdb.org/t/p/w200${star.profile_path}`}
                                            alt={star.name}
                                            fill
                                            className="object-cover"
                                          />
                                        </div>
                                      )
                                  )}
                                  {episode.guest_stars?.length > 3 && (
                                    <div className="w-6 h-6 rounded-full bg-transparent border border-slate-800 flex items-center justify-center text-[8px] text-white">
                                      +{episode.guest_stars.length - 3}
                                    </div>
                                  )}
                                </div>
                                <button className="text-xs font-medium text-green-400 hover:text-green-300 flex items-center gap-1 group/btn">
                                  Read More{" "}
                                  <ChevronRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-1" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* --- TAB GALLERY --- */}
                {activeTab === "gallery" && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {isLoadingImages ? (
                      // Skeleton Loading Gallery
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className="aspect-video bg-transparent rounded-xl animate-pulse"
                          />
                        ))}
                      </div>
                    ) : isImagesError ? (
                      <div className="text-center py-10 text-red-400 bg-red-500/10 rounded-xl border border-red-500/20">
                        Failed to load gallery images.
                      </div>
                    ) : (
                      <>
                        {/* Section: Backdrops */}
                        {images?.backdrops?.length > 0 && (
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                              <ImageIcon className="w-5 h-5 text-green-400" />
                              Backdrops
                              {/* <span className="text-xs font-normal text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
                                {images.backdrops.length} Images
                              </span> */}
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {images.backdrops
                                .slice(0, 9)
                                .map((img: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="group relative aspect-video bg-transparent rounded-xl overflow-hidden border border-white/5 cursor-zoom-in"
                                  >
                                    <Image
                                      src={`https://image.tmdb.org/t/p/w780${img.file_path}`}
                                      alt="Backdrop"
                                      fill
                                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Section: Posters */}
                        {images?.posters?.length > 0 && (
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                              <ImageIcon className="w-5 h-5 text-purple-400" />
                              Posters & Artwork
                              {/* <span className="text-xs font-normal text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
                                {images.posters.length} Images
                              </span> */}
                            </h3>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                              {images.posters
                                .slice(0, 12)
                                .map((img: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="group relative aspect-[2/3] bg-slate-800 rounded-xl overflow-hidden border border-white/5 shadow-lg"
                                  >
                                    <Image
                                      src={`https://image.tmdb.org/t/p/w500${img.file_path}`}
                                      alt="Poster"
                                      fill
                                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                                    />
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Empty State */}
                        {images?.backdrops?.length === 0 &&
                          images?.posters?.length === 0 && (
                            <div className="text-center py-20 text-slate-500">
                              <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                              <p>No images available for this show.</p>
                            </div>
                          )}
                      </>
                    )}
                  </div>
                )}

                {/* ... kode untuk tab lainnya tetap sama ... */}
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
