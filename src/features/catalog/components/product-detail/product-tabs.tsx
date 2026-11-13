"use client";

import Link from "next/link";
import { formatNumber } from "@/lib/format";
import { Tabs } from "@/components/ui";
import { Reviews } from "@/features/reviews/components/reviews";
import type { Category, Product } from "@/types";

export function productSpecs(product: Product, category?: Category): [string, string][] {
  const d = product.dimensions;
  return [
    ["Brand", product.brand],
    ["SKU", product.sku],
    ["Category", category?.name ?? product.category],
    ["Weight", product.weight ? `${product.weight} kg` : "—"],
    ["Dimensions", d ? `${d.width} × ${d.height} × ${d.depth} cm` : "—"],
    ["Shipping", product.shipping ?? "—"],
    ["Warranty", product.warranty ?? "—"],
    ["Returns", product.returnPolicy ?? "—"],
  ];
}

export function ProductTabs({ product, category }: { product: Product; category?: Category }) {
  return (
    <Tabs
      label="Product information"
      className="mt-16"
      items={[
        {
          id: "details",
          label: "Details",
          content: (
            <div className="max-w-3xl space-y-4 leading-relaxed text-muted-foreground">
              <p>{product.description}</p>
              {product.tags.length > 0 && (
                <ul className="flex flex-wrap gap-2 pt-2" aria-label="Tags">
                  {product.tags.map((t) => (
                    <li key={t}>
                      <Link
                        href={`/products?q=${encodeURIComponent(t)}`}
                        className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize text-foreground transition hover:bg-accent/10 hover:text-accent"
                      >
                        #{t}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ),
        },
        {
          id: "specs",
          label: "Specifications",
          content: (
            <dl className="grid max-w-3xl grid-cols-1 gap-x-10 sm:grid-cols-2">
              {productSpecs(product, category).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-border py-3 text-sm">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          ),
        },
        {
          id: "reviews",
          label: `Reviews (${formatNumber(product.reviewCount)})`,
          content: <Reviews product={product} />,
        },
      ]}
    />
  );
}
