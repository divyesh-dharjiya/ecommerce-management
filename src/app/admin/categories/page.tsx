import type { Metadata } from "next";
import { CategoriesManager } from "@/features/admin/components/categories-manager";

export const metadata: Metadata = { title: "Categories" };

export default function AdminCategoriesPage() {
  return <CategoriesManager />;
}
