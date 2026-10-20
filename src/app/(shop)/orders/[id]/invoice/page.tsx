import type { Metadata } from "next";
import { Invoice } from "@/features/orders/components/invoice";

export const metadata: Metadata = { title: "Invoice", robots: { index: false, follow: false } };

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Invoice id={id} />;
}
