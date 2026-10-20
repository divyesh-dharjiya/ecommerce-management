"use client";

import { useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { cn } from "@/lib/utils";
import { ProductImage } from "@/components/ui";

/** Image gallery with thumbnail rail and hover-to-zoom on pointer devices. */
export function ProductGallery({
  images,
  title,
  photo = false,
}: {
  images: string[];
  title: string;
  /** Full-bleed studio photo (cover) rather than a cutout on a tint (contain). */
  photo?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const current = images[index] ?? images[0] ?? "";

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row md:items-start">
      {images.length > 1 && (
        <div
          className="flex gap-3 overflow-x-auto scrollbar-none md:flex-col"
          role="tablist"
          aria-label="Product images"
        >
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Image ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "relative size-20 shrink-0 overflow-hidden rounded-lg border-2 bg-muted transition",
                i === index ? "border-primary" : "border-transparent opacity-60 hover:opacity-100",
              )}
            >
              <ProductImage
                src={img}
                alt=""
                fill
                sizes="80px"
                className={photo ? "object-cover" : "object-contain p-1.5"}
              />
            </button>
          ))}
        </div>
      )}
      <div
        className="relative aspect-square w-full min-w-0 cursor-zoom-in overflow-hidden rounded-2xl bg-gradient-to-br from-muted to-muted/30 md:w-auto md:flex-1"
        onMouseMove={onMove}
        onMouseLeave={() => setZoom(null)}
      >
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={current}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <ProductImage
              src={current}
              alt={title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className={cn(
                photo ? "object-cover" : "object-contain p-8",
                "transition-transform duration-200 ease-out",
              )}
              style={zoom ? { transform: "scale(1.9)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
            />
          </m.div>
        </AnimatePresence>
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 md:hidden">
            {images.map((img, i) => (
              <span
                key={img}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-6 bg-foreground" : "w-1.5 bg-foreground/30",
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
