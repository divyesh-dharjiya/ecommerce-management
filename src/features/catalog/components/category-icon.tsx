import {
  Armchair,
  Bike,
  Car,
  CookingPot,
  Droplets,
  Dumbbell,
  Flower2,
  Footprints,
  Gem,
  Glasses,
  Headphones,
  Lamp,
  Laptop,
  Shirt,
  ShoppingBag,
  ShoppingBasket,
  Smartphone,
  Sparkles,
  Tablet,
  Tag,
  Watch,
  type LucideIcon,
} from "lucide-react";

/** Allow-list of icons selectable for categories (keeps the bundle tree-shaken). */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Armchair,
  Bike,
  Car,
  CookingPot,
  Droplets,
  Dumbbell,
  Flower2,
  Footprints,
  Gem,
  Glasses,
  Headphones,
  Lamp,
  Laptop,
  Shirt,
  ShoppingBag,
  ShoppingBasket,
  Smartphone,
  Sparkles,
  Tablet,
  Tag,
  Watch,
};

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = CATEGORY_ICONS[name] ?? Tag;
  return <Icon className={className} aria-hidden />;
}
