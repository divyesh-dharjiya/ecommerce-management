import type { Product, ProductDetails } from "@/types";

const stripEllipsis = (s: string) => s.replace(/…$/, "").trimEnd();

/**
 * The full gallery, keeping an image the admin set as the new main photo
 * (`updateProduct` puts a changed thumbnail first in `images`).
 */
function mergeImages(product: Product, full: string[]): string[] {
  if (product.images.length >= full.length) return product.images;
  const [first] = product.images;
  const adminImage = first && first === product.thumbnail && !full.includes(first);
  return adminImage ? [first, ...full] : full;
}

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
    images: mergeImages(product, details.images),
    reviews: product.reviews.length ? product.reviews : details.reviews,
    weight: product.weight ?? details.weight,
    dimensions: product.dimensions ?? details.dimensions,
    warranty: product.warranty ?? details.warranty,
    shipping: product.shipping ?? details.shipping,
    returnPolicy: product.returnPolicy ?? details.returnPolicy,
  };
}
