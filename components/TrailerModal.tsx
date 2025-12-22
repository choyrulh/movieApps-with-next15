"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactPlayer from "react-player";
import { TvMinimalPlay } from "lucide-react";

interface TrailerModalProps {
  videoKey: string;
}

const TrailerModal = ({ videoKey }: TrailerModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-green-800 hover:bg-green-700 rounded-lg text-white font-semibold flex items-center gap-2"
      >
        <TvMinimalPlay /> Trailer
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-transparent/70 z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="relative w-full max-w-4xl bg-black/70 rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 z-10 text-white hover:text-cyan-400 transition-colors"
              >
                ✕
              </button>
              <div className="aspect-video">
                <ReactPlayer
                  url={`https://www.youtube.com/watch?v=${videoKey}`}
                  width="100%"
                  height="100%"
                  controls
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TrailerModal;
