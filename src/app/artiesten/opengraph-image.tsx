import { ImageResponse } from "next/og";
import { artists, hiphopArtists, teknoArtists } from "@/data/artists";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#080808",
        color: "#f5f3ee",
        fontFamily: "Arial, sans-serif",
        position: "relative",
      }}
    >
      <div style={{ width: 125, background: "#ed1613", display: "flex" }} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "68px 72px",
          flex: 1,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 800, letterSpacing: 3 }}>KWARTIER WEST / ROSTER</div>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 900, color: "#ed1613", lineHeight: 0.8 }}>{artists.length}</div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 106,
            fontWeight: 900,
            lineHeight: 0.82,
            letterSpacing: -6,
          }}
        >
          <div style={{ display: "flex" }}>VAN MACHINES</div>
          <div style={{ display: "flex" }}>TOT BARS.</div>
        </div>

        <div style={{ display: "flex", gap: 42, fontSize: 30, textTransform: "uppercase" }}>
          <span>{teknoArtists.length} Tekno</span>
          <span>{hiphopArtists.length} Hip hop</span>
          <span>1 collectief</span>
        </div>
      </div>
    </div>,
    size,
  );
}
