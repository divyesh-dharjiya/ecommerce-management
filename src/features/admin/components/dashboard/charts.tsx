"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { formatCompact, formatPrice } from "@/lib/format";
import { useThemeColors } from "@/hooks/use-theme-colors";
import type { SeriesPoint } from "@/features/admin/services/analytics";

const axisBase = { fontSize: 11, tickLine: false, axisLine: false } as const;

function ChartTooltip({ active, payload, label }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload?.length) return null;
  const point = payload[0]!.payload as SeriesPoint;
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-lift">
      <p className="mb-1 font-semibold">{label}</p>
      <p className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-primary" />
        <span className="text-muted-foreground">Revenue</span>
        <span className="ml-auto font-semibold tabular-nums">{formatPrice(point.revenue)}</span>
      </p>
      <p className="mt-0.5 flex items-center gap-2">
        <span className="size-2" />
        <span className="text-muted-foreground">Orders</span>
        <span className="ml-auto font-semibold tabular-nums">{point.orders}</span>
      </p>
    </div>
  );
}

/** Single-series revenue trend. One measure, one axis — orders live in the tooltip. */
export function RevenueAreaChart({ data }: { data: SeriesPoint[] }) {
  const c = useThemeColors();
  const axisProps = { ...axisBase, stroke: c["muted-foreground"], tick: { fill: c["muted-foreground"] } };
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c.primary} stopOpacity={0.28} />
            <stop offset="100%" stopColor={c.primary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={c.border} strokeDasharray="3 3" />
        <XAxis dataKey="label" {...axisProps} minTickGap={24} />
        <YAxis {...axisProps} tickFormatter={(v: number) => `$${formatCompact(v)}`} width={56} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: c["muted-foreground"], strokeDasharray: "4 4" }} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke={c.primary}
          strokeWidth={2}
          fill="url(#revFill)"
          activeDot={{ r: 5, strokeWidth: 2, stroke: c.card }}
          animationDuration={700}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Per-minute live revenue. Bars keep a 2px gap and rounded data-ends. */
export function LiveBarChart({ data }: { data: SeriesPoint[] }) {
  const c = useThemeColors();
  const axisProps = { ...axisBase, stroke: c["muted-foreground"], tick: { fill: c["muted-foreground"] } };
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -16, bottom: 0 }} barCategoryGap={2}>
        <CartesianGrid vertical={false} stroke={c.border} strokeDasharray="3 3" />
        <XAxis dataKey="label" {...axisProps} minTickGap={28} />
        <YAxis {...axisProps} tickFormatter={(v: number) => `$${formatCompact(v)}`} width={48} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: c.muted }} />
        <Bar dataKey="revenue" fill={c.primary} radius={[4, 4, 0, 0]} isAnimationActive animationDuration={400} />
      </BarChart>
    </ResponsiveContainer>
  );
}
