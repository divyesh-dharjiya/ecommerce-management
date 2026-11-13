"use client";

import { useMemo, useState } from "react";
import { Check, PenLine } from "lucide-react";
import { formatDate, formatNumber } from "@/lib/format";
import { Badge, Button, Rating } from "@/components/ui";
import { useOwnReviews } from "@/features/reviews/store/review-store";
import { ratingDistribution } from "@/features/reviews/services/reviews";
import { ReviewForm } from "@/features/reviews/components/review-form";
import type { Product, Review } from "@/types";

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function ReviewCard({ review }: { review: Review }) {
  // Seed reviews come from verified buyers; a shopper's own review is verified when they ordered the item.
  const verified = review.verified ?? !review.own;
  return (
    <li className="rounded-xl border border-border p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-muted text-foreground" aria-hidden>
            {initials(review.author)}
          </span>
          <div>
            <p className="font-semibold">{review.author}</p>
            <p className="text-xs text-muted-foreground">{formatDate(review.date)}</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {review.own && <Badge tone="primary">Your review</Badge>}
          {verified && (
            <Badge tone="success">
              <Check className="size-3" /> Verified purchase
            </Badge>
          )}
        </div>
      </div>
      <Rating value={review.rating} className="mt-3" />
      <p className="mt-2 whitespace-pre-line text-sm">{review.comment}</p>
    </li>
  );
}

/** Rating summary, written reviews (this shopper's first) and the write-a-review form. */
export function Reviews({ product }: { product: Product }) {
  const own = useOwnReviews(product.id);
  const [writing, setWriting] = useState(false);
  const reviews = useMemo(() => [...own, ...product.reviews], [own, product.reviews]);
  const distribution = ratingDistribution(reviews);
  const total = Math.max(1, reviews.length);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr]">
      <div>
        <p className="font-display text-5xl">{product.reviewCount > 0 ? product.rating.toFixed(1) : "–"}</p>
        <Rating value={product.rating} size={18} className="mt-2" />
        <p className="mt-1 text-sm text-muted-foreground">
          {product.reviewCount > 0 ? `Based on ${formatNumber(product.reviewCount)} ratings` : "No ratings yet"}
        </p>
        {reviews.length > 0 && (
          <>
            <p className="mt-6 text-xs font-medium text-muted-foreground">
              From {reviews.length} written review{reviews.length === 1 ? "" : "s"}
            </p>
            <dl className="mt-2 space-y-2">
              {distribution.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <dt className="w-3">{star}</dt>
                  <dd className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full origin-left animate-grow rounded-full bg-amber-400"
                      style={{ width: `${(count / total) * 100}%` }}
                    />
                  </dd>
                  <dd className="w-6 text-right text-muted-foreground">{count}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
        {!writing && (
          <Button variant="outline" className="mt-6 w-full" onClick={() => setWriting(true)}>
            <PenLine className="size-4" /> Write a review
          </Button>
        )}
      </div>
      <div className="space-y-4">
        {writing && <ReviewForm product={product} onDone={() => setWriting(false)} />}
        {reviews.length === 0 && !writing ? (
          <p className="text-muted-foreground">No written reviews yet. Be the first to share what you think.</p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
