"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useForm } from "@/hooks";
import { validateProduct, type ProductDraft } from "@/features/catalog/services/validation";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { Button, Field, Input, ProductImage, Select, Switch, Textarea } from "@/components/ui";
import type { Product } from "@/types";

const toDraft = (p?: Product): ProductDraft => ({
  title: p?.title ?? "",
  description: p?.description ?? "",
  brand: p?.brand ?? "",
  category: p?.category ?? "",
  price: p?.price ?? 0,
  compareAtPrice: p?.compareAtPrice ?? null,
  stock: p?.stock ?? 0,
  thumbnail: p?.thumbnail ?? "",
  status: p?.status ?? "active",
  tags: p?.tags ?? [],
  isFeatured: p?.isFeatured ?? false,
});

const parseNumber = (v: string) => (v === "" ? NaN : Number(v));
const numberValue = (n: number | null) => (n === null || Number.isNaN(n) ? "" : n);

/** Create / edit form. Persists via the catalog store; validation is shared with the domain layer. */
export function ProductForm({ product, onDone }: { product?: Product; onDone: () => void }) {
  const categories = useCatalogStore((s) => s.categories);
  const addProduct = useCatalogStore((s) => s.addProduct);
  const updateProduct = useCatalogStore((s) => s.updateProduct);
  const validate = useCallback((d: ProductDraft) => validateProduct(d, categories), [categories]);
  const {
    values,
    errors,
    setField,
    bind,
    validate: runValidation,
  } = useForm<ProductDraft>(() => toDraft(product), validate);
  const [tags, setTags] = useState(values.tags.join(", "));

  const numberField = (key: "price" | "stock") => ({
    id: key,
    type: "number" as const,
    min: 0,
    value: numberValue(values[key]),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setField(key, parseNumber(e.target.value)),
    "aria-invalid": Boolean(errors[key]),
    "aria-describedby": errors[key] ? `${key}-error` : undefined,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ProductDraft = {
      ...values,
      title: values.title.trim(),
      brand: values.brand.trim(),
      description: values.description.trim(),
      tags: tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    };
    if (runValidation(payload)) return;
    if (product) updateProduct(product.id, payload);
    else addProduct(payload);
    toast.success(product ? "Product updated" : "Product created", { description: payload.title });
    onDone();
  };

  return (
    <form onSubmit={submit} noValidate className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
      <Field label="Title" htmlFor="title" error={errors.title} className="sm:col-span-2">
        <Input {...bind("title")} />
      </Field>
      <Field label="Description" htmlFor="description" error={errors.description} className="sm:col-span-2">
        <Textarea {...bind("description")} />
      </Field>
      <Field label="Brand" htmlFor="brand" error={errors.brand}>
        <Input {...bind("brand")} />
      </Field>
      <Field label="Category" htmlFor="category" error={errors.category}>
        <Select {...bind("category")}>
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Price (USD)" htmlFor="price" error={errors.price}>
        <Input {...numberField("price")} step="0.01" />
      </Field>
      <Field
        label="Compare-at price"
        htmlFor="compareAtPrice"
        error={errors.compareAtPrice}
        hint="Optional — shows as a strikethrough sale price."
      >
        <Input
          id="compareAtPrice"
          type="number"
          min={0}
          step="0.01"
          value={numberValue(values.compareAtPrice)}
          onChange={(e) => setField("compareAtPrice", e.target.value === "" ? null : Number(e.target.value))}
          aria-invalid={Boolean(errors.compareAtPrice)}
        />
      </Field>
      <Field label="Stock" htmlFor="stock" error={errors.stock}>
        <Input {...numberField("stock")} step={1} />
      </Field>
      <Field label="Status" htmlFor="status">
        <Select {...bind("status")}>
          <option value="active">Active — visible in store</option>
          <option value="draft">Draft — hidden</option>
          <option value="archived">Archived — hidden</option>
        </Select>
      </Field>
      <Field
        label="Image URL"
        htmlFor="thumbnail"
        error={errors.thumbnail}
        className="sm:col-span-2"
        hint="Any public https image URL."
      >
        <div className="flex gap-3">
          <Input {...bind("thumbnail")} type="url" placeholder="https://…" />
          <div className="relative size-11 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
            {values.thumbnail.startsWith("http") && (
              <ProductImage
                key={values.thumbnail}
                src={values.thumbnail}
                alt="Preview"
                fill
                sizes="44px"
                className="object-contain"
              />
            )}
          </div>
        </div>
      </Field>
      <Field label="Tags" htmlFor="tags" hint="Comma separated — improves search relevance." className="sm:col-span-2">
        <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="summer, bestseller" />
      </Field>
      <div className="flex items-center justify-between rounded-md bg-muted/60 p-4 sm:col-span-2">
        <div>
          <p className="text-sm font-medium">Featured product</p>
          <p className="text-xs text-muted-foreground">Boosts placement in “Featured” sorting.</p>
        </div>
        <Switch checked={values.isFeatured} onChange={(v) => setField("isFeatured", v)} label="Featured product" />
      </div>
      <div className="flex justify-end gap-3 border-t border-border pt-5 sm:col-span-2">
        <Button variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit">{product ? "Save changes" : "Create product"}</Button>
      </div>
    </form>
  );
}
