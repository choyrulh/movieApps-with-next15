// app/dashboard/page.tsx
"use client";

import { motion } from "framer-motion";
import { Clock, Heart, Film, Star, Popcorn, Clapperboard, Play, List, Trophy, History } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "../Metadata";

export default function DashboardIntro() {
  return (
    <>
      <Metadata
        seoTitle="Dashboard"
        seoDescription="Halaman Dashboard"
        seoKeywords="statistik, histori, tontonan"
      />

      <div className="h-[75vh] flex justify-center items-center space-y-8 px-4 py-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          <div className="inline-block bg-green-500 p-2 rounded-full">
            <Clapperboard className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
            Selamat Datang di SlashVerse!
          </h1>
          
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Temukan dunia film dan serial terbaik yang siap menemani hari-harimu.
            Mulai petualangan menontonmu sekarang!
          </p>
        </motion.div>

      </div>

    </>
  );
}