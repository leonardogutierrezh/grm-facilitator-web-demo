/**
 * Web (desktop) only: make react-native-web report a fixed phone-sized viewport.
 *
 * The demo renders the app directly into a centered 390x844 "phone" box on
 * desktop (no iframe — iframes broke keyboard focus). Many screens read
 * `Dimensions.get('window')` at module load to size cards/charts/buttons, so we
 * pin those values to phone size here. This module must be imported BEFORE any
 * screen module (see index.js) so the override is in place when they evaluate.
 *
 * On real phones (narrow viewport) and on native we leave Dimensions untouched.
 */
import { Platform, Dimensions } from "react-native";

export const PHONE_WIDTH = 390;
export const PHONE_HEIGHT = 844;
export const DESKTOP_MIN_WIDTH = 700;

// Use screen.width (the physical screen) rather than innerWidth: it's stable
// even very early in load, before the viewport has settled.
export function isDesktopWeb() {
  if (Platform.OS !== "web" || typeof window === "undefined") return false;
  const w =
    (window.screen && window.screen.width) || window.innerWidth || 0;
  return w >= DESKTOP_MIN_WIDTH;
}

if (isDesktopWeb()) {
  const PHONE = {
    width: PHONE_WIDTH,
    height: PHONE_HEIGHT,
    scale: 1,
    fontScale: 1,
  };
  try {
    Dimensions.get = () => ({ ...PHONE });
    // Keep subscribers from overwriting our pinned size on browser resize.
    Dimensions.addEventListener = () => ({ remove() {} });
  } catch (_e) {
    /* ignore if not writable */
  }
}
