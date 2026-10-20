import type { Metadata } from "next";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { AdminGate } from "@/features/admin/auth/admin-gate";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · Luxe Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGate>
      <AdminShell>{children}</AdminShell>
    </AdminGate>
  );
}
