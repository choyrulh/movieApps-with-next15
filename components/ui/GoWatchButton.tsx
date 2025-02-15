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
      whileHover={{
        scale: 1.1,
        boxShadow: "0px 0px 20px rgba(0, 255, 255, 0.5)",
      }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="flex items-center gap-2 px-4 py-2 rounded-full text-white transition-all duration-300 
        bg-gradient-to-r from-blue-500 to-cyan-400 shadow-md shadow-blue-500/40 
        hover:shadow-lg hover:shadow-cyan-400/60 backdrop-blur-lg"
    >
      {children}
    </motion.button>
  );
}

export default GoWatchButton;
