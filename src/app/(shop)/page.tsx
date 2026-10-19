import { Hero } from "@/features/home/components/hero";
import { CategoryRail } from "@/features/home/components/category-rail";
import { FlashDeals } from "@/features/home/components/flash-deals";
import { ProductShowcase } from "@/features/home/components/product-showcase";
import { PromoBento } from "@/features/home/components/promo-bento";
import { BrandMarquee } from "@/features/home/components/brand-marquee";
import { LiveFeed } from "@/features/live/components/live-feed";
import { ValueProps } from "@/features/home/components/value-props";
import { RecentlyViewed } from "@/features/catalog/components/recently-viewed";

export default function HomePage() {
  return (
    <>
      <Hero />
      <BrandMarquee />
      <CategoryRail />
      <ProductShowcase />
      <FlashDeals />
      <PromoBento />
      <LiveFeed />
      <RecentlyViewed />
      <ValueProps />
    </>
  );
}
