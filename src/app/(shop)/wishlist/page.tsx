import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { WishlistView } from "@/features/wishlist/components/wishlist-view";

// Personal, per-device page — kept out of search indexes.
export const metadata: Metadata = buildMetadata({ title: "Wishlist", path: "/wishlist", noIndex: true });

export default function WishlistPage() {
  return <WishlistView />;
}
