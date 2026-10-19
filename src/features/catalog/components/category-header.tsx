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
          <div className="">
            <h1 className="font-display text-4xl">Category not found</h1>
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
      <div
        className="absolute inset-0 opacity-20"
        style={{ background: `radial-gradient(ellipse at 80% 50%, ${category.accent}, transparent 60%)` }}
      />
      <Container className="relative grid grid-cols-1 items-center gap-8 py-12 sm:grid-cols-[1fr_auto]">
        <div>
          <Breadcrumbs
            className="mb-4"
            items={[
              { href: "/", label: "Home" },
              { href: "/categories", label: "Categories" },
              { label: category.name },
            ]}
          />
          <div className="flex items-center gap-4">
            <span
              className="grid size-14 place-items-center rounded-lg text-white shadow-lg"
              style={{ backgroundColor: category.accent }}
            >
              <CategoryIcon name={category.icon} className="size-6" />
            </span>
            <h1 className="font-display text-4xl tracking-tight sm:text-5xl">{category.name}</h1>
          </div>
          <p className="mt-4 max-w-xl text-muted-foreground">{category.description}</p>
        </div>
        <div className="relative hidden size-48 sm:block">
          <ProductImage
            src={category.image}
            alt=""
            fill
            priority
            sizes="192px"
            className="object-contain drop-shadow-2xl"
          />
        </div>
      </Container>
    </section>
  );
}
