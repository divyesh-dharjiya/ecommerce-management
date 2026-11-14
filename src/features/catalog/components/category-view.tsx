"use client";

import Link from "next/link";
import { FolderX } from "lucide-react";
import { useCategoryBySlug } from "@/features/catalog/store/catalog-store";
import { useHydrated } from "@/store/ui-store";
import { Breadcrumbs, buttonClasses, Container, EmptyState, ProductImage } from "@/components/ui";
import { CategoryIcon } from "@/features/catalog/components/category-icon";
import { ProductExplorer } from "@/features/catalog/components/product-explorer";
import type { Category } from "@/types";

/**
 * A category listing. Seed categories render on the server; categories an
 * admin created exist only in the browser store, and deleted ones show a
 * not-found state once the store has loaded.
 */
export function CategoryView({ slug }: { slug: string }) {
  const category = useCategoryBySlug(slug);
  const hydrated = useHydrated();

  if (!category) {
    if (!hydrated) return <div className="min-h-[60vh]" aria-busy="true" />;
    return (
      <Container>
        <EmptyState
          icon={<FolderX className="size-9" />}
          headingLevel="h1"
          title="Category not found"
          description="This category may have been removed or renamed."
          action={
            <Link href="/categories" className={buttonClasses()}>
              Browse categories
            </Link>
          }
        />
      </Container>
    );
  }

  return (
    <>
      <CategoryHeader category={category} />
      <Container className="py-10">
        <ProductExplorer lockedCategory={slug} />
      </Container>
    </>
  );
}

function CategoryHeader({ category }: { category: Category }) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        className="absolute inset-0 opacity-20"
        style={{ background: `radial-gradient(ellipse at 80% 50%, ${category.accent}, transparent 60%)` }}
      />
      <Container className="relative grid grid-cols-1 items-center gap-6 py-8 sm:grid-cols-[1fr_auto]">
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
              className="grid size-12 place-items-center rounded-xl text-white"
              style={{ backgroundColor: category.accent }}
            >
              <CategoryIcon name={category.icon} className="size-6" />
            </span>
            <h1 className="font-display text-2xl sm:text-3xl">{category.name}</h1>
          </div>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">{category.description}</p>
        </div>
        <div className="relative hidden size-32 sm:block">
          <ProductImage
            src={category.image}
            alt=""
            fill
            priority
            sizes="128px"
            className="object-contain drop-shadow-2xl"
          />
        </div>
      </Container>
    </section>
  );
}
