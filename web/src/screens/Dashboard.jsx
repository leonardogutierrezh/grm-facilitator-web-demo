import React from "react";
import { t } from "../i18n";
import { useNav } from "../nav";
import { Header, IconChevronRightCircle, IconSync } from "../components";

function BigCard({ bg, title, icon, onPress }) {
  return (
    <button
      onClick={onPress}
      style={{
        display: "block",
        width: "100%",
        minHeight: 150,
        border: "none",
        cursor: "pointer",
        borderRadius: 20,
        marginBottom: 18,
        padding: 16,
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxShadow: "0 8px 18px -10px rgba(0,0,0,0.35)",
        position: "relative",
        textAlign: "left",
      }}
    >
      <span
        style={{
          color: "#fff",
          fontSize: 20,
          fontWeight: 700,
          lineHeight: "24px",
          display: "block",
          maxWidth: "70%",
        }}
      >
        {title}
      </span>
      <span
        style={{
          position: "absolute",
          right: 16,
          bottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {icon}
        <IconChevronRightCircle />
      </span>
    </button>
  );
}

function SmallCard({ bg, title, icon, onPress }) {
  return (
    <button
      onClick={onPress}
      style={{
        flex: 1,
        minHeight: 150,
        border: "none",
        cursor: "pointer",
        borderRadius: 16,
        padding: 14,
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxShadow: "0 8px 18px -12px rgba(0,0,0,0.35)",
        position: "relative",
        textAlign: "left",
      }}
    >
      <span style={{ color: "#fff", fontSize: 19, fontWeight: 700, lineHeight: "22px", display: "block" }}>
        {title}
      </span>
      <span style={{ position: "absolute", left: 14, bottom: 14, display: "flex" }}>{icon}</span>
      <span style={{ position: "absolute", right: 14, bottom: 14, display: "flex" }}>
        <IconChevronRightCircle size={22} />
      </span>
    </button>
  );
}

function ChartIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 17 9 11 13 15 21 7" />
      <polyline points="14 7 21 7 21 14" />
    </svg>
  );
}
function FileIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
    </svg>
  );
}
function TeamIcon() {
  return (
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export default function Dashboard() {
  const nav = useNav();
  return (
    <>
      <Header
        title={t("label_grm")}
        showSearch
        onSearch={() => nav.navigate("IssueSummary")}
      />
      <div className="scroll" style={{ padding: "18px" }}>
        <h1
          style={{
            margin: "2px 4px 16px",
            fontSize: 22,
            fontWeight: 600,
            color: "#1c1c1e",
          }}
        >
          {t("dashboard")}
        </h1>

        <BigCard
          bg="/assets/BG_9.png"
          title={t("collect_reports")}
          icon={<TeamIcon />}
          onPress={() => alert("Démo : la collecte de plaintes sera disponible prochainement.")}
        />
        <BigCard
          bg="/assets/purpleBg.png"
          title={t("search_reports")}
          icon={<IconSync />}
          onPress={() => nav.navigate("IssueSummary")}
        />

        <p
          style={{
            color: "#999",
            fontSize: 14,
            fontWeight: 700,
            textTransform: "uppercase",
            padding: "16px 6px 10px",
            margin: 0,
          }}
        >
          {t("account_insights")}
        </p>
        <div style={{ display: "flex", gap: 14 }}>
          <SmallCard
            bg="/assets/BG_1.png"
            title={t("diagnostics")}
            icon={<ChartIcon />}
            onPress={() => nav.switchTab("profile")}
          />
          <SmallCard
            bg="/assets/BG_2.png"
            title={t("information")}
            icon={<FileIcon />}
            onPress={() => alert("Démo : section Information à venir.")}
          />
        </div>
      </div>
    </>
  );
}
