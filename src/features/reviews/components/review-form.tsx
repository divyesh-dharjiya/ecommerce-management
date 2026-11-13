"use client";

import { toast } from "sonner";
import { useForm } from "@/hooks";
import { Button, Field, Input, Textarea } from "@/components/ui";
import { useOrderStore } from "@/features/orders/store/order-store";
import { useReviewStore } from "@/features/reviews/store/review-store";
import { REVIEW_LIMITS, validateReview, type ReviewDraft } from "@/features/reviews/services/reviews";
import { StarInput } from "@/features/reviews/components/star-input";
import type { Product } from "@/types";

const EMPTY: ReviewDraft = { author: "", rating: 0, comment: "" };

/** Write-a-review form. A review counts as "verified" when this shopper has ordered the product. */
export function ReviewForm({ product, onDone }: { product: Product; onDone: () => void }) {
  const addReview = useReviewStore((s) => s.addReview);
  const purchased = useOrderStore((s) =>
    s.orders.some(
      (o) => o.source === "web" && o.status !== "cancelled" && o.lines.some((l) => l.productId === product.id),
    ),
  );
  const { values, errors, bind, setField, validate } = useForm<ReviewDraft>(EMPTY, validateReview);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) return;
    addReview(product, values, purchased);
    toast.success("Thanks for your review!", { description: "It is now live on this product." });
    onDone();
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5 rounded-xl border border-border p-5">
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Your rating</legend>
        {/* id="rating" lets useForm move focus here when the rating is missing. */}
        <div id="rating" tabIndex={-1} className="outline-none">
          <StarInput
            value={values.rating}
            onChange={(stars) => setField("rating", stars)}
            invalid={!!errors.rating}
            describedBy={errors.rating ? "rating-error" : undefined}
          />
        </div>
        {errors.rating && (
          <p id="rating-error" role="alert" className="mt-1.5 text-xs font-medium text-danger">
            {errors.rating}
          </p>
        )}
      </fieldset>
      <Field label="Name shown with your review" htmlFor="author" error={errors.author}>
        <Input {...bind("author")} autoComplete="given-name" maxLength={REVIEW_LIMITS.authorMax} />
      </Field>
      <Field
        label="Your review"
        htmlFor="comment"
        error={errors.comment}
        hint={`${values.comment.trim().length}/${REVIEW_LIMITS.commentMax} · What did you like or dislike?`}
      >
        <Textarea {...bind("comment")} rows={4} maxLength={REVIEW_LIMITS.commentMax} />
      </Field>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit">Post review</Button>
      </div>
    </form>
  );
}
