import { motion } from "framer-motion";

const MovieCardSkeleton = () => {
  return (
    <motion.div
      className="group relative bg-slate-800 rounded-xl overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="relative aspect-[2/3] bg-slate-700 animate-pulse" />

      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
        <div className="h-5 bg-slate-600 rounded w-3/4 animate-pulse" />
        <div className="flex items-center justify-between">
          <div className="h-4 bg-slate-600 rounded w-12 animate-pulse" />
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-4 w-4 bg-slate-600 rounded-full animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCardSkeleton;
