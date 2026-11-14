import { Hero } from "@/features/home/components/hero";
import { CategoryRail } from "@/features/home/components/category-rail";
import { FlashDeals } from "@/features/home/components/flash-deals";
import { ProductShowcase } from "@/features/home/components/product-showcase";
import { RecentlyViewed } from "@/features/catalog/components/recently-viewed";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryRail />
      <FlashDeals />
      <ProductShowcase />
      <RecentlyViewed />
    </>
  );
}
