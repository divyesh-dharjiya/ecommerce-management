import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CartView } from "@/features/cart/components/cart-view";

// Personal, per-device page — kept out of search indexes.
export const metadata: Metadata = buildMetadata({ title: "Your cart", path: "/cart", noIndex: true });

export default function CartPage() {
  return <CartView />;
}
