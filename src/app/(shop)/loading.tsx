import { Container, Skeleton } from "@/components/ui";
import { ProductGridSkeleton } from "@/features/catalog/components/product-grid";

/** Instant skeleton while a route's server work streams in. */
export default function ShopLoading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <Container className="py-12">
        <Skeleton className="mb-3 h-4 w-32" />
        <Skeleton className="mb-10 h-12 w-72 max-w-full" />
        <ProductGridSkeleton count={8} />
      </Container>
    </div>
  );
}
