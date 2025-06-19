"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface Props {
  params: string;
  children: React.ReactNode;
  typeData: string;
  season?: string;
  episode?: string;
}

function GoWatchButton({ params, children, typeData, season, episode }: Props) {
  const router = useRouter();

  const handleClick = () => {
    if (typeData === "movie") {
      router.push(`/movie/${params}/watch`);
    } else if (typeData === "tv") {
      router.push(`/tv/${params}/watch`);
    }
  };

  return (
     <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="flex items-center gap-2 px-4 py-2 rounded-full text-white transition-all duration-300 
        bg-gradient-to-r from-green-500 to-[#333333] shadow-md shadow-green-500/40 
        hover:shadow-lg hover:shadow-green-500/60 backdrop-blur-lg"
    >
      {children}
    </motion.button>
  );
}

export default GoWatchButton;
