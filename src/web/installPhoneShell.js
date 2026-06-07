/**
 * Web (desktop) only: style Expo's #root as a centered phone-sized box on a
 * neutral backdrop, with a small title above it. The app renders directly into
 * #root (no iframe), so clicking inputs and typing behave natively.
 *
 * On real phones (narrow viewport) and on native this is a no-op, so the app
 * fills the screen as usual.
 */
import { PHONE_WIDTH, PHONE_HEIGHT, isDesktopWeb } from "./patchDimensions";

if (typeof document !== "undefined" && isDesktopWeb()) {
  const install = () => {
    const root = document.getElementById("root");
    if (!root) {
      requestAnimationFrame(install);
      return;
    }

    document.title = "MGP-BJ — Démo Facilitateur";

    const style = document.createElement("style");
    style.textContent = `
      html, body { height: 100%; margin: 0; }
      body {
        overflow: auto;
        background: radial-gradient(120% 90% at 50% 0%, #f3fbf7 0%, #e4f3ec 45%, #cfe9dd 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        padding: 24px 0;
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      #grm-demo-title {
        flex: 0 0 auto;
        display: flex;
        align-items: baseline;
        gap: 9px;
        color: #1f7a5a;
      }
      #grm-demo-title b { font-size: 21px; font-weight: 700; letter-spacing: 0.3px; }
      #grm-demo-title span { font-size: 12.5px; font-weight: 500; color: #4a9c7c; }
      #root {
        width: ${PHONE_WIDTH}px;
        height: ${PHONE_HEIGHT}px;
        flex: 0 0 auto !important;
        box-sizing: border-box;
        border-radius: 26px;
        overflow: hidden;
        background: #fff;
        box-shadow: 0 24px 60px -20px rgba(20,60,45,0.35), 0 8px 22px -12px rgba(0,0,0,0.25);
      }
    `;
    document.head.appendChild(style);

    if (!document.getElementById("grm-demo-title")) {
      const title = document.createElement("div");
      title.id = "grm-demo-title";
      title.innerHTML =
        "<b>MGP-BJ</b><span>Mécanisme de Gestion de Plainte · Démo</span>";
      document.body.insertBefore(title, root);
    }

    // Scale the phone box down with `zoom` when the window is too small to show
    // it 1:1. `zoom` (unlike a transform on an iframe) keeps keyboard input and
    // focus working normally. Dimensions stays pinned at phone size regardless.
    const TITLE_SPACE = 80;
    const fit = () => {
      const z = Math.min(
        1,
        (window.innerHeight - TITLE_SPACE) / PHONE_HEIGHT,
        (window.innerWidth - 32) / PHONE_WIDTH
      );
      root.style.zoom = z > 0 ? String(z) : "1";
    };
    fit();
    window.addEventListener("resize", fit);
  };

  install();
}
