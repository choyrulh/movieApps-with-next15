import { getPopularMovie } from "@/Service/fetchMovie";
import HomeClient from "./HomeClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Slashverse Movies",
  description: "Slashverse Movies is a free movie streaming website.",
};

export default async function Home() {
  // Fetch data directly in Server Component
  const popularMovies = await getPopularMovie(1, {});

  return (
    <>
      <HomeClient initialPopularMovies={popularMovies} />
    </>
  );
}
