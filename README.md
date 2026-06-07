# GRM Facilitator — Web Demo (MGP-BJ)

A **web replica** of the GRM facilitator mobile app (`grm-mobile`), built so the app
can be demoed in any desktop browser — no app store install required. It renders
inside an **iPhone-style phone frame** so it feels like the real mobile app, and
connects to the **live production backend**
(`https://grm-web-app-benin.vercel.app`).

This is the same React Native / Expo codebase as the mobile app, exported for web
via `react-native-web`. The only functional differences from the native app are
listed under [Demo-specific changes](#demo-specific-changes).

> The original mobile-app README is preserved as [`README.mobile.md`](README.mobile.md).

## Demo credentials

Use a **facilitator** account (these are seeded in the backend demo data):

| Field    | Value                            |
| -------- | -------------------------------- |
| Email    | `facilitator-1@grm-benin.local`  |
| Password | `demo`                           |

Other facilitators `facilitator-2@…`, `facilitator-3@…` (same password) also work.
> The `demo` / `demo` superuser is for the Django admin dashboard, **not** the
> facilitator app — it has no facilitator profile and will show a profile error.

## How it works

- **Phone frame** — On a desktop browser the app renders a centered iPhone bezel
  containing an `<iframe>` that loads the app at `?embed=1`. Running inside the
  iframe means `Dimensions.get('window')` reports the phone-sized viewport, so
  every screen lays out exactly like a real device. On a phone-sized viewport the
  app renders full-screen with no frame.
- **API / CORS** — The browser calls a same-origin path `/api/...`, which Vercel
  rewrites (see [`vercel.json`](vercel.json)) to the real backend. This avoids
  browser CORS entirely with **no backend changes**.
- **No offline database** — The native app uses WatermelonDB (SQLite) for offline
  support. The web demo drops it and reads/writes the remote API directly.
  WatermelonDB, SQLite and other native-only modules are stubbed for the web
  build (see [`web-stubs/`](web-stubs) and [`metro.config.js`](metro.config.js)).

## Local development

```bash
yarn install
npx expo export --platform web --output-dir dist   # build static site -> dist/
node scripts/serve-dist.js 4321                     # static server + /api proxy
# open http://localhost:4321
```

`scripts/serve-dist.js` proxies `/api/*` to the live backend, exactly like the
Vercel rewrite, so the local build behaves identically to production.

## Deploy

Configured for Vercel (static export + rewrites in `vercel.json`):

- **Build command:** `npx expo export --platform web --output-dir dist`
- **Output directory:** `dist`

## Demo-specific changes

These are the only deviations from the native `grm-mobile` source:

1. **Data layer is remote-only** — WatermelonDB / offline sync removed
   (`storageManager.web.ts`, `privateRoutes.web.tsx`, `store/index.web.js`,
   `web-stubs/`, metro web aliases).
2. **API base URL** is `/api` (same-origin proxy) instead of the absolute backend
   URL, and issue repositories use relative paths so they resolve through it.
3. **Login validation relaxed** — the native app requires an email-format
   username and an 8+ char complex password; the demo accounts use the short
   password `demo`, so the email-pattern and password min-length/complexity rules
   were relaxed in `src/screens/Auth/Login/Login.js`.
4. **Phone-frame wrapper** added for desktop browsers (`App.web.js`,
   `src/web/PhoneFrame.js`).
