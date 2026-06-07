// Web demo config. Requests go to a same-origin path ("/api/...") which is
// proxied to the real backend by Vercel rewrites (see vercel.json). This avoids
// browser CORS entirely without touching the backend.
export const config = {
    API_AUTH_BASE_URL: "/api",
    COUCHDB_BASE_URL: "/api",
    USER_SESSION_KEY: "grmapp-prod-session-key",
    USER_PROFILE_KEY: "grmapp-prod-profile-key",
}
