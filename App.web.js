import React, { useEffect, useState } from "react";
import AppRoot from "./src/AppRoot";
import PhoneFrame from "./src/web/PhoneFrame";

const DESKTOP_MIN_WIDTH = 700; // below this we assume a real phone -> no frame

function isEmbedded() {
  if (typeof window === "undefined") return false;
  try {
    if (window.self !== window.top) return true;
  } catch (_e) {
    // Cross-origin access throws -> we are definitely inside an iframe.
    return true;
  }
  return new URLSearchParams(window.location.search).has("embed");
}

/**
 * Web entry point.
 *
 * On a desktop browser (wide viewport, top-level window) we render a centered
 * iPhone-style bezel containing an <iframe> that loads this same app with
 * `?embed=1`. Running the app inside the iframe means `Dimensions.get('window')`
 * reports the phone-sized viewport, so every screen lays out exactly as it does
 * on a real device.
 *
 * On a phone-sized viewport (or when already embedded) we render the app
 * directly, full-screen.
 */
const App = () => {
  const embedded = isEmbedded();
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= DESKTOP_MIN_WIDTH : true
  );

  useEffect(() => {
    if (embedded) return;
    const onResize = () => setIsDesktop(window.innerWidth >= DESKTOP_MIN_WIDTH);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [embedded]);

  if (!embedded && isDesktop) {
    return <PhoneFrame />;
  }

  return <AppRoot />;
};

export default App;
