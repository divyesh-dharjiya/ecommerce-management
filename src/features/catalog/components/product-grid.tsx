import { cn } from "@/lib/utils";
import { staggerDelay } from "@/lib/motion";
import { ProductCard, ProductCardSkeleton } from "@/features/catalog/components/product-card";
import type { Product } from "@/types";

const gridClasses = "grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4";

export interface ProductGridProps {
  products: Product[];
  layout?: "grid" | "list";
  className?: string;
  /** Number of leading images to load eagerly (above the fold). */
  priorityCount?: number;
}

/**
 * Product grid with a CSS staggered entrance. CSS rather than JS so the grid
 * is server-rendered and visible on first paint; newly mounted cards (after
 * filtering or paging) animate in automatically.
 */
export function ProductGrid({ products, layout = "grid", className, priorityCount = 4 }: ProductGridProps) {
  return (
    <ul className={cn(layout === "grid" ? gridClasses : "flex flex-col gap-4", className)} aria-label="Products">
      {products.map((p, i) => (
        <li key={p.id} className="flex animate-fade-up" style={staggerDelay(i)}>
          <ProductCard product={p} layout={layout} priority={i < priorityCount} className="w-full" />
        </li>
      ))}
    </ul>
  );
}

export function ProductGridSkeleton({ count = 8, className }: { count?: number; className?: string }) {
  return (
    <div className={cn(gridClasses, className)}>
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
