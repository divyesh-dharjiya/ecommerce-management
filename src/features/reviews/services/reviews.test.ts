import { describe, expect, it } from "vitest";
import { ratingDistribution, validateReview, withNewRating } from "@/features/reviews/services/reviews";

describe("validateReview", () => {
  it("requires a star rating, a name and a meaningful comment", () => {
    const errors = validateReview({ author: "A", rating: 0, comment: "ok" });
    expect(Object.keys(errors).sort()).toEqual(["author", "comment", "rating"]);
    expect(validateReview({ author: "Ann", rating: 5, comment: "Fits perfectly, great quality." })).toEqual({});
  });

  it("rejects ratings outside 1–5", () => {
    expect(validateReview({ author: "Ann", rating: 6, comment: "Fits perfectly." }).rating).toBeDefined();
  });
});

describe("withNewRating", () => {
  it("folds a new rating into the running average", () => {
    expect(withNewRating({ rating: 4, reviewCount: 3 }, 5)).toEqual({ rating: 4.25, reviewCount: 4 });
  });

  it("uses the first rating as-is for an unreviewed product", () => {
    expect(withNewRating({ rating: 0, reviewCount: 0 }, 3)).toEqual({ rating: 3, reviewCount: 1 });
  });
});

describe("ratingDistribution", () => {
  it("counts reviews per star, highest first", () => {
    expect(ratingDistribution([{ rating: 5 }, { rating: 4.6 }, { rating: 1 }])).toEqual([
      { star: 5, count: 2 },
      { star: 4, count: 0 },
      { star: 3, count: 0 },
      { star: 2, count: 0 },
      { star: 1, count: 1 },
    ]);
  });
});
