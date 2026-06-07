import React, { useEffect, useState } from "react";
import { t } from "../i18n";
import { useNav } from "../nav";
import { useAuth } from "../auth";
import { fetchAssigneeIssues, fetchReporterIssues } from "../api";
import { Header, IconChevronRightCircle, Spinner } from "../components";
import { formatDate, daysSince, idOf, statusColor } from "../util";

const TABS = [
  { key: "reported", label: "reported" },
  { key: "assigned", label: "assigned" },
  { key: "resolved", label: "resolved" },
];

function IssueRow({ item, onPress }) {
  const code = item.tracking_code || item.internal_code || item.id;
  const date = item.intake_date || item.created_date;
  return (
    <button
      onClick={onPress}
      style={{
        width: "100%",
        textAlign: "left",
        background: "none",
        border: "none",
        borderBottom: "1px solid #dedede",
        cursor: "pointer",
        padding: "16px 14px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontFamily: "inherit",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, color: "#707070", marginBottom: 6, fontSize: 14 }}>
          {(item.issue_type?.name || item.category?.name || "Plainte")} - {t("label_reference")} {code}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#707070",
            marginBottom: 4,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.description}
        </div>
        <div style={{ fontSize: 12, color: "#707070" }}>
          {formatDate(date)} | {daysSince(date)} {t("days_ago")}
        </div>
        <div style={{ fontSize: 12, color: "#707070", marginTop: 4 }}>
          {t("status_label")}:{" "}
          <span style={{ color: statusColor(item.status) }}>
            {item.status?.name ?? "—"}
          </span>
        </div>
      </div>
      <IconChevronRightCircle size={24} />
    </button>
  );
}

export default function IssueSummary() {
  const nav = useNav();
  const { session } = useAuth();
  const [tab, setTab] = useState("assigned");
  const [loading, setLoading] = useState(true);
  const [assignee, setAssignee] = useState([]);
  const [reporter, setReporter] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [a, r] = await Promise.all([
          fetchAssigneeIssues().catch(() => []),
          fetchReporterIssues().catch(() => []),
        ]);
        if (cancelled) return;
        const uid = session?.user_id;
        setAssignee(a.filter((i) => idOf(i.assignee) == uid));
        setReporter(r.filter((i) => idOf(i.reporter) == uid));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session]);

  const list =
    tab === "reported"
      ? reporter
      : tab === "resolved"
      ? assignee.filter(
          (i) => i.status?.final_status || i.status?.rejected_status
        )
      : assignee;

  return (
    <>
      <Header title={t("your_summary")} showBack />
      {/* Tab strip */}
      <div style={{ display: "flex", borderBottom: "1px solid #dedede", flex: "0 0 auto" }}>
        {TABS.map((tb) => {
          const active = tab === tb.key;
          return (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              style={{
                flex: 1,
                background: active ? "#f6f6f6" : "none",
                border: "none",
                borderBottom: active ? "3px solid #24c38b" : "3px solid transparent",
                padding: "14px 0",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 14,
                fontWeight: active ? 700 : 400,
                color: active ? "#24c38b" : "#707070",
              }}
            >
              {t(tb.label)}
            </button>
          );
        })}
      </div>
      <div style={{ padding: "10px 14px 0", flex: "0 0 auto" }}>
        <div style={{ color: "#24c38b", fontWeight: 700, fontSize: 13, textTransform: "uppercase" }}>
          {t("your_issues_label")} {t(tab)}
        </div>
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <div className="scroll">
          {list.length === 0 ? (
            <div style={{ textAlign: "center", color: "#999", marginTop: 50 }}>{t("no_results")}</div>
          ) : (
            list.map((item) => (
              <IssueRow key={item.id} item={item} onPress={() => nav.navigate("IssueDetail", { issue: item })} />
            ))
          )}
        </div>
      )}
    </>
  );
}
