import { minLength, type FieldErrors } from "@/lib/validation";
import type { Product } from "@/types";

export interface ReviewDraft {
  author: string;
  rating: number;
  comment: string;
}

export const REVIEW_LIMITS = { authorMax: 40, commentMin: 10, commentMax: 1000 } as const;

export function validateReview(d: ReviewDraft): FieldErrors<ReviewDraft> {
  const e: FieldErrors<ReviewDraft> = {};
  if (!Number.isInteger(d.rating) || d.rating < 1 || d.rating > 5) e.rating = "Choose a star rating.";
  if (!minLength(d.author, 2)) e.author = "Enter your name.";
  else if (d.author.trim().length > REVIEW_LIMITS.authorMax) e.author = "Keep your name under 40 characters.";
  if (!minLength(d.comment, REVIEW_LIMITS.commentMin)) {
    e.comment = `Tell other shoppers a little more (at least ${REVIEW_LIMITS.commentMin} characters).`;
  } else if (d.comment.trim().length > REVIEW_LIMITS.commentMax) {
    e.comment = `Keep it under ${REVIEW_LIMITS.commentMax} characters.`;
  }
  return e;
}

/** Folds one new star rating into a product's average rating and count. */
export function withNewRating(product: Pick<Product, "rating" | "reviewCount">, stars: number) {
  const count = Math.max(0, product.reviewCount);
  const reviewCount = count + 1;
  const rating = Math.round(((product.rating * count + stars) / reviewCount) * 100) / 100;
  return { rating, reviewCount };
}

/** Star counts for the histogram. */
export function ratingDistribution(reviews: { rating: number }[]) {
  return [5, 4, 3, 2, 1].map((star) => ({ star, count: reviews.filter((r) => Math.round(r.rating) === star).length }));
}
