"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/format";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { CategoryIcon } from "@/features/catalog/components/category-icon";
import { ClientGate } from "@/components/providers/client-gate";
import { Button, Card, ConfirmDialog, Modal, ProductImage, Select, Skeleton } from "@/components/ui";
import { AdminPageHeader } from "@/features/admin/components/admin-page";
import { CategoryForm } from "@/features/admin/components/category-form";
import type { Category } from "@/types";

export function CategoriesManager() {
  return (
    <ClientGate fallback={<Skeleton className="h-[600px]" />}>
      <CategoriesView />
    </ClientGate>
  );
}

function CategoriesView() {
  const categories = useCatalogStore((s) => s.categories);
  const products = useCatalogStore((s) => s.products);
  const deleteCategory = useCatalogStore((s) => s.deleteCategory);
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [reassignTo, setReassignTo] = useState("");

  const stats = useMemo(() => {
    const m = new Map<string, { count: number; value: number }>();
    for (const p of products) {
      const s = m.get(p.category) ?? { count: 0, value: 0 };
      s.count += 1;
      s.value += p.price * p.stock;
      m.set(p.category, s);
    }
    return m;
  }, [products]);

  const deletingCount = deleting ? (stats.get(deleting.slug)?.count ?? 0) : 0;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Categories"
        description={`${categories.length} categories`}
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" /> Add category
          </Button>
        }
      />

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence initial={false}>
          {categories.map((c, i) => {
            const s = stats.get(c.slug);
            return (
              <m.li
                key={c.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ ...spring.gentle, delay: Math.min(i, 12) * 0.02 }}
              >
                <Card className="group flex items-center gap-4 p-4">
                  <div
                    className="relative size-16 shrink-0 overflow-hidden rounded-lg"
                    style={{ backgroundColor: `${c.accent}22` }}
                  >
                    <ProductImage src={c.image} alt="" fill sizes="64px" className="object-contain p-1.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-semibold">
                      <CategoryIcon name={c.icon} className="size-4" />
                      <span className="truncate">{c.name}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s?.count ?? 0} products · {formatPrice(s?.value ?? 0)} stock value
                    </p>
                  </div>
                  <div className="flex gap-1 transition sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => setEditing(c)}
                      aria-label={`Edit ${c.name}`}
                      className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReassignTo(categories.find((x) => x.id !== c.id)?.slug ?? "");
                        setDeleting(c);
                      }}
                      aria-label={`Delete ${c.name}`}
                      className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </Card>
              </m.li>
            );
          })}
        </AnimatePresence>
      </ul>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Add category" : "Edit category"}
        className="max-w-xl"
      >
        {editing !== null && (
          <CategoryForm category={editing === "new" ? undefined : editing} onDone={() => setEditing(null)} />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title={`Delete “${deleting?.name}”?`}
        description={
          deletingCount > 0
            ? `${deletingCount} products belong to this category. Choose where to move them, or delete them too.`
            : "This category has no products and can be safely removed."
        }
        onConfirm={() => {
          if (!deleting) return;
          deleteCategory(deleting.id, reassignTo || undefined);
          toast.success(`Deleted ${deleting.name}`);
        }}
      >
        {deletingCount > 0 && (
          <div className="mt-4">
            <Select value={reassignTo} onChange={(e) => setReassignTo(e.target.value)} aria-label="Move products to">
              {categories
                .filter((c) => c.id !== deleting?.id)
                .map((c) => (
                  <option key={c.id} value={c.slug}>
                    Move products to {c.name}
                  </option>
                ))}
              <option value="">Delete products as well</option>
            </Select>
            <p className={cn("mt-2 text-xs", reassignTo ? "text-muted-foreground" : "font-semibold text-danger")}>
              {reassignTo
                ? "Products will be kept and recategorised."
                : `${deletingCount} products will be permanently removed.`}
            </p>
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
