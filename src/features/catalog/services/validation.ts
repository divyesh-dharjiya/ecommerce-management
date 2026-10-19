import { isHexColor, isHttpUrl, minLength, type FieldErrors } from "@/lib/validation";
import type { Category, Product } from "@/types";

export type ProductDraft = Pick<
  Product,
  "title" | "description" | "brand" | "category" | "price" | "compareAtPrice" | "stock" | "thumbnail" | "status" | "tags" | "isFeatured"
>;

export function validateProduct(p: ProductDraft, categories: Category[]): FieldErrors<ProductDraft> {
  const e: FieldErrors<ProductDraft> = {};
  if (!minLength(p.title, 3)) e.title = "Title must be at least 3 characters.";
  else if (p.title.trim().length > 120) e.title = "Title must be under 120 characters.";
  if (!minLength(p.description, 10)) e.description = "Description must be at least 10 characters.";
  if (!minLength(p.brand, 2)) e.brand = "Brand is required.";
  if (!categories.some((c) => c.slug === p.category)) e.category = "Choose a category.";
  if (!Number.isFinite(p.price) || p.price <= 0) e.price = "Price must be greater than 0.";
  if (p.compareAtPrice !== null && (!Number.isFinite(p.compareAtPrice) || p.compareAtPrice <= p.price)) {
    e.compareAtPrice = "Compare-at price must be higher than price.";
  }
  if (!Number.isInteger(p.stock) || p.stock < 0) e.stock = "Stock must be a whole number ≥ 0.";
  if (!isHttpUrl(p.thumbnail)) e.thumbnail = "Enter a valid image URL.";
  return e;
}

export type CategoryDraft = Pick<Category, "name" | "description" | "image" | "accent" | "icon">;

export function validateCategory(c: CategoryDraft, existing: Category[], editingId?: string): FieldErrors<CategoryDraft> {
  const e: FieldErrors<CategoryDraft> = {};
  const name = c.name.trim();
  if (!minLength(name, 2)) e.name = "Name must be at least 2 characters.";
  else if (existing.some((x) => x.id !== editingId && x.name.toLowerCase() === name.toLowerCase())) {
    e.name = "A category with this name already exists.";
  }
  if (!minLength(c.description, 5)) e.description = "Add a short description.";
  if (!isHttpUrl(c.image)) e.image = "Enter a valid image URL.";
  if (!isHexColor(c.accent)) e.accent = "Use a hex colour like #6366f1.";
  return e;
}
