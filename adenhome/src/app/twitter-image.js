import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Aden Power portfolio";
export const size = {
  width: 1200,
  height: 600,
};
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#0f172a",
          padding: "64px",
          color: "#f8fafc",
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          Aden Power
        </div>
        <div
          style={{
            fontSize: 30,
            opacity: 0.9,
            marginTop: 16,
          }}
        >
          AI safety research, resume builder, and PDF outputs
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
