import React, { createContext, useContext, useEffect, useState } from "react";
import { setAuthToken, fetchFacilitatorProfile } from "./api";

const SESSION_KEY = "grm-demo-session";
const PROFILE_KEY = "grm-demo-profile";

const AuthContext = createContext(null);

function load(key) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch (_e) {
    return null;
  }
}
function save(key, value) {
  try {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch (_e) {
    /* ignore */
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => load(SESSION_KEY));
  const [profile, setProfile] = useState(() => load(PROFILE_KEY));
  const [ready, setReady] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // Restore token into axios on mount.
  useEffect(() => {
    if (session?.token) setAuthToken(session.token);
    setReady(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load the facilitator profile whenever we have a session but no profile.
  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!session?.token) return;
      if (profile) return;
      try {
        setAuthToken(session.token);
        const p = await fetchFacilitatorProfile();
        if (cancelled) return;
        setProfile(p);
        save(PROFILE_KEY, p);
        setProfileError(null);
      } catch (e) {
        if (cancelled) return;
        const code = e?.response?.status;
        setProfileError(code === 404 ? "no_profile" : "generic");
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [session, profile]);

  function signIn(sessionObj) {
    setAuthToken(sessionObj.token);
    setSession(sessionObj);
    save(SESSION_KEY, sessionObj);
    setProfile(null);
    save(PROFILE_KEY, null);
    setProfileError(null);
  }

  function signOut() {
    setAuthToken(null);
    setSession(null);
    setProfile(null);
    save(SESSION_KEY, null);
    save(PROFILE_KEY, null);
    setProfileError(null);
  }

  function retryProfile() {
    setProfileError(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        ready,
        profileError,
        signIn,
        signOut,
        retryProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
