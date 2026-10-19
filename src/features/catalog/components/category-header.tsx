"use client";

import Link from "next/link";
import { useCategoryBySlug } from "@/features/catalog/store/catalog-store";
import { useHydrated } from "@/store/ui-store";
import { Breadcrumbs, buttonClasses, Container, ProductImage } from "@/components/ui";
import { CategoryIcon } from "@/features/catalog/components/category-icon";

export function CategoryHeader({ slug }: { slug: string }) {
  const category = useCategoryBySlug(slug);
  const hydrated = useHydrated();

  if (!category) {
    return (
      <Container className="py-20 text-center">
        {hydrated && (
          <div className="animate-fade-up">
            <h1 className="font-display text-4xl font-bold">Category not found</h1>
            <p className="mt-3 text-muted-foreground">This category may have been removed.</p>
            <Link href="/categories" className={buttonClasses("primary", "md", "mt-6")}>
              Browse categories
            </Link>
          </div>
        )}
      </Container>
    );
  }

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(ellipse at 80% 50%, ${category.accent}, transparent 60%)` }} />
      <Container className="relative grid grid-cols-1 items-center gap-8 py-12 sm:grid-cols-[1fr_auto]">
        <div>
          <Breadcrumbs
            className="mb-4 animate-fade-in"
            items={[{ href: "/", label: "Home" }, { href: "/categories", label: "Categories" }, { label: category.name }]}
          />
          <div className="flex animate-fade-up items-center gap-4">
            <span className="grid size-14 place-items-center rounded-2xl text-white shadow-lg" style={{ backgroundColor: category.accent }}>
              <CategoryIcon name={category.icon} className="size-6" />
            </span>
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">{category.name}</h1>
          </div>
          <p className="mt-4 max-w-xl animate-fade-up text-muted-foreground [animation-delay:80ms]">{category.description}</p>
        </div>
        <div className="relative hidden size-48 animate-scale-in [animation-delay:120ms] sm:block">
          <ProductImage src={category.image} alt="" fill priority sizes="192px" className="object-contain drop-shadow-2xl" />
        </div>
      </Container>
    </section>
  );
}
