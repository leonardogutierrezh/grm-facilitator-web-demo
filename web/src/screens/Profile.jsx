import React, { useEffect, useState } from "react";
import { t } from "../i18n";
import { useAuth } from "../auth";
import { fetchAssigneeIssues, fetchReporterIssues } from "../api";
import { Header } from "../components";
import { idOf } from "../util";

function initials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

function StatCard({ bg, title, count }) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: 110,
        borderRadius: 15,
        padding: 14,
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        color: "#fff",
      }}
    >
      <span style={{ fontWeight: 700, fontSize: 14 }}>{title}</span>
      <span style={{ fontWeight: 700, fontSize: 30 }}>{count}</span>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        padding: "14px 0",
        borderBottom: "1px solid #f0f0f0",
        textAlign: "center",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 14, color: "#707070" }}>{label}</div>
      <div style={{ fontSize: 12.5, color: "#707070", marginTop: 4 }}>
        {value || "—"}
      </div>
    </div>
  );
}

export default function Profile() {
  const { session, profile, signOut } = useAuth();
  const [counts, setCounts] = useState({ reported: 0, assigned: 0, resolved: 0 });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [a, r] = await Promise.all([
          fetchAssigneeIssues().catch(() => []),
          fetchReporterIssues().catch(() => []),
        ]);
        if (cancelled) return;
        const uid = session?.user_id;
        const assigned = a.filter((i) => idOf(i.assignee) == uid);
        const reported = r.filter((i) => idOf(i.reporter) == uid);
        const resolved = assigned.filter(
          (i) => i.status?.final_status || i.status?.rejected_status
        );
        setCounts({
          reported: reported.length,
          assigned: assigned.length,
          resolved: resolved.length,
        });
      } catch (_e) {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session]);

  const name = profile?.user?.name || session?.username || "";

  return (
    <>
      <Header title={t("profile")} />
      <div className="scroll" style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 18px" }}>
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: "50%",
              background: "var(--primary)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              fontWeight: 600,
            }}
          >
            {initials(name)}
          </div>
        </div>

        <div
          style={{
            color: "#999",
            fontWeight: 700,
            fontSize: 13,
            textTransform: "uppercase",
            padding: "0 0 12px",
          }}
        >
          {t("your_complaint_count")}
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          <StatCard bg="/assets/BG_2.png" title={t("reported")} count={counts.reported} />
          <StatCard bg="/assets/BG_9.png" title={t("assigned")} count={counts.assigned} />
          <StatCard bg="/assets/BG_1.png" title={t("resolved")} count={counts.resolved} />
        </div>

        <div
          style={{
            color: "#999",
            fontWeight: 700,
            fontSize: 13,
            textTransform: "uppercase",
            padding: "6px 0 4px",
          }}
        >
          {t("your_personal_info")}
        </div>
        <InfoRow label={t("full_name")} value={name} />
        <InfoRow label={t("email")} value={session?.username} />
        <InfoRow label={t("region")} value={profile?.administrative_region?.hierarchical_name || profile?.administrative_region?.name} />
        <InfoRow label={t("is_village_secretary")} value={profile?.village_secretary ? "Oui" : "Non"} />

        <div style={{ display: "flex", justifyContent: "center", padding: "24px 0" }}>
          <button
            className="btn btn-primary"
            style={{ padding: "12px 30px" }}
            onClick={signOut}
          >
            {t("logout")}
          </button>
        </div>
      </div>
    </>
  );
}
