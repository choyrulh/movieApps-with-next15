import { DropdownGenre } from "@/components/DropdownGenre";
import CardFragments from "@/Fragments/CardFragments";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const Banner = dynamic(() => import("@/components/Banner"), {
  ssr: true,
});
export default function Home() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<div>loading...</div>}>
        <Banner />
      </Suspense>
      <main className="container mx-auto px-4 py-8">
        <DropdownGenre />
        <CardFragments />
      </main>
    </div>
  );
}
