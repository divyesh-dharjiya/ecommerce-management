"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIMIZED_HOSTS = new Set(["cdn.dummyjson.com"]);

const isOptimizable = (src: string) => {
  try {
    return OPTIMIZED_HOSTS.has(new URL(src).hostname);
  } catch {
    return false;
  }
};

/**
 * next/image wrapper that:
 *  - optimises whitelisted hosts and falls back to `unoptimized` for admin-supplied URLs
 *  - fades in on load with a shimmer placeholder
 *  - shows a graceful fallback when the image fails
 */
export function ProductImage({
  src,
  alt,
  className,
  shimmer = true,
  ...props
}: ImageProps & { src: string; shimmer?: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    // Decorative images (empty alt) simply disappear instead of showing a placeholder.
    if (alt === "") return null;
    return (
      <div className={cn("grid size-full place-items-center bg-muted text-muted-foreground", className)}>
        <ImageOff className="size-6" aria-hidden />
        <span className="sr-only">{alt}</span>
      </div>
    );
  }

  return (
    <>
      {shimmer && !loaded && <div className="skeleton absolute inset-0" aria-hidden />}
      <Image
        src={src}
        alt={alt}
        unoptimized={!isOptimizable(src)}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={cn("transition-opacity duration-500", loaded ? "opacity-100" : "opacity-0", className)}
        {...props}
      />
    </>
  );
}
