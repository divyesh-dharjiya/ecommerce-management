/** Core domain model. Everything persisted to localStorage conforms to these shapes. */

export type ProductStatus = "active" | "draft" | "archived";

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

export interface Product {
  id: string;
  sku: string;
  slug: string;
  title: string;
  description: string;
  brand: string;
  category: string;
  price: number;
  compareAtPrice: number | null;
  rating: number;
  reviewCount: number;
  stock: number;
  tags: string[];
  thumbnail: string;
  images: string[];
  weight?: number;
  dimensions?: Dimensions;
  warranty?: string;
  shipping?: string;
  returnPolicy?: string;
  reviews: Review[];
  soldCount: number;
  isFeatured: boolean;
  isNew: boolean;
  status: ProductStatus;
  createdAt: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  icon: string;
  accent: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: string;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type OrderSource = "web" | "live" | "seed";
export type PaymentMethod = "card" | "upi" | "cod";

export interface OrderLine {
  productId: string;
  title: string;
  thumbnail: string;
  category: string;
  unitPrice: number;
  quantity: number;
}

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  number: string;
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode: string | null;
  status: OrderStatus;
  customer: CustomerDetails;
  paymentMethod: PaymentMethod;
  source: OrderSource;
  createdAt: string;
}

export type SortOption = "featured" | "newest" | "price-asc" | "price-desc" | "rating" | "best-selling" | "discount";

export interface ProductQuery {
  search?: string;
  category?: string;
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  onSale?: boolean;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

export interface ProductQueryResult {
  items: Product[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
}

export interface Coupon {
  code: string;
  description: string;
  type: "percent" | "fixed" | "free-shipping";
  value: number;
  minSubtotal: number;
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  freeShippingRemaining: number;
}

export type LiveEventKind = "purchase" | "restock";

export interface LiveEvent {
  id: string;
  kind: LiveEventKind;
  productId: string;
  productTitle: string;
  thumbnail: string;
  customerName?: string;
  city?: string;
  amount?: number;
  quantity?: number;
  at: string;
}
