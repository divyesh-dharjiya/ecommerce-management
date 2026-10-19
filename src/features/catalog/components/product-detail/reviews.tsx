import { Check } from "lucide-react";
import { formatDate, formatNumber } from "@/lib/format";
import { Badge, Rating } from "@/components/ui";
import type { Product, Review } from "@/types";

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

export function ratingDistribution(reviews: Review[]) {
  return [5, 4, 3, 2, 1].map((star) => ({ star, count: reviews.filter((r) => Math.round(r.rating) === star).length }));
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <li className="rounded-3xl border border-border p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-primary to-fuchsia-500 text-sm font-bold text-white" aria-hidden>
            {initials(review.author)}
          </span>
          <div>
            <p className="font-semibold">{review.author}</p>
            <p className="text-xs text-muted-foreground">{formatDate(review.date)}</p>
          </div>
        </div>
        <Badge tone="success">
          <Check className="size-3" /> Verified
        </Badge>
      </div>
      <Rating value={review.rating} className="mt-3" />
      <p className="mt-2 text-sm">{review.comment}</p>
    </li>
  );
}

export function Reviews({ product }: { product: Product }) {
  const total = Math.max(1, product.reviews.length);
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr]">
      <div>
        <p className="font-display text-5xl font-bold">{product.rating.toFixed(1)}</p>
        <Rating value={product.rating} size={18} className="mt-2" />
        <p className="mt-1 text-sm text-muted-foreground">Based on {formatNumber(product.reviewCount)} ratings</p>
        <dl className="mt-6 space-y-2">
          {ratingDistribution(product.reviews).map(({ star, count }) => (
            <div key={star} className="flex items-center gap-3 text-sm">
              <dt className="w-3">{star}</dt>
              <dd className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full origin-left animate-grow rounded-full bg-amber-400" style={{ width: `${(count / total) * 100}%` }} />
              </dd>
              <dd className="w-6 text-right text-muted-foreground">{count}</dd>
            </div>
          ))}
        </dl>
      </div>
      <ul className="space-y-4">
        {product.reviews.length === 0 && <li className="text-muted-foreground">No written reviews yet.</li>}
        {product.reviews.map((r) => (
          <ReviewCard key={r.id} review={r} />
        ))}
      </ul>
    </div>
  );
}
