import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Aden Power research portfolio";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "linear-gradient(120deg, #f8fafc, #e2e8f0)",
          padding: "72px",
          color: "#0f172a",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            marginBottom: 20,
          }}
        >
          Aden Power
        </div>
        <div
          style={{
            fontSize: 34,
            opacity: 0.9,
            maxWidth: 900,
          }}
        >
          AI safety research portfolio, resume, and technical outputs.
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
