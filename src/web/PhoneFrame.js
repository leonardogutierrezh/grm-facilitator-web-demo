import React, { useEffect, useState } from "react";

/**
 * Web-only iPhone-style device frame. Renders a centered device on a neutral
 * backdrop with an <iframe> that loads the app at `?embed=1`. Rendered with
 * plain DOM elements (react-dom under react-native-web).
 */

const SCREEN_W = 384; // logical iPhone screen size (pts)
const SCREEN_H = 832;
const BEZEL = 13; // frame thickness around the screen
const STATUS_H = 44; // faux iOS status bar; also clears the Dynamic Island
const DEVICE_W = SCREEN_W + BEZEL * 2;
const DEVICE_H = SCREEN_H + BEZEL * 2;
const RADIUS = 62;

function nowHHMM() {
  try {
    const d = new Date();
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  } catch (_e) {
    return "9:41";
  }
}

function StatusBar() {
  const bar = (h) => (
    <div style={{ width: 3, height: h, background: "#1d1d1f", borderRadius: 1 }} />
  );
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: SCREEN_W,
        height: STATUS_H,
        zIndex: 5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 30px 0 34px",
        boxSizing: "border-box",
        color: "#1d1d1f",
        pointerEvents: "none",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: 0.2 }}>
        {nowHHMM()}
      </span>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 7 }}>
        {/* signal */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
          {bar(5)}
          {bar(7)}
          {bar(9)}
          {bar(11)}
        </div>
        {/* battery */}
        <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
          <div
            style={{
              width: 24,
              height: 12,
              border: "1.4px solid #1d1d1f",
              borderRadius: 3.5,
              padding: 1.5,
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "78%",
                height: "100%",
                background: "#1d1d1f",
                borderRadius: 1.5,
              }}
            />
          </div>
          <div style={{ width: 1.6, height: 4, background: "#1d1d1f", borderRadius: 1 }} />
        </div>
      </div>
    </div>
  );
}

function computeScale() {
  if (typeof window === "undefined") return 1;
  const vPad = 96; // leave room for the title above + caption below
  const hPad = 48;
  const scaleH = (window.innerHeight - vPad) / DEVICE_H;
  const scaleW = (window.innerWidth - hPad) / DEVICE_W;
  return Math.max(0.45, Math.min(1, scaleH, scaleW));
}

const sideButton = (extra) => ({
  position: "absolute",
  background: "linear-gradient(180deg, #3a3a3e 0%, #1c1c1f 100%)",
  borderRadius: 3,
  ...extra,
});

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
        gap: 14,
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
        {/* Device body */}
        <div
          style={{
            position: "relative",
            width: DEVICE_W,
            height: DEVICE_H,
            background: "linear-gradient(145deg, #232327 0%, #0a0a0c 45%, #050506 100%)",
            borderRadius: RADIUS,
            padding: BEZEL,
            boxShadow:
              "0 1px 2px rgba(255,255,255,0.18) inset, 0 0 0 2px #000, 0 40px 80px -28px rgba(0,0,0,0.6), 0 12px 28px -14px rgba(0,0,0,0.5)",
          }}
        >
          {/* Side buttons */}
          <div style={sideButton({ left: -2, top: 132, width: 3, height: 28 })} />
          <div style={sideButton({ left: -2, top: 178, width: 3, height: 52 })} />
          <div style={sideButton({ left: -2, top: 244, width: 3, height: 52 })} />
          <div style={sideButton({ right: -2, top: 200, width: 3, height: 84 })} />

          {/* Screen */}
          <div
            style={{
              position: "relative",
              width: SCREEN_W,
              height: SCREEN_H,
              borderRadius: RADIUS - BEZEL,
              overflow: "hidden",
              background: "#ffffff",
            }}
          >
            <StatusBar />
            <iframe
              title="MGP-BJ Demo"
              src={embedSrc}
              allow="geolocation; microphone; camera; clipboard-write"
              style={{
                position: "absolute",
                top: STATUS_H,
                left: 0,
                width: SCREEN_W,
                height: SCREEN_H - STATUS_H,
                border: "none",
                display: "block",
              }}
            />
            {/* Dynamic Island */}
            <div
              style={{
                position: "absolute",
                top: 11,
                left: "50%",
                transform: "translateX(-50%)",
                width: 104,
                height: 29,
                background: "#000",
                borderRadius: 16,
                pointerEvents: "none",
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingRight: 9,
                boxSizing: "border-box",
              }}
            >
              {/* camera lens */}
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 35%, #2b3a4a 0%, #05070a 70%)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 11.5, color: "#6aa48d" }}>
        Cliquez dans le téléphone pour utiliser l'application
      </div>
    </div>
  );
};

export default PhoneFrame;
