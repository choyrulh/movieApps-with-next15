"use client";
import { CSSProperties, ReactNode, useCallback, useState } from "react";

const Marquee = ({
  children,
  speed = 50,
  pauseOnHover = true,
  direction = "left",
  className = "",
}: {
  children: ReactNode;
  speed?: number; // Pixels per second
  pauseOnHover?: boolean;
  direction?: "left" | "right";
  className?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const duration = () => {
    const baseWidth = 100; // Base width percentage (100% for full width)
    return `${baseWidth / (speed / 100)}s`; // Convert speed to animation duration
  };

  const animationStyle: CSSProperties = {
    animation: `marquee-${direction} ${duration()} linear infinite`,
    animationPlayState: isHovered && pauseOnHover ? "paused" : "running",
  };

  return (
    <div
      className={`overflow-hidden whitespace-nowrap ${className}`}
      onMouseEnter={useCallback(() => pauseOnHover && setIsHovered(true), [pauseOnHover])}
      onMouseLeave={useCallback(() => pauseOnHover && setIsHovered(false), [pauseOnHover])}
      role="marquee"
      aria-live="polite"
    >
      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0%); }
        }
      `}</style>
      
      <div className="inline-block whitespace-nowrap" style={animationStyle}>
        {children}
      </div>
      <div className="inline-block whitespace-nowrap" style={animationStyle} aria-hidden>
        {children}
      </div>
    </div>
  );
};

export default Marquee;