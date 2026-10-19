import { siteConfig } from "@/config/site";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og";

export const alt = `${siteConfig.fullName} — ${siteConfig.tagline}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgCard({
    eyebrow: "100+ curated products",
    title: "Style that moves with you.",
    subtitle: "Tech, fashion, beauty and home — delivered in days.",
  });
}
