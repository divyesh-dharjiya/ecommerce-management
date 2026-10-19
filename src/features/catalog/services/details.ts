import type { Product, ProductDetails } from "@/types";

const stripEllipsis = (s: string) => s.replace(/…$/, "").trimEnd();

/**
 * Combines a (lite, possibly admin-edited) product from the store with the
 * full details the server sent for its product page.
 *
 * Store values win wherever they carry real information — an admin edit is
 * never overwritten — while fields the lite catalog leaves out (reviews,
 * specs, full gallery) are filled in. The description is only replaced when
 * the stored one is just the truncated seed text.
 */
export function withDetails(product: Product, details: ProductDetails | undefined): Product {
  if (!details) return product;
  const storedIsTruncatedSeed = details.description.startsWith(stripEllipsis(product.description));
  return {
    ...product,
    description: storedIsTruncatedSeed ? details.description : product.description,
    images: product.images.length >= details.images.length ? product.images : details.images,
    reviews: product.reviews.length ? product.reviews : details.reviews,
    weight: product.weight ?? details.weight,
    dimensions: product.dimensions ?? details.dimensions,
    warranty: product.warranty ?? details.warranty,
    shipping: product.shipping ?? details.shipping,
    returnPolicy: product.returnPolicy ?? details.returnPolicy,
  };
}
