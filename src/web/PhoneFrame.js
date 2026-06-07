import React, { useEffect, useState } from "react";

/**
 * Web-only wrapper that renders the app at phone size, centered on a neutral
 * backdrop, with an <iframe> that loads the app at `?embed=1`. No device bezel —
 * just a clean phone-sized screen. Rendered with plain DOM elements
 * (react-dom under react-native-web).
 */

const SCREEN_W = 390; // logical phone screen size (pts)
const SCREEN_H = 844;

function computeScale() {
  if (typeof window === "undefined") return 1;
  const vPad = 72; // room for the title above
  const hPad = 32;
  const scaleH = (window.innerHeight - vPad) / SCREEN_H;
  const scaleW = (window.innerWidth - hPad) / SCREEN_W;
  return Math.max(0.45, Math.min(1, scaleH, scaleW));
}

const PhoneFrame = () => {
  const [scale, setScale] = useState(computeScale());

  useEffect(() => {
    const onResize = () => setScale(computeScale());
    window.addEventListener("resize", onResize);

    const prev = {
      bodyMargin: document.body.style.margin,
      bodyBg: document.body.style.background,
      htmlHeight: document.documentElement.style.height,
      htmlBg: document.documentElement.style.background,
    };
    document.body.style.margin = "0";
    document.documentElement.style.height = "100%";
    const backdrop =
      "radial-gradient(120% 90% at 50% 0%, #f3fbf7 0%, #e4f3ec 45%, #cfe9dd 100%)";
    document.body.style.background = backdrop;
    document.documentElement.style.background = backdrop;
    document.title = "MGP-BJ — Démo Facilitateur";

    return () => {
      window.removeEventListener("resize", onResize);
      document.body.style.margin = prev.bodyMargin;
      document.body.style.background = prev.bodyBg;
      document.documentElement.style.height = prev.htmlHeight;
      document.documentElement.style.background = prev.htmlBg;
    };
  }, []);

  const embedSrc = `${window.location.pathname}?embed=1`;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 9,
          color: "#1f7a5a",
        }}
      >
        <span style={{ fontSize: 21, fontWeight: 700, letterSpacing: 0.3 }}>
          MGP-BJ
        </span>
        <span style={{ fontSize: 12.5, fontWeight: 500, color: "#4a9c7c" }}>
          Mécanisme de Gestion de Plainte · Démo
        </span>
      </div>

      <div style={{ transform: `scale(${scale})`, transformOrigin: "center" }}>
        <div
          style={{
            width: SCREEN_W,
            height: SCREEN_H,
            borderRadius: 24,
            overflow: "hidden",
            background: "#ffffff",
            boxShadow:
              "0 1px 0 rgba(255,255,255,0.6) inset, 0 24px 60px -20px rgba(20,60,45,0.35), 0 8px 22px -12px rgba(0,0,0,0.25)",
          }}
        >
          <iframe
            title="MGP-BJ Demo"
            src={embedSrc}
            allow="geolocation; microphone; camera; clipboard-write"
            style={{
              width: SCREEN_W,
              height: SCREEN_H,
              border: "none",
              display: "block",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PhoneFrame;
