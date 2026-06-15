import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";

export const alt = `${BRAND.name} — ${BRAND.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "radial-gradient(60% 60% at 50% 0%, #1e1b4b 0%, #020617 60%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 40, color: "#a5b4fc", fontWeight: 700 }}>
          {BRAND.name}
        </div>
        <div style={{ fontSize: 82, fontWeight: 800, lineHeight: 1.05, marginTop: 24 }}>
          Find the company name
        </div>
        <div
          style={{
            fontSize: 82,
            fontWeight: 800,
            lineHeight: 1.05,
            color: "#818cf8",
          }}
        >
          nobody&apos;s using.
        </div>
        <div style={{ fontSize: 34, color: "#94a3b8", marginTop: 32 }}>
          Brainstorm brandable names · scan availability with evidence
        </div>
      </div>
    ),
    size,
  );
}
