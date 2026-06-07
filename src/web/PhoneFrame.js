import React, { useEffect, useState } from "react";

/**
 * Web-only iPhone-style device frame. Renders a centered bezel on a neutral
 * backdrop with an <iframe> that loads the app at `?embed=1`. Rendered with
 * plain DOM elements (react-dom under react-native-web).
 */

const SCREEN_W = 390; // logical iPhone screen size (pts)
const SCREEN_H = 844;
const BEZEL = 14; // black border thickness around the screen
const DEVICE_W = SCREEN_W + BEZEL * 2;
const DEVICE_H = SCREEN_H + BEZEL * 2;

function computeScale() {
  if (typeof window === "undefined") return 1;
  const vPad = 48; // breathing room top/bottom
  const scaleH = (window.innerHeight - vPad) / DEVICE_H;
  const scaleW = (window.innerWidth - vPad) / DEVICE_W;
  return Math.max(0.4, Math.min(1, scaleH, scaleW));
}

const PhoneFrame = () => {
  const [scale, setScale] = useState(computeScale());

  useEffect(() => {
    const onResize = () => setScale(computeScale());
    window.addEventListener("resize", onResize);

    // Reset page chrome so the backdrop fills the viewport.
    const prevBodyMargin = document.body.style.margin;
    const prevBodyBg = document.body.style.background;
    const prevHtmlHeight = document.documentElement.style.height;
    document.body.style.margin = "0";
    document.documentElement.style.height = "100%";
    document.body.style.background =
      "radial-gradient(circle at 50% 30%, #eafaf3 0%, #dcefe4 35%, #c7e7d8 100%)";
    document.title = "MGP-BJ — Démo Facilitateur";

    return () => {
      window.removeEventListener("resize", onResize);
      document.body.style.margin = prevBodyMargin;
      document.body.style.background = prevBodyBg;
      document.documentElement.style.height = prevHtmlHeight;
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
        gap: 18,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "#1f7a5a",
          opacity: 0.9,
        }}
      >
        <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 0.3 }}>
          MGP-BJ
        </span>
        <span style={{ fontSize: 13, fontWeight: 500, color: "#3c8f70" }}>
          Mécanisme de Gestion de Plainte · Démo
        </span>
      </div>

      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {/* Device body */}
        <div
          style={{
            position: "relative",
            width: DEVICE_W,
            height: DEVICE_H,
            background: "#0b0b0d",
            borderRadius: 58,
            padding: BEZEL,
            boxShadow:
              "0 2px 4px rgba(0,0,0,0.25), 0 30px 60px -20px rgba(0,0,0,0.55), inset 0 0 0 2px #2a2a2e",
          }}
        >
          {/* Screen */}
          <div
            style={{
              position: "relative",
              width: SCREEN_W,
              height: SCREEN_H,
              borderRadius: 46,
              overflow: "hidden",
              background: "#ffffff",
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
            {/* Dynamic-island / notch */}
            <div
              style={{
                position: "absolute",
                top: 9,
                left: "50%",
                transform: "translateX(-50%)",
                width: 118,
                height: 33,
                background: "#0b0b0d",
                borderRadius: 20,
                pointerEvents: "none",
                zIndex: 10,
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ fontSize: 12, color: "#5a8f7c", opacity: 0.85 }}>
        Cliquez dans le téléphone pour utiliser l'application
      </div>
    </div>
  );
};

export default PhoneFrame;
