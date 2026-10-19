import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

/**
 * Shared Open Graph card renderer (1200×630) used by every
 * `opengraph-image.tsx` route, so social previews share one design.
 */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/**
 * Satori (the OG renderer) can't decode WebP, which the catalogue images use,
 * so remote images are fetched and transcoded to PNG. Failures degrade to a
 * text-only card instead of breaking the build.
 */
export async function loadImageAsPng(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const sharp = (await import("sharp")).default;
    const png = await sharp(Buffer.from(await res.arrayBuffer())).resize(560, 560, { fit: "inside" }).png().toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

function Mark({ size = 56 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        background: "linear-gradient(135deg, #7c3aed, #d946ef, #f97316)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: size * 0.55,
        fontWeight: 800,
      }}
    >
      L
    </div>
  );
}

interface OgCardProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  price?: string;
  image?: string | null;
  accent?: string;
}

export function renderOgCard({ eyebrow, title, subtitle, price, image, accent = "#7c3aed" }: OgCardProps) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0f0d17",
          backgroundImage: `radial-gradient(circle at 85% 30%, ${accent}66, transparent 55%), radial-gradient(circle at 10% 100%, #f9731633, transparent 50%)`,
          color: "white",
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between", paddingRight: image ? 32 : 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Mark />
            <span style={{ fontSize: 34, fontWeight: 800 }}>{siteConfig.name}.</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {eyebrow && <span style={{ fontSize: 24, color: "#c4b5fd", textTransform: "uppercase", letterSpacing: 4 }}>{eyebrow}</span>}
            <span style={{ fontSize: title.length > 40 ? 56 : 68, fontWeight: 800, lineHeight: 1.05, maxWidth: image ? 560 : 1000 }}>{title}</span>
            {subtitle && <span style={{ fontSize: 28, color: "#a1a1aa", maxWidth: image ? 560 : 900 }}>{subtitle}</span>}
          </div>
          {price ? (
            <div style={{ display: "flex" }}>
              <span style={{ fontSize: 40, fontWeight: 800, background: "white", color: "#0f0d17", padding: "10px 28px", borderRadius: 999 }}>{price}</span>
            </div>
          ) : (
            <span style={{ fontSize: 24, color: "#a1a1aa" }}>{siteConfig.tagline}</span>
          )}
        </div>
        {image && (
          <div
            style={{
              width: 480,
              height: 502,
              borderRadius: 40,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img> */}
            <img src={image} alt="" width={420} height={420} style={{ objectFit: "contain" }} />
          </div>
        )}
      </div>
    ),
    OG_SIZE,
  );
}

export function renderIcon(size: number) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent" }}>
        <Mark size={size} />
      </div>
    ),
    { width: size, height: size },
  );
}
