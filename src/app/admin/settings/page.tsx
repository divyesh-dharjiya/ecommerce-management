import type { Metadata } from "next";
import { SettingsPanel } from "@/features/admin/components/settings-panel";

export const metadata: Metadata = { title: "Settings" };

export default function AdminSettingsPage() {
  return <SettingsPanel />;
}
