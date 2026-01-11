"use client";

import React from "react";
import { Heart, Coffee, ExternalLink, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SupportPage = () => {
  return (
    <div className="min-h-screen w-full bg-black text-white relative flex flex-col items-center justify-center p-4 pt-24 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-green-900/20 via-black to-black pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl w-full animate-in fade-in zoom-in duration-700 slide-in-from-bottom-5">
        <div className="glass-panel p-8 md:p-12 text-center space-y-10 border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="space-y-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-transparent flex items-center justify-center border border-green-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative group">
              <div className="absolute inset-0 rounded-full bg-green-400/20 blur-lg group-hover:blur-xl transition-all duration-500" />
              <Heart className="w-10 h-10 text-green-400 fill-green-400/20 relative z-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-green-100 to-green-400 tracking-tight">
                Support Development
              </h1>
              <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
                Your support helps us keep the servers running, add new
                features, and deliver the best movie experience.
              </p>
            </div>
          </div>

          {/* Donation Options */}
          <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
            {/* Saweria Card */}
            <div className="relative group rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-1 rounded-xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 group-hover:border-yellow-500/30 transition-all duration-300">
                <div className="bg-[#111] rounded-lg p-6 flex flex-col items-center gap-6 relative overflow-hidden">
                  {/* Decorative glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                  <div className="text-center space-y-2 relative z-10">
                    <div className="flex items-center justify-center gap-2 text-yellow-100 font-semibold text-lg mb-1">
                      <Coffee className="w-5 h-5 text-yellow-400" />
                      <span>Saweria</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Support local creators easily via QRIS, GoPay, OVO, etc.
                    </p>
                  </div>

                  <a
                    href="https://saweria.co/choyrulh" // Placeholder URL
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <button className="w-full relative overflow-hidden group/btn bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-orange-500/20 flex items-center justify-center gap-2">
                      <span className="relative z-10">Donate via Saweria</span>
                      <ExternalLink className="w-4 h-4 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                      {/* Shine effect */}
                      <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover/btn:animate-shine" />
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-6 border-t border-white/5">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Zap className="w-4 h-4 text-green-500" />
              <span>Fast, Secure, and Directly supports the developer.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
