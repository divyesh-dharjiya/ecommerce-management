"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useForm } from "@/hooks";
import { validateCategory, type CategoryDraft } from "@/features/catalog/services/validation";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { CATEGORY_ICONS, CategoryIcon } from "@/features/catalog/components/category-icon";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import type { Category } from "@/types";

export function CategoryForm({ category, onDone }: { category?: Category; onDone: () => void }) {
  const categories = useCatalogStore((s) => s.categories);
  const addCategory = useCatalogStore((s) => s.addCategory);
  const updateCategory = useCatalogStore((s) => s.updateCategory);
  const validate = useCallback((d: CategoryDraft) => validateCategory(d, categories, category?.id), [categories, category?.id]);
  const { values, errors, setField, bind, validate: runValidation } = useForm<CategoryDraft>(
    () => ({
      name: category?.name ?? "",
      description: category?.description ?? "",
      image: category?.image ?? "",
      accent: category?.accent ?? "#6366f1",
      icon: category?.icon ?? "Tag",
    }),
    validate,
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...values, name: values.name.trim(), description: values.description.trim() };
    if (runValidation(payload)) return;
    if (category) updateCategory(category.id, payload);
    else addCategory(payload);
    toast.success(category ? "Category updated" : "Category created", { description: payload.name });
    onDone();
  };

  return (
    <form onSubmit={submit} noValidate className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
      <Field label="Name" htmlFor="name" error={errors.name} className="sm:col-span-2">
        <Input {...bind("name")} />
      </Field>
      <Field label="Description" htmlFor="description" error={errors.description} className="sm:col-span-2">
        <Textarea {...bind("description")} />
      </Field>
      <Field label="Cover image URL" htmlFor="image" error={errors.image} className="sm:col-span-2">
        <Input {...bind("image")} type="url" placeholder="https://…" />
      </Field>
      <Field label="Icon" htmlFor="icon">
        <Select {...bind("icon")}>
          {Object.keys(CATEGORY_ICONS).map((name) => <option key={name}>{name}</option>)}
        </Select>
      </Field>
      <Field label="Accent colour" htmlFor="accent" error={errors.accent}>
        <div className="flex gap-2">
          <input type="color" value={values.accent} onChange={(e) => setField("accent", e.target.value)} className="h-11 w-14 cursor-pointer rounded-xl border border-border bg-card p-1" aria-label="Pick accent colour" />
          <Input {...bind("accent")} />
        </div>
      </Field>
      <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-4 sm:col-span-2">
        <span className="grid size-10 place-items-center rounded-xl text-white transition-colors" style={{ backgroundColor: values.accent }}>
          <CategoryIcon name={values.icon} className="size-5" />
        </span>
        <span className="font-semibold">{values.name || "Preview"}</span>
      </div>
      <div className="flex justify-end gap-3 border-t border-border pt-5 sm:col-span-2">
        <Button variant="outline" onClick={onDone}>Cancel</Button>
        <Button type="submit">{category ? "Save changes" : "Create category"}</Button>
      </div>
    </form>
  );
}
