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
 *  - shows a graceful fallback when the image fails
 *
 * Images are visible as soon as the browser has them. They are deliberately
 * NOT hidden until an `onLoad` handler fires: that handler only exists after
 * hydration, so server-rendered images would stay blank until JavaScript
 * boots. The tile behind each image is the placeholder.
 */
export function ProductImage({ src, alt, className, ...props }: ImageProps & { src: string }) {
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
    <Image
      src={src}
      alt={alt}
      unoptimized={!isOptimizable(src)}
      onError={() => setFailed(true)}
      className={className}
      {...props}
    />
  );
}
