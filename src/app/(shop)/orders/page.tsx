import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { OrderHistory } from "@/features/orders/components/order-history";

// Personal, per-device page — kept out of search indexes.
export const metadata: Metadata = buildMetadata({ title: "Your orders", path: "/orders", noIndex: true });

export default function OrdersPage() {
  return <OrderHistory />;
}
