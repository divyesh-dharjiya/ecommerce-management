import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CheckoutView } from "@/features/checkout/components/checkout-view";

// Personal, per-device page — kept out of search indexes.
export const metadata: Metadata = buildMetadata({ title: "Checkout", path: "/checkout", noIndex: true });

export default function CheckoutPage() {
  return <CheckoutView />;
}
