import React, { createContext, useContext, useState, useCallback } from "react";

/**
 * Minimal stack + tab navigation that mimics the mobile app:
 *  - two tabs: "dashboard" and "profile", each with its own screen stack
 *  - navigate() pushes onto the active tab's stack, goBack() pops
 */
const NavContext = createContext(null);

const INITIAL = {
  dashboard: [{ screen: "GRM", params: {} }],
  profile: [{ screen: "Profile", params: {} }],
};

export function NavProvider({ children }) {
  const [tab, setTab] = useState("dashboard");
  const [stacks, setStacks] = useState(INITIAL);

  const navigate = useCallback(
    (screen, params = {}) => {
      setStacks((s) => ({ ...s, [tab]: [...s[tab], { screen, params }] }));
    },
    [tab]
  );

  const goBack = useCallback(() => {
    setStacks((s) => {
      const cur = s[tab];
      if (cur.length <= 1) return s;
      return { ...s, [tab]: cur.slice(0, -1) };
    });
  }, [tab]);

  const switchTab = useCallback((next) => setTab(next), []);

  const resetAll = useCallback(() => {
    setTab("dashboard");
    setStacks(INITIAL);
  }, []);

  const stack = stacks[tab];
  const current = stack[stack.length - 1];
  const canGoBack = stack.length > 1;

  return (
    <NavContext.Provider
      value={{ tab, switchTab, navigate, goBack, current, canGoBack, resetAll }}
    >
      {children}
    </NavContext.Provider>
  );
}

export function useNav() {
  return useContext(NavContext);
}
