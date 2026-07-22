import { ImageResponse } from "next/og";
import { site, doctor, contact } from "@/lib/site";
import { routing } from "@/i18n/routing";

// Without this the card is generated per request; with it, both locales are
// baked at build time.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Generated Open Graph card. Using the file convention rather than a static
 * PNG means there is no binary asset to keep in sync with the brand.
 *
 * Deliberately no custom font: loading one would need a network fetch at build
 * time. The system sans reads cleanly at this size.
 */
export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "linear-gradient(135deg, #044B4D 0%, #0A5456 45%, #4E621F 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Mark drawn with boxes — any glyph outside the embedded font
                makes Satori attempt a network font fetch, which fails at
                build time. Keep this file ASCII-only. */}
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "60% 40% 55% 45%",
                background: "#B8CD80",
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, fontWeight: 600 }}>{site.shortName}</div>
            <div
              style={{
                fontSize: 15,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.65)",
                marginTop: 4,
              }}
            >
              Health Care
            </div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 22,
              letterSpacing: 5,
              textTransform: "uppercase",
              color: "#B8CD80",
              marginBottom: 24,
            }}
          >
            Homeopathy - Hair and Skin Care
          </div>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.1 }}>
            Healthy Hair.
          </div>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.1, color: "#D3E1AE" }}>
            Whole-body Healing.
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(255,255,255,0.2)",
            paddingTop: 28,
            fontSize: 24,
            color: "rgba(255,255,255,0.8)",
          }}
        >
          {/* Satori treats sibling JSX expressions as separate child nodes, so
              these must each be one template string. */}
          <div>{`${doctor.name}, ${doctor.credentials}`}</div>
          <div>{`${contact.address.city}, ${contact.address.state}`}</div>
        </div>
      </div>
    ),
    size,
  );
}
