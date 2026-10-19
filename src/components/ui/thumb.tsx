import { cn } from "@/lib/utils";
import { ProductImage } from "@/components/ui/product-image";

const sizes = {
  xs: { box: "size-8 rounded-lg", px: 32 },
  sm: { box: "size-10 rounded-md", px: 40 },
  md: { box: "size-12 rounded-md", px: 48 },
  lg: { box: "size-16 rounded-lg", px: 64 },
  xl: { box: "size-20 rounded-lg", px: 80 },
} as const;

export interface ThumbProps {
  src: string;
  alt?: string;
  size?: keyof typeof sizes;
  className?: string;
  children?: React.ReactNode;
}

/** Square product thumbnail used in lists, tables, cart lines and feeds. */
export function Thumb({ src, alt = "", size = "md", className, children }: ThumbProps) {
  const s = sizes[size];
  return (
    <div className={cn("relative shrink-0 overflow-hidden bg-muted", s.box, className)}>
      <ProductImage src={src} alt={alt} fill sizes={`${s.px}px`} className="object-contain p-1" />
      {children}
    </div>
  );
}
