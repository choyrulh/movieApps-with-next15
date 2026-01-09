"use client";

import { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";
import { ImageOff } from "lucide-react";

interface ImageWithFallbackProps extends ImageProps {
  fallbackText?: string;
  fallback?: React.ReactNode;
}

export const ImageWithFallback = ({
  src,
  alt,
  fallbackText = "Image not found",
  fallback,
  ...props
}: ImageWithFallbackProps) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  if (!src || error) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-zinc-800 text-zinc-500">
        <ImageOff size={24} />
        <span className="text-xs mt-2 text-center px-1 font-medium">
          {fallbackText}
        </span>
      </div>
    );
  }

  return (
    <Image src={src} alt={alt} onError={() => setError(true)} {...props} />
  );
};
