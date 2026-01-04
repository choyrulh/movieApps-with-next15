"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";

interface Props {
  params: string;
  children?: React.ReactNode;
  typeData: string;
  season?: string;
  episode?: string;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

function GoWatchButton({ 
  params, 
  children, 
  typeData, 
  season, 
  episode,
  variant = "primary",
  size = "md"
}: Props) {
  const router = useRouter();

  const handleClick = () => {
    if (typeData === "movie") {
      router.push(`/movie/${params}/watch`);
    } else if (typeData === "tv") {
      router.push(`/tv/${params}/watch`);
    }
  };

  // Size variants
  const sizeClasses = {
    sm: "px-4 py-2 text-sm gap-2",
    md: "px-6 py-3 text-base gap-2",
    lg: "px-8 py-4 text-lg gap-3"
  };

  // Style variants
  const variantClasses = {
    primary: "bg-white text-black hover:bg-white/90 font-bold shadow-xl",
    secondary: "bg-white/20 text-white hover:bg-white/30 font-semibold backdrop-blur-md border border-white/30"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={`
        flex items-center justify-center rounded-lg
        transition-all duration-300 
        ${sizeClasses[size]}
        ${variantClasses[variant]}
      `}
    >
      <Play size={size === "sm" ? 16 : size === "md" ? 18 : 20} fill="currentColor" />
      {children || "Tonton Sekarang"}
    </motion.button>
  );
}

export default GoWatchButton;