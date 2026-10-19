import { beforeEach, describe, expect, it } from "vitest";
import { SEED_PRODUCTS } from "@/data";
import { useCartStore } from "@/features/cart/store/cart-store";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { useOrderStore } from "@/features/orders/store/order-store";
import type { CustomerDetails } from "@/types";

const customer: CustomerDetails = {
  fullName: "Jane Doe",
  email: "jane@example.com",
  phone: "+1 555 0100",
  address: "1 Market St",
  city: "Austin",
  postalCode: "73301",
  country: "United States",
};
const product = SEED_PRODUCTS[0]!;

beforeEach(() => {
  useCatalogStore.getState().resetCatalog();
  useOrderStore.getState().reset();
  useCartStore.getState().clear();
});

describe("placeOrder", () => {
  const line = (quantity: number, unitPrice = product.price) => ({
    productId: product.id,
    title: product.title,
    thumbnail: product.thumbnail,
    category: product.category,
    unitPrice,
    quantity,
  });

  it("recomputes totals server-side-style and ignores any tampered figures", () => {
    const order = useOrderStore
      .getState()
      .placeOrder({ lines: [line(2)], customer, paymentMethod: "card", couponCode: null });
    // 2 × 9.99 = 19.98 subtotal, 9.99 shipping, 8% tax
    expect(order.subtotal).toBe(19.98);
    expect(order.shipping).toBe(9.99);
    expect(order.total).toBe(order.subtotal + order.shipping + order.tax);
  });

  it("decrements stock and increments sold count", () => {
    const before = useCatalogStore.getState().products.find((p) => p.id === product.id)!;
    useOrderStore.getState().placeOrder({ lines: [line(3)], customer, paymentMethod: "upi", couponCode: null });
    const after = useCatalogStore.getState().products.find((p) => p.id === product.id)!;
    expect(after.stock).toBe(before.stock - 3);
    expect(after.soldCount).toBe(before.soldCount + 3);
  });

  it("applies a valid coupon and ignores an unknown one", () => {
    const withCode = useOrderStore
      .getState()
      .placeOrder({ lines: [line(5, 50)], customer, paymentMethod: "card", couponCode: "welcome10" });
    expect(withCode.couponCode).toBe("WELCOME10");
    expect(withCode.discount).toBe(25);
    const bogus = useOrderStore
      .getState()
      .placeOrder({ lines: [line(1, 50)], customer, paymentMethod: "card", couponCode: "NOPE" });
    expect(bogus.couponCode).toBeNull();
    expect(bogus.discount).toBe(0);
  });

  it("marks cash-on-delivery orders pending and prepaid orders processing", () => {
    const cod = useOrderStore
      .getState()
      .placeOrder({ lines: [line(1)], customer, paymentMethod: "cod", couponCode: null });
    const card = useOrderStore
      .getState()
      .placeOrder({ lines: [line(1)], customer, paymentMethod: "card", couponCode: null });
    expect([cod.status, card.status]).toEqual(["pending", "processing"]);
  });

  it("generates unique order numbers", () => {
    for (let i = 0; i < 20; i++)
      useOrderStore.getState().placeOrder({ lines: [line(1)], customer, paymentMethod: "card", couponCode: null });
    const numbers = useOrderStore.getState().orders.map((o) => o.number);
    expect(new Set(numbers).size).toBe(20);
  });
});

describe("cart store", () => {
  it("clamps additions to available stock and the per-item limit", () => {
    const limited = { ...product, stock: 4 };
    expect(useCartStore.getState().addItem(limited, 3)).toBe(3);
    expect(useCartStore.getState().addItem(limited, 3)).toBe(1); // only 1 more fits
    expect(useCartStore.getState().addItem(limited, 1)).toBe(0); // at the ceiling
    expect(useCartStore.getState().items[0]!.quantity).toBe(4);
  });

  it("removes a line when quantity drops to zero", () => {
    useCartStore.getState().addItem(product, 2);
    useCartStore.getState().setQuantity(product.id, 0, product.stock);
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

describe("catalog deletion tracking", () => {
  it("remembers deleted seed products so they are not merged back", () => {
    useCatalogStore.getState().deleteProducts([product.id]);
    const s = useCatalogStore.getState();
    expect(s.products.some((p) => p.id === product.id)).toBe(false);
    expect(s.deletedSeedProductIds).toContain(product.id);
  });
});
