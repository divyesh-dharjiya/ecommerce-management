"use client";

import { useMemo, useState } from "react";
import { DollarSign, Receipt, ShoppingCart, Users } from "lucide-react";
import { commerceConfig } from "@/config/site";
import { useNow } from "@/hooks";
import { formatNumber, formatPrice } from "@/lib/format";
import { useUiStore } from "@/store/ui-store";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { useOrderStore } from "@/features/orders/store/order-store";
import {
  getCategoryBreakdown,
  getDailySeries,
  getInventoryValue,
  getKpis,
  getLiveSeries,
  getLowStock,
  getTopProducts,
} from "@/features/admin/services/analytics";
import { ClientGate } from "@/components/providers/client-gate";
import { SegmentedControl, Skeleton } from "@/components/ui";
import { AdminPageHeader } from "@/features/admin/components/admin-page";
import { StatCard } from "@/features/admin/components/dashboard/stat-card";
import {
  CategorySalesPanel,
  LiveSalesPanel,
  LowStockPanel,
  RecentOrdersPanel,
  RevenuePanel,
  TopProductsPanel,
} from "@/features/admin/components/dashboard/widgets";

const RANGES = [
  { value: "7", label: "7d" },
  { value: "30", label: "30d" },
  { value: "60", label: "60d" },
] as const;

const fmtPrice = (n: number) => formatPrice(n);
const fmtInt = (n: number) => formatNumber(Math.round(n));

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-36" />
        ))}
      </div>
      <Skeleton className="h-80" />
    </div>
  );
}

export function Dashboard() {
  return (
    <ClientGate fallback={<DashboardSkeleton />}>
      <DashboardView />
    </ClientGate>
  );
}

/** Composes analytics (pure services) into dashboard widgets. */
function DashboardView() {
  const orders = useOrderStore((s) => s.orders);
  const products = useCatalogStore((s) => s.products);
  const events = useUiStore((s) => s.liveEvents);
  const [range, setRange] = useState<(typeof RANGES)[number]["value"]>("30");
  const days = Number(range);
  const now = useNow(10_000); // slides the live window even when no order arrives

  const inRange = useMemo(
    () => orders.filter((o) => Date.parse(o.createdAt) >= now - days * 86_400_000),
    [orders, days, now],
  );
  const kpis = useMemo(() => getKpis(orders, days, now), [orders, days, now]);
  const daily = useMemo(() => getDailySeries(orders, days, now), [orders, days, now]);
  const live = useMemo(() => getLiveSeries(orders, 20, now), [orders, now]);
  const categories = useMemo(() => getCategoryBreakdown(inRange, 7), [inRange]);
  const top = useMemo(() => getTopProducts(inRange, 5), [inRange]);
  const lowStock = useMemo(() => getLowStock(products, commerceConfig.lowStockThreshold), [products]);
  const inventoryValue = useMemo(() => getInventoryValue(products), [products]);

  const stats = [
    { label: "Revenue", kpi: kpis.revenue, format: fmtPrice, icon: DollarSign },
    { label: "Orders", kpi: kpis.orders, format: fmtInt, icon: ShoppingCart },
    { label: "Avg. order value", kpi: kpis.averageOrderValue, format: fmtPrice, icon: Receipt },
    { label: "Customers", kpi: kpis.customers, format: fmtInt, icon: Users },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        description={`${formatNumber(products.length)} products · inventory value ${formatPrice(inventoryValue)}`}
        actions={
          <SegmentedControl label="Date range" variant="solid" value={range} onChange={setRange} options={RANGES} />
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <StatCard
            key={s.label}
            index={i}
            label={s.label}
            value={s.kpi.value}
            change={s.kpi.change}
            format={s.format}
            icon={s.icon}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <RevenuePanel data={daily} total={kpis.revenue.value} days={days} />
        <LiveSalesPanel data={live} events={events} now={now} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <CategorySalesPanel data={categories} />
        <TopProductsPanel data={top} />
        <LowStockPanel products={lowStock} />
      </div>

      <RecentOrdersPanel orders={orders} now={now} />
    </div>
  );
}
