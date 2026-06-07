import React, { useEffect, useState } from "react";
import { t } from "../i18n";
import { fetchIssue, fetchIssueComments } from "../api";
import { Header, IconChevronCircle } from "../components";
import { formatDate, daysSince } from "../util";

function Row({ label, value }) {
  return (
    <div style={{ margin: "6px 0" }}>
      <span style={{ fontWeight: 700, fontSize: 13, color: "#707070" }}>{label} </span>
      <span style={{ fontWeight: 400, fontSize: 12.5, color: "#707070" }}>
        {value || t("information_not_available")}
      </span>
    </div>
  );
}

function Separator() {
  return <div style={{ height: 1, background: "#dedede", margin: "8px 0" }} />;
}

function Collapsible({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "8px 0",
          fontFamily: "inherit",
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 13, color: "#707070" }}>{title}</span>
        <IconChevronCircle up={open} size={26} />
      </button>
      {open && (
        <div
          style={{
            borderRadius: 10,
            padding: 14,
            marginTop: 5,
            marginBottom: 4,
            background: "#fff",
            border: "1px solid #f0f0f0",
            fontSize: 12.5,
            color: "#707070",
            lineHeight: "16px",
          }}
        >
          {children}
        </div>
      )}
    </>
  );
}

function TabStrip({ tab, setTab }) {
  const tabs = ["actions", "details", "history"];
  return (
    <div style={{ display: "flex", borderBottom: "1px solid #ededed", flex: "0 0 auto" }}>
      {tabs.map((key) => {
        const active = tab === key;
        return (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              borderBottom: active ? "3px solid #24c38b" : "3px solid transparent",
              padding: "12px 0",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: active ? 700 : 500,
              letterSpacing: 0.5,
              color: active ? "#24c38b" : "#9bbcb0",
            }}
          >
            {t(key)}
          </button>
        );
      })}
    </div>
  );
}

export default function IssueDetail({ issue: initial }) {
  const [tab, setTab] = useState("details");
  const [issue, setIssue] = useState(initial);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const full = await fetchIssue(initial.id);
        if (!cancelled && full) setIssue({ ...initial, ...full });
      } catch (_e) {
        /* keep list data */
      }
      try {
        const c = await fetchIssueComments(initial.id);
        if (!cancelled) setComments(c);
      } catch (_e) {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initial]);

  const date = issue.intake_date || issue.created_date;

  return (
    <>
      <Header title={t("grm_management")} showBack />
      <TabStrip tab={tab} setTab={setTab} />

      {tab === "details" && (
        <div className="scroll" style={{ padding: 18 }}>
          <div
            style={{
              borderRadius: 10,
              background: "#fff",
              boxShadow: "0 3px 15px rgba(0,0,0,0.06)",
              padding: 14,
            }}
          >
            <div style={{ textAlign: "right", color: "#24c38b", fontSize: 12, marginBottom: 10 }}>
              {t("took_place_on")}: {formatDate(date)} | {daysSince(date)} {t("days_ago")}
            </div>

            <Row label={t("type")} value={issue.issue_type?.name} />
            <Row label={t("name")} value={issue.citizen?.name} />
            <Row label={t("age")} value={issue.citizen_age_group?.name} />
            <Row label={t("sub_type")} value={issue.issue_sub_type?.name} />
            <Row label={t("category")} value={issue.category?.name} />
            <Row label={t("location")} value={issue.administrative_region?.name} />
            <Row label={t("assigned_to")} value={issue.assignee?.name || t("pending_assignment")} />

            <Separator />
            <Collapsible title={t("component")}>
              {issue.component?.name || t("information_not_available")}
            </Collapsible>
            <Separator />
            <Collapsible title={t("description_label")}>
              {issue.description || t("information_not_available")}
            </Collapsible>
            <Separator />
            <Collapsible title={t("decision")}>
              {issue.research_result || t("information_not_available")}
            </Collapsible>
            <Separator />
            <Collapsible title={t("satisfaction")}>
              {t("information_not_available")}
            </Collapsible>
            <Separator />
            <Collapsible title={t("appeal_reason")}>
              {issue.appeal_reason || t("information_not_available")}
            </Collapsible>
            <Separator />
          </div>
        </div>
      )}

      {tab === "history" && (
        <div className="scroll" style={{ padding: 18 }}>
          {comments.length === 0 ? (
            <div style={{ textAlign: "center", color: "#999", marginTop: 40 }}>{t("no_results")}</div>
          ) : (
            comments.map((c, i) => (
              <div
                key={c.id ?? i}
                style={{
                  borderBottom: "1px solid #ededed",
                  padding: "12px 4px",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13, color: "#707070" }}>
                  {c.user?.name || c.name || "—"}
                </div>
                <div style={{ fontSize: 11, color: "#9aa0a6", marginBottom: 4 }}>
                  {formatDate(c.created_date || c.due_date)}
                </div>
                <div style={{ fontSize: 12.5, color: "#707070" }}>{c.comment}</div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "actions" && (
        <div className="scroll" style={{ padding: 24, textAlign: "center", color: "#9aa0a6" }}>
          <p style={{ marginTop: 30, fontSize: 13, lineHeight: "20px" }}>
            Démo en lecture seule — la prise d'actions (accepter, rejeter, escalader, résoudre)
            est désactivée dans cette version de démonstration.
          </p>
        </div>
      )}
    </>
  );
}
