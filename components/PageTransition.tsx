"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";

// Opsi 1: Transisi Fade dengan Blur
const fadeBlurVariants = {
  initial: {
    opacity: 0,
    filter: "blur(8px)",
  },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    }
  },
  exit: {
    opacity: 0,
    filter: "blur(8px)",
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    }
  }
};

// Opsi 2: Transisi Slide Up dengan Spring
const slideUpVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 1,
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 0.5,
    }
  }
};

// Opsi 3: Transisi Flip 3D
const flipVariants = {
  initial: {
    opacity: 0,
    rotateX: 10,
    perspective: 1000,
    y: 10,
  },
  animate: {
    opacity: 1,
    rotateX: 0,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    }
  },
  exit: {
    opacity: 0,
    rotateX: -10,
    y: -10,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    }
  }
};

// Opsi 4: Transisi Zoom dengan Fade
const zoomFadeVariants = {
  initial: {
    opacity: 0,
    scale: 1.05,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.33, 1, 0.68, 1],
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: [0.33, 1, 0.68, 1],
    }
  }
};

// Opsi 5: Transisi Slide dari Sisi dengan Overlay
const slideFromSideVariants = {
  initial: {
    opacity: 0,
    x: 30,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.1, 0.25, 1],
    }
  },
  exit: {
    opacity: 0,
    x: -30,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    }
  }
};

// Opsi Baru 1: Transisi Gentle Fade Slide (Paling Ringan)
const gentleFadeSlide = {
  initial: { 
    opacity: 0, 
    y: 12 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.28, 
      ease: [0.25, 0.25, 0.5, 1] 
    }
  },
  exit: { 
    opacity: 0, 
    y: -12,
    transition: { 
      duration: 0.24, 
      ease: [0.25, 0.25, 0.5, 1] 
    }
  }
};

// Opsi Baru 2: Transisi Soft Scale (Sangat Halus)
const softScaleVariants = {
  initial: { 
    opacity: 0, 
    scale: 0.995 
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.3, 
      ease: "easeOut" 
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.995,
    transition: { 
      duration: 0.25, 
      ease: "easeIn" 
    }
  }
};

// Opsi Baru 3: Transisi Fluid Move (Gerakan Cair)
const fluidMoveVariants = {
  initial: { 
    opacity: 0, 
    x: '-2%',
    filter: 'brightness(0.98)'
  },
  animate: { 
    opacity: 1, 
    x: '0%',
    filter: 'brightness(1)',
    transition: { 
      duration: 0.32, 
      ease: [0.33, 1, 0.68, 1] 
    }
  },
  exit: { 
    opacity: 0, 
    x: '2%',
    filter: 'brightness(0.98)',
    transition: { 
      duration: 0.28, 
      ease: [0.33, 1, 0.68, 1] 
    }
  }
};


export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // Anda dapat mengubah variasi yang digunakan dengan mengganti variabel di bawah ini
  // Pilihan: fadeBlurVariants, slideUpVariants, flipVariants, zoomFadeVariants, slideFromSideVariants
  const activeVariants = fluidMoveVariants;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={activeVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="min-h-screen w-full will-change-transform"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Anda juga dapat membuat versi yang bisa berganti-ganti secara acak:
// export function RandomPageTransition({ children }: { children: ReactNode }) {
//   const pathname = usePathname();
//   const [transitionIndex] = useState(() => Math.floor(Math.random() * 5));
  
//   const allVariants = [
//     fadeBlurVariants,
//     slideUpVariants,
//     flipVariants,
//     zoomFadeVariants,
//     slideFromSideVariants
//   ];
  
//   const activeVariants = allVariants[transitionIndex];

//   return (
//     <AnimatePresence mode="wait" initial={false}>
//       <motion.div
//         key={pathname}
//         variants={activeVariants}
//         initial="initial"
//         animate="animate"
//         exit="exit"
//         className="min-h-screen w-full"
//       >
//         {children}
//       </motion.div>
//     </AnimatePresence>
//   );
// }