"use client";

import { useQuery } from "@tanstack/react-query";
import { getDetailMovie } from "@/Service/fetchMovie";
import { Genre, Movie, Video } from "@/types/movie.";
import { Suspense, use } from "react";
import { Loader } from "@/components/common/Loader";
import Head from "next/head";
import Image from "next/image";
import { Rating } from "@/components/common/Rating";
import TrailerModal from "@/components/TrailerModal";

export function page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const {
    data: movie,
    isLoading,
    isError,
  } = useQuery<Movie>({
    queryKey: ["movie", id],
    queryFn: () =>
      getDetailMovie(id as unknown as number, {
        append_to_response: "videos",
      }),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });

  const trailer = movie?.videos?.results.find(
    (video: Video) => video.site === "YouTube" && video.type === "Trailer"
  );
  console.log("trailer:", trailer);

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
          <div className="text-white text-xl">Failed to load movie data</div>
        </div>
      </>
    );
  }

  if (!movie) {
    return (
      <>
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="text-white text-xl">Movie not found</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{`${movie.title} - SlashMovie`}</title>
        <meta name="description" content={movie.overview} />
      </Head>

      <div className="min-h-screen bg-slate-900">
        <main>
          {/* Backdrop Image */}
          <div className="relative h-[31rem] md:h-[35rem] lg:h-[45rem]">
            {movie.backdrop_path && (
              <Image
                src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                alt={movie.title}
                fill
                priority
                className="object-fill opacity-30"
              />
            )}
          </div>

          {/* Movie Content */}
          <div className="container mx-auto px-4 lg:-mt-[26rem] sm:-mt-[14rem] md:-mt-[16rem] relative z-10">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Poster */}
              <div className="w-auto">
                <div className="relative lg:h-[30rem] sm:h-[18rem] md:[22rem] lg:w-[20rem] sm:w-[12rem] md:w-[16rem] rounded-xl overflow-hidden shadow-xl">
                  {movie.poster_path && (
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                      fill
                      priority
                      className="object-cover"
                    />
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="w-full md:w-2/3 text-white">
                <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>

                <div className="flex items-center gap-4 mb-6">
                  <Rating value={movie.vote_average} />
                  <span className="text-slate-400">
                    {new Date(movie.release_date).toLocaleDateString()}
                  </span>
                  {movie.runtime && (
                    <span className="text-slate-400">{movie.runtime} mins</span>
                  )}
                </div>

                {movie.genres && (
                  <div className="flex flex-wrap gap-4 mb-6">
                    {movie.genres.map((genre: Genre) => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 bg-cyan-500 rounded-full text-sm"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-lg text-slate-300 mb-8">{movie.overview}</p>

                {trailer && <TrailerModal videoKey={trailer.key} />}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default page;
