"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { commerceConfig } from "@/config/site";
import { useDebounce } from "@/hooks";
import { formatNumber, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { scoreProduct } from "@/features/catalog/services/catalog";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { ClientGate } from "@/components/providers/client-gate";
import { Button, ConfirmDialog, DataTable, Modal, SearchInput, Select, Skeleton, Thumb, type Column } from "@/components/ui";
import { AdminPageHeader } from "@/features/admin/components/admin-page";
import { ProductForm } from "@/features/admin/components/product-form";
import type { Product, ProductStatus } from "@/types";

const STATUS_TONE: Record<ProductStatus, string> = {
  active: "bg-success/15 text-success",
  draft: "bg-muted text-muted-foreground",
  archived: "bg-danger/10 text-danger",
};

type StockFilter = "" | "low" | "out";

const matchesStock = (p: Product, filter: StockFilter) =>
  filter === "out" ? p.stock === 0 : filter === "low" ? p.stock > 0 && p.stock <= commerceConfig.lowStockThreshold : true;

function RowAction({ label, onClick, danger, children }: { label: string; onClick: () => void; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn("grid size-8 place-items-center rounded-lg text-muted-foreground transition", danger ? "hover:bg-danger/10 hover:text-danger" : "hover:bg-muted hover:text-foreground")}
    >
      {children}
    </button>
  );
}

export function ProductsTable() {
  return (
    <ClientGate fallback={<Skeleton className="h-[600px]" />}>
      <ProductsTableView />
    </ClientGate>
  );
}

function ProductsTableView() {
  const products = useCatalogStore((s) => s.products);
  const categories = useCatalogStore((s) => s.categories);
  const deleteProducts = useCatalogStore((s) => s.deleteProducts);
  const updateProduct = useCatalogStore((s) => s.updateProduct);

  const [term, setTerm] = useState("");
  const search = useDebounce(term, 200);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<"" | ProductStatus>("");
  const [stock, setStock] = useState<StockFilter>("");
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [confirmIds, setConfirmIds] = useState<string[] | null>(null);

  const rows = useMemo(
    () =>
      products.filter(
        (p) =>
          (!category || p.category === category) &&
          (!status || p.status === status) &&
          matchesStock(p, stock) &&
          (!search.trim() || scoreProduct(p, search) > 0),
      ),
    [products, category, status, stock, search],
  );

  const categoryName = useMemo(() => new Map(categories.map((c) => [c.slug, c.name])), [categories]);

  const columns: Column<Product>[] = [
    {
      id: "title",
      header: "Product",
      sortValue: (p) => p.title,
      cell: (p) => (
        <div className="flex items-center gap-3">
          <Thumb src={p.thumbnail} size="sm" />
          <div className="min-w-0">
            <p className="max-w-[260px] truncate font-medium">{p.title}</p>
            <p className="text-xs text-muted-foreground">{p.brand} · {p.sku}</p>
          </div>
        </div>
      ),
    },
    { id: "category", header: "Category", cell: (p) => <span className="text-muted-foreground">{categoryName.get(p.category) ?? p.category}</span> },
    { id: "price", header: "Price", sortValue: (p) => p.price, cell: (p) => <span className="font-semibold tabular-nums">{formatPrice(p.price)}</span> },
    {
      id: "stock",
      header: "Stock",
      sortValue: (p) => p.stock,
      cell: (p) => (
        <span className={cn("font-semibold tabular-nums", p.stock === 0 ? "text-danger" : p.stock <= commerceConfig.lowStockThreshold && "text-amber-600 dark:text-amber-400")}>{p.stock}</span>
      ),
    },
    { id: "sold", header: "Sold", sortValue: (p) => p.soldCount, cell: (p) => <span className="tabular-nums text-muted-foreground">{formatNumber(p.soldCount)}</span> },
    {
      id: "status",
      header: "Status",
      cell: (p) => (
        <select
          value={p.status}
          onChange={(e) => {
            updateProduct(p.id, { status: e.target.value as ProductStatus });
            toast.success(`Status set to ${e.target.value}`);
          }}
          aria-label={`Status for ${p.title}`}
          className={cn("cursor-pointer rounded-full border-0 px-2.5 py-1 text-xs font-semibold capitalize outline-none", STATUS_TONE[p.status])}
        >
          <option value="active">active</option>
          <option value="draft">draft</option>
          <option value="archived">archived</option>
        </select>
      ),
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      align: "right",
      cell: (p) => (
        <div className="flex justify-end gap-1">
          <Link href={`/products/${p.slug}`} target="_blank" aria-label={`View ${p.title} in store`} className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground">
            <ExternalLink className="size-4" />
          </Link>
          <RowAction label={`Edit ${p.title}`} onClick={() => setEditing(p)}>
            <Pencil className="size-4" />
          </RowAction>
          <RowAction label={`Delete ${p.title}`} onClick={() => setConfirmIds([p.id])} danger>
            <Trash2 className="size-4" />
          </RowAction>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Products"
        description={`${formatNumber(products.length)} products in catalogue`}
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" /> Add product
          </Button>
        }
      />

      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(p) => p.id}
        initialSort={{ id: "title", dir: 1 }}
        resetKey={`${search}|${category}|${status}|${stock}`}
        minWidth={880}
        emptyMessage="No products match your filters."
        toolbar={
          <>
            <SearchInput value={term} onValueChange={setTerm} placeholder="Search title, brand, SKU…" className="min-w-0 flex-1 basis-56" />
            <div className="w-44">
              <Select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category" className="h-10">
                <option value="">All categories</option>
                {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </Select>
            </div>
            <div className="w-36">
              <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Filter by status" className="h-10">
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </Select>
            </div>
            <div className="w-36">
              <Select value={stock} onChange={(e) => setStock(e.target.value as StockFilter)} aria-label="Filter by stock" className="h-10">
                <option value="">Any stock</option>
                <option value="low">Low stock</option>
                <option value="out">Out of stock</option>
              </Select>
            </div>
          </>
        }
        bulkActions={(ids, clear) => (
          <>
            <Button size="sm" variant="ghost" onClick={clear}>Clear</Button>
            <Button size="sm" variant="danger" onClick={() => setConfirmIds(ids)}>
              <Trash2 className="size-3.5" /> Delete
            </Button>
          </>
        )}
      />

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "Add product" : "Edit product"} className="max-w-2xl">
        {editing !== null && <ProductForm product={editing === "new" ? undefined : editing} onDone={() => setEditing(null)} />}
      </Modal>

      <ConfirmDialog
        open={confirmIds !== null}
        onClose={() => setConfirmIds(null)}
        title={`Delete ${confirmIds?.length === 1 ? "product" : `${confirmIds?.length} products`}?`}
        description="This removes the product from the catalogue and every shopper's view. Past orders are kept."
        onConfirm={() => {
          if (!confirmIds) return;
          deleteProducts(confirmIds);
          toast.success(`Deleted ${confirmIds.length} product${confirmIds.length === 1 ? "" : "s"}`);
        }}
      />
    </div>
  );
}
