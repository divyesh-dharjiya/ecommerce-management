"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useCartStore } from "@/features/cart/store/cart-store";
import { useUiStore } from "@/store/ui-store";
import { useWishlistStore } from "@/features/wishlist/store/wishlist-store";
import type { Product } from "@/types";

/** UI-facing cart/wishlist commands with consistent feedback. */
export function useCartActions() {
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const setCartOpen = useUiStore((s) => s.setCartOpen);

  const addToCart = useCallback(
    (product: Product, quantity = 1, { openDrawer = true } = {}) => {
      if (product.stock <= 0) {
        toast.error(`${product.title} is out of stock`);
        return false;
      }
      const added = addItem(product, quantity);
      if (added === 0) {
        toast.warning("Maximum quantity reached", {
          description: "You already have the maximum available quantity in your bag.",
        });
        return false;
      }
      toast.success("Added to bag", {
        description: `${added} × ${product.title}`,
        action: { label: "View bag", onClick: () => setCartOpen(true) },
      });
      if (openDrawer) setCartOpen(true);
      return true;
    },
    [addItem, setCartOpen],
  );

  const toggleWish = useCallback(
    (product: Product) => {
      const added = toggleWishlist(product.id);
      toast(added ? "Saved to wishlist" : "Removed from wishlist", {
        description: product.title,
      });
    },
    [toggleWishlist],
  );

  return { addToCart, toggleWish };
}
