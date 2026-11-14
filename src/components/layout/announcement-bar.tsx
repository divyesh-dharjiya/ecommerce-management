import { Truck } from "lucide-react";
import { commerceConfig } from "@/config/site";

/** One calm, static message — rotating banners are hard to read. */
export function AnnouncementBar() {
  return (
    <div className="bg-primary text-primary-foreground print:hidden" role="region" aria-label="Announcement">
      <p className="mx-auto flex h-9 max-w-7xl items-center justify-center gap-2 px-4 text-center text-xs font-medium sm:text-[13px]">
        <Truck className="size-4 shrink-0" aria-hidden />
        <span className="truncate">
          Free delivery on orders over ${commerceConfig.freeShippingThreshold}
          <span className="max-sm:hidden"> · 30-day free returns · New customers get 10% off with code WELCOME10</span>
        </span>
      </p>
    </div>
  );
}
