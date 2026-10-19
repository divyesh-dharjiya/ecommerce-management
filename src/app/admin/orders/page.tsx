import type { Metadata } from "next";
import { OrdersTable } from "@/features/admin/components/orders-table";

export const metadata: Metadata = { title: "Orders" };

export default function AdminOrdersPage() {
  return <OrdersTable />;
}
