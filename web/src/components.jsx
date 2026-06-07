import React, { useState } from "react";
import { useNav } from "./nav";
import { t } from "./i18n";

const C = "#24c38b";

/* ---------------- Icons (inline SVG) ---------------- */
export const IconHome = ({ color = "currentColor", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
export const IconUser = ({ color = "currentColor", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
export const IconSearch = ({ color = C, size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
export const IconBack = ({ color = C, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);
export const IconChevronRightCircle = ({ color = C, size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <circle cx="12" cy="12" r="12" opacity="0.55" />
    <path d="M10 7l5 5-5 5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const IconChevronCircle = ({ up = false, color = C, size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <circle cx="12" cy="12" r="12" />
    <path d={up ? "M8 14l4-4 4 4" : "M8 10l4 4 4-4"} fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const IconAccount = ({ color = C, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6z" />
  </svg>
);
export const IconEye = ({ off = false, color = C, size = 22 }) => (
  off ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
);
export const IconSync = ({ color = "#fff", size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

/* ---------------- Header ---------------- */
export function Header({ title, showBack = false, showSearch = false, onSearch }) {
  const nav = useNav();
  return (
    <div className="app-header">
      {showBack && (
        <button className="back" onClick={() => nav.goBack()} aria-label="Retour">
          <IconBack />
        </button>
      )}
      <div className="title">
        <div className="t">{title}</div>
        <div className="v">v 1.0.0</div>
      </div>
      {showSearch && (
        <button className="search" onClick={onSearch} aria-label="Rechercher">
          <IconSearch />
        </button>
      )}
    </div>
  );
}

/* ---------------- Bottom tab bar ---------------- */
export function TabBar() {
  const nav = useNav();
  return (
    <div className="tabbar">
      <button className={nav.tab === "dashboard" ? "active" : ""} onClick={() => nav.switchTab("dashboard")}>
        <IconHome color={nav.tab === "dashboard" ? C : "#9aa0a6"} />
        <span>{t("dashboard")}</span>
      </button>
      <button className={nav.tab === "profile" ? "active" : ""} onClick={() => nav.switchTab("profile")}>
        <IconUser color={nav.tab === "profile" ? C : "#9aa0a6"} />
        <span>{t("profile")}</span>
      </button>
    </div>
  );
}

/* ---------------- Text field (outlined, label, left icon) ---------------- */
export function Field({ label, icon, value, onChange, type = "text", autoFocus, leftButton, onLeftButton }) {
  return (
    <div className="field">
      {leftButton ? (
        <button type="button" className="field-icon" onClick={onLeftButton} tabIndex={-1}>
          {icon}
        </button>
      ) : (
        <span className="field-icon">{icon}</span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoComplete="off"
      />
      <span className="field-label">{label}</span>
    </div>
  );
}

export function Spinner() {
  return (
    <div className="center-fill">
      <div className="spinner" />
    </div>
  );
}

export const IconRightSquare = ({ enabled = true, size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={enabled ? C : "#e6e6e6"}>
    <rect x="2" y="2" width="20" height="20" rx="4" />
    <path d="M10 8l4 4-4 4" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const IconHelp = ({ size = 22, color = "#9aa0a6" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .8-1 1.7" />
    <line x1="12" y1="17" x2="12" y2="17" />
  </svg>
);
export const IconPhone = ({ size = 30, color = C }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.3 1z" />
  </svg>
);
export const IconWhatsapp = ({ size = 30, color = C }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.5A10 10 0 1 0 12 2zm0 2a8 8 0 0 1 6.5 12.7l-.3.4.6 2-2-.6-.4.2A8 8 0 1 1 12 4zm-3 4c-.3 0-.6.1-.8.4-.3.3-1 1-1 2.3s1 2.7 1.2 2.9c.1.2 2 3.1 4.9 4.2 2.4.9 2.9.7 3.4.7s1.6-.7 1.9-1.3c.2-.6.2-1.2.2-1.3l-.9-.5s-1.3-.6-1.5-.7c-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1s-1-.4-1.9-1.2c-.7-.6-1.2-1.4-1.3-1.6s0-.4.1-.5l.4-.5c.1-.2.1-.3.2-.5s0-.4 0-.5-.5-1.3-.7-1.8c-.2-.4-.4-.4-.5-.4z" />
  </svg>
);

/* Centered modal dialog */
export function Modal({ title, children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: 18,
          width: "100%",
          maxWidth: 330,
          boxShadow: "0 16px 40px rgba(0,0,0,0.3)",
        }}
      >
        {title && (
          <div style={{ fontWeight: 700, color: "#707070", fontSize: 16, marginBottom: 12, textAlign: "center" }}>
            {title}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
