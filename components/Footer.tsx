// src/components/Footer.tsx
"use client";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Popcorn,
  Clapperboard,
  Film,
  Ticket,
  PlaySquare,
  Tv2,
  Github,
  Twitter,
  Instagram,
  Facebook,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Marquee from "./common/Marquee";
import { TitleText } from "./TitleText";

const Footer = () => {
  const [email, setEmail] = useState("");
  const platforms = [
    { name: "Netflix", icon: Popcorn, color: "text-red-500" },
    { name: "Prime Video", icon: Clapperboard, color: "text-blue-400" },
    { name: "Disney+", icon: Film, color: "text-blue-300" },
    { name: "HBO Max", icon: Ticket, color: "text-purple-400" },
    { name: "Hulu", icon: PlaySquare, color: "text-green-400" },
    { name: "Apple TV+", icon: Tv2, color: "text-gray-300" },
  ];

  const socials = [
    { icon: Github, href: "#", name: "github" },
    { icon: Twitter, href: "#", name: "twitter" },
    { icon: Instagram, href: "#", name: "instagram" },
    { icon: Facebook, href: "#", name: "facebook" },
  ];

  return (
    <footer className="relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute w-[500px] h-[500px] bg-purple-500/30 rounded-full -top-60 -left-60 blur-3xl animate-pulse" />
        <div className="absolute w-[400px] h-[400px] bg-blue-500/30 rounded-full -bottom-40 -right-40 blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Trending marquee */}
      <div>
        <Marquee speed={80} pauseOnHover className="py-3 backdrop-blur-md">
          <div className="flex items-center gap-8 px-4">
            <span className="text-sm text-white/80">Now Trending:</span>
            {[
              "Stranger Things S5",
              "Oppenheimer",
              "Barbie",
              "The Last of Us S2",
              "Avatar 3",
              "Dune: Part Two",
            ].map((title) => (
              <div key={title} className="flex items-center gap-4">
                <span className="text-white font-medium">{title}</span>
                <span className="text-white/40">✦</span>
              </div>
            ))}
          </div>
        </Marquee>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <Clapperboard className="w-8 h-8 text-purple-400" />
              <TitleText />
            </motion.div>
            <p className="text-sm text-gray-400">
              Your gateway to the cinematic universe. Explore, discover, and
              enjoy endless entertainment across all platforms.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold mb-4">Explore</h3>
            {[
              { name: "Movies", href: "/movies" },
              { name: "TV Shows", href: "/tv" },
              { name: "Trending", href: "/trending" },
              { name: "Genres", href: "/genres" },
              { name: "Upcoming", href: "/upcoming" },
            ].map((link) => (
              <motion.div
                key={link.name}
                whileHover={{ x: 5 }}
                className="group"
              >
                <Link
                  href={link.href}
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {link.name}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Platforms */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold mb-4">Platforms</h3>
            <div className="grid grid-cols-2 gap-3">
              {platforms.map((platform) => (
                <motion.div
                  key={platform.name}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <platform.icon className={`w-5 h-5 ${platform.color}`} />
                  <span className="text-gray-300 text-sm">{platform.name}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4 col-span-2">
            <h3 className="text-white font-semibold mb-4">Stay Updated</h3>
            <p className="text-gray-400 text-sm">
              Subscribe to get exclusive updates, recommendations, and special
              offers directly in your inbox.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-purple-400 text-white placeholder-gray-500"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all"
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-400 text-sm text-center">
            © {new Date().getFullYear()} SlashVerse. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            {[
              { name: "Privacy Policy", href: "/privacy" },
              { name: "Terms of Service", href: "/terms" },
              { name: "FAQ", href: "/faq" },
            ].map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {socials.map((social) => {
              const Icon = social.icon;
              return (
                <Link
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="sr-only">{social.name}</span>
                  <Icon className="w-5 h-5" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
