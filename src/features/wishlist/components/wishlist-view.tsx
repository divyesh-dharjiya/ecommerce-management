"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/features/cart/store/cart-store";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { useHydrated, useUiStore } from "@/store/ui-store";
import { useWishlistStore } from "@/features/wishlist/store/wishlist-store";
import { Button, buttonClasses, Container, EmptyState, PageHeader } from "@/components/ui";
import { ProductGrid, ProductGridSkeleton } from "@/features/catalog/components/product-grid";

export function WishlistView() {
  const hydrated = useHydrated();
  const ids = useWishlistStore((s) => s.ids);
  const products = useCatalogStore((s) => s.products);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useUiStore((s) => s.setCartOpen);

  const items = useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p]));
    return ids.flatMap((id) => {
      const p = byId.get(id);
      return p && p.status === "active" ? [p] : [];
    });
  }, [ids, products]);

  const addAll = () => {
    const added = items.filter((p) => p.stock > 0 && addItem(p, 1) > 0).length;
    if (added) {
      toast.success(`Added ${added} items to your cart`);
      openCart(true);
    } else toast.info("Everything is already in your cart");
  };

  return (
    <>
      <PageHeader
        title="Wishlist"
        description="Your saved favourites, all in one place."
        breadcrumbs={[{ href: "/", label: "Home" }, { label: "Wishlist" }]}
      >
        {hydrated && items.length > 0 && (
          <Button className="mt-6" onClick={addAll}>
            <ShoppingBag className="size-4" /> Add all to bag
          </Button>
        )}
      </PageHeader>
      <Container className="py-10">
        {!hydrated ? (
          <ProductGridSkeleton count={4} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Heart className="size-9" />}
            title="Your wishlist is empty"
            description="Tap the heart on any product to save it here for later."
            action={
              <Link href="/products" className={buttonClasses()}>
                Discover products
              </Link>
            }
          />
        ) : (
          <ProductGrid products={items} />
        )}
      </Container>
    </>
  );
}
