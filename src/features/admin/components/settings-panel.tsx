"use client";

import { useRef, useState } from "react";
import { Database, Download, Palette, RotateCcw, Upload, Zap } from "lucide-react";
import { toast } from "sonner";
import { STORAGE_PREFIX } from "@/config/site";
import { downloadFile, todayStamp } from "@/lib/download";
import { formatNumber } from "@/lib/format";
import { ThemeSwitcher } from "@/components/providers/theme";
import { ClientGate } from "@/components/providers/client-gate";
import { AdminPageHeader, Panel } from "@/features/admin/components/admin-page";
import { SecurityPanel } from "@/features/admin/auth/security-panel";
import { useCartStore } from "@/features/cart/store/cart-store";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { useOrderStore } from "@/features/orders/store/order-store";
import { usePreferencesStore } from "@/store/preferences-store";
import { Button, ConfirmDialog, Skeleton, Switch } from "@/components/ui";
import type { Category, Order, Product } from "@/types";

interface Backup {
  version: 1;
  exportedAt: string;
  products: Product[];
  categories: Category[];
  orders: Order[];
}

function storageUsage() {
  let bytes = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) bytes += (key.length + (localStorage.getItem(key)?.length ?? 0)) * 2;
    }
  } catch {
    /* ignore */
  }
  return bytes;
}

function Row({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-5 first:pt-0 last:pb-0">
      <div className="max-w-lg">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

export function SettingsPanel() {
  return (
    <ClientGate fallback={<Skeleton className="h-[500px]" />}>
      <SettingsView />
    </ClientGate>
  );
}

function SettingsView() {
  const prefs = usePreferencesStore();
  const products = useCatalogStore((s) => s.products);
  const categories = useCatalogStore((s) => s.categories);
  const orders = useOrderStore((s) => s.orders);
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const exportData = () => {
    const backup: Backup = { version: 1, exportedAt: new Date().toISOString(), products, categories, orders };
    downloadFile(`luxe-backup-${todayStamp()}.json`, JSON.stringify(backup, null, 2), "application/json");
    toast.success("Backup downloaded");
  };

  const importData = async (file: File) => {
    try {
      const data = JSON.parse(await file.text()) as Partial<Backup>;
      if (
        data.version !== 1 ||
        !Array.isArray(data.products) ||
        !Array.isArray(data.categories) ||
        !Array.isArray(data.orders)
      ) {
        throw new Error("Unrecognised backup format");
      }
      useCatalogStore.setState({ products: data.products, categories: data.categories });
      useOrderStore.setState({ orders: data.orders, seeded: true });
      toast.success("Backup restored", {
        description: `${data.products.length} products, ${data.orders.length} orders`,
      });
    } catch (e) {
      toast.error("Import failed", { description: e instanceof Error ? e.message : "Invalid file" });
    }
  };

  const resetAll = () => {
    useCatalogStore.getState().resetCatalog();
    useOrderStore.getState().reset();
    useOrderStore.getState().seedHistory();
    useCartStore.getState().clear();
    toast.success("Store reset to factory data");
  };

  return (
    <div className="max-w-3xl space-y-6">
      <AdminPageHeader
        title="Settings"
        description="Appearance, realtime simulation, admin access and data management."
      />

      <Panel
        title={
          <>
            <Palette className="size-4 text-accent" /> Appearance
          </>
        }
      >
        <Row title="Theme" description="Light, dark, or follow your operating system. Syncs across open tabs.">
          <ThemeSwitcher />
        </Row>
      </Panel>

      <Panel
        title={
          <>
            <Zap className="size-4 text-accent" /> Realtime
          </>
        }
      >
        <div className="divide-y divide-border">
          <Row
            title="Live shopper simulation"
            description="Generates realistic orders every few seconds, decrementing stock and updating analytics across all open tabs."
          >
            <Switch checked={prefs.liveSimulation} onChange={prefs.setLiveSimulation} label="Live shopper simulation" />
          </Row>
          <Row
            title="Storefront purchase notifications"
            description="Show “someone just bought…” social-proof toasts to shoppers."
          >
            <Switch
              checked={prefs.liveToasts}
              onChange={prefs.setLiveToasts}
              label="Storefront purchase notifications"
            />
          </Row>
        </div>
      </Panel>

      <SecurityPanel />

      <Panel
        title={
          <>
            <Database className="size-4 text-accent" /> Data
          </>
        }
      >
        <dl className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ["Products", formatNumber(products.length)],
            ["Categories", formatNumber(categories.length)],
            ["Orders", formatNumber(orders.length)],
            ["Storage used", `${(storageUsage() / 1024).toFixed(0)} KB`],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg bg-muted/60 p-4">
              <dt className="text-xs text-muted-foreground">{k}</dt>
              <dd className="mt-1 text-xl font-bold">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="divide-y divide-border">
          <Row title="Export backup" description="Download the full catalogue and order history as JSON.">
            <Button variant="outline" onClick={exportData}>
              <Download className="size-4" /> Export
            </Button>
          </Row>
          <Row title="Import backup" description="Restore a previously exported JSON backup. Replaces current data.">
            <>
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void importData(f);
                  e.target.value = "";
                }}
              />
              <Button variant="outline" onClick={() => fileRef.current?.click()}>
                <Upload className="size-4" /> Import
              </Button>
            </>
          </Row>
          <Row
            title="Reset store"
            description="Restore the original 250-product catalogue and regenerate order history."
          >
            <Button variant="danger" onClick={() => setConfirmReset(true)}>
              <RotateCcw className="size-4" /> Reset
            </Button>
          </Row>
        </div>
      </Panel>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset all store data?"
        description="All product edits, categories and orders will be replaced with the original demo data. This cannot be undone."
        confirmLabel="Reset store"
        onConfirm={resetAll}
      />
    </div>
  );
}
