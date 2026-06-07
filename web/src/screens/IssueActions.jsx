import React, { useMemo, useState } from "react";
import { t } from "../i18n";
import { useAuth } from "../auth";
import { updateIssue, addComment } from "../api";
import {
  IconRightSquare,
  IconHelp,
  IconPhone,
  IconWhatsapp,
  Modal,
} from "../components";
import { formatDate, daysSince, idOf, statusColor } from "../util";

function ActionRow({ label, help, enabled, onPress }) {
  const [showHelp, setShowHelp] = useState(false);
  return (
    <div style={{ margin: "10px 0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: "#707070", flex: 1, paddingRight: 8 }}>
          {label}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            onClick={() => enabled && onPress()}
            disabled={!enabled}
            style={{ background: "none", border: "none", padding: 0, cursor: enabled ? "pointer" : "default", display: "flex" }}
          >
            <IconRightSquare enabled={enabled} />
          </button>
          <button
            onClick={() => setShowHelp((s) => !s)}
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }}
          >
            <IconHelp />
          </button>
        </div>
      </div>
      {showHelp && (
        <div style={{ fontSize: 11.5, color: "#8a8f94", background: "#f4f4f4", borderRadius: 8, padding: "8px 10px", marginTop: 6 }}>
          {help}
        </div>
      )}
    </div>
  );
}

function ReasonDialog({ title, placeholder, confirmLabel, onConfirm, onClose, busy }) {
  const [text, setText] = useState("");
  return (
    <Modal title={title} onClose={onClose}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        rows={4}
        style={{
          width: "100%",
          border: "1px solid var(--lightgray)",
          borderRadius: 10,
          padding: 10,
          fontFamily: "inherit",
          fontSize: 14,
          resize: "none",
          outline: "none",
          color: "var(--secondary)",
        }}
      />
      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <button
          className="btn"
          onClick={onClose}
          style={{ flex: 1, padding: "11px 0", background: "var(--lightgray)", color: "#fff" }}
        >
          {t("cancel")}
        </button>
        <button
          className="btn btn-primary"
          disabled={busy}
          onClick={() => onConfirm(text)}
          style={{ flex: 1, padding: "11px 0" }}
        >
          {busy ? "…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

function ConfirmDialog({ title, onConfirm, onClose, busy }) {
  return (
    <Modal title={title} onClose={onClose}>
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <button
          className="btn"
          onClick={onClose}
          style={{ flex: 1, padding: "11px 0", background: "var(--lightgray)", color: "#fff" }}
        >
          {t("cancel")}
        </button>
        <button
          className="btn btn-primary"
          disabled={busy}
          onClick={onConfirm}
          style={{ flex: 1, padding: "11px 0" }}
        >
          {busy ? "…" : t("confirm")}
        </button>
      </div>
    </Modal>
  );
}

export default function IssueActions({ issue, statuses, onViewDetails, onUpdated }) {
  const { session, profile } = useAuth();
  const [dialog, setDialog] = useState(null); // accept|reject|steps|resolution|escalate
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  const getStatus = (flag) => statuses.find((s) => s[flag]);

  const isAssignedToMe = idOf(issue.assignee) == session?.user_id;
  const curStatus = useMemo(() => {
    const sid = idOf(issue.status);
    return statuses.find((s) => s.id == sid) || issue.status || {};
  }, [issue.status, statuses]);

  const acceptEnabled = !!curStatus.initial_status && isAssignedToMe;
  const recordEnabled = !!curStatus.open_status && isAssignedToMe && !issue.escalate_flag;
  const rejectEnabled =
    isAssignedToMe &&
    (acceptEnabled ||
      (!curStatus.final_status && !curStatus.rejected_status && !issue.escalate_flag));
  const escalateEnabled = recordEnabled;

  const name = issue.citizen?.name || "";
  const created = issue.created_date;
  const updated = issue.updated_date || issue.created_date;

  async function run(patch, commentText) {
    setBusy(true);
    try {
      if (patch) await updateIssue(issue.id, patch);
      if (commentText) await addComment(issue.id, commentText).catch(() => {});
      setDialog(null);
      setToast(t("action_done"));
      setTimeout(() => setToast(null), 2200);
      onUpdated && onUpdated();
    } catch (e) {
      alert("Échec de l'action. " + (e?.response?.status || ""));
    } finally {
      setBusy(false);
    }
  }

  const doAccept = () => {
    const s = getStatus("open_status");
    run(s ? { status: s.id } : null, t("issue_was_accepted"));
  };
  const doReject = (reason) => {
    const s = getStatus("rejected_status");
    run(
      { ...(s ? { status: s.id } : {}), reject_flag: true, reject_reason: reason },
      `${t("issue_was_rejected")}: ${reason}`
    );
  };
  const doSteps = (text) => run(null, text);
  const doResolution = (text) => {
    const s = getStatus("final_status");
    run(
      { ...(s ? { status: s.id } : {}), research_result: text },
      `${t("issue_was_resolved")}: ${text}`
    );
  };
  const doEscalate = (text) =>
    run({ escalate_flag: true, escalation_reason: text }, `${t("issue_was_escalated")}: ${text}`);

  const contact = issue.contact_information;
  const showContact = contact && contact !== "*";

  return (
    <div className="scroll" style={{ padding: 20 }}>
      <div style={{ fontSize: 13, color: "#707070", margin: "2px 0" }}>
        {name ? `${name}, ` : ""}
        {t("created_at")}: {formatDate(created)} | {daysSince(created)} {t("days_ago")}
      </div>
      <div style={{ fontSize: 13, color: "#707070", margin: "2px 0" }}>
        {t("updated_at")}: {formatDate(updated)} | {daysSince(updated)} {t("days_ago")}
      </div>
      <div style={{ fontSize: 13, color: "#707070", margin: "2px 0" }}>
        {t("status_label")}:{" "}
        <span style={{ color: statusColor(curStatus) }}>{curStatus.name || "—"}</span>
      </div>
      <p style={{ fontSize: 12.5, color: "#8a8f94", marginTop: 8 }}>
        {(issue.description || "").substring(0, 170)}
      </p>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, margin: "18px 0" }}>
        <button className="btn btn-primary" style={{ padding: "11px 22px", fontSize: 13 }} onClick={onViewDetails}>
          {t("view_details")}
        </button>
        {showContact && issue.contact_method === "phone_number" && (
          <a href={`tel:${contact}`}><IconPhone /></a>
        )}
        {showContact && issue.contact_method === "whatsapp" && (
          <a href={`https://wa.me/${String(contact).replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer">
            <IconWhatsapp />
          </a>
        )}
      </div>

      <div style={{ border: "1px solid var(--lightgray)", borderRadius: 15, padding: 15 }}>
        <ActionRow label={t("accept_issue")} help={t("accept_issue_help")} enabled={acceptEnabled} onPress={() => setDialog("accept")} />
        <ActionRow label={t("reject_issue")} help={t("reject_issue_help")} enabled={rejectEnabled} onPress={() => setDialog("reject")} />
        <ActionRow label={t("record_steps_taken")} help={t("record_steps_help")} enabled={recordEnabled} onPress={() => setDialog("steps")} />
        <ActionRow label={t("record_resolution")} help={t("record_resolution_help")} enabled={recordEnabled} onPress={() => setDialog("resolution")} />
      </div>
      <div style={{ padding: "0 15px" }}>
        <ActionRow label={t("escalate")} help={t("escalate_help")} enabled={escalateEnabled} onPress={() => setDialog("escalate")} />
      </div>

      {dialog === "accept" && (
        <ConfirmDialog title={t("accept_issue")} busy={busy} onConfirm={doAccept} onClose={() => setDialog(null)} />
      )}
      {dialog === "reject" && (
        <ReasonDialog title={t("reject_issue")} placeholder={t("reject_reason_ph")} confirmLabel={t("submit")} busy={busy} onConfirm={doReject} onClose={() => setDialog(null)} />
      )}
      {dialog === "steps" && (
        <ReasonDialog title={t("record_steps_taken")} placeholder={t("steps_ph")} confirmLabel={t("submit")} busy={busy} onConfirm={doSteps} onClose={() => setDialog(null)} />
      )}
      {dialog === "resolution" && (
        <ReasonDialog title={t("record_resolution")} placeholder={t("resolution_ph")} confirmLabel={t("submit")} busy={busy} onConfirm={doResolution} onClose={() => setDialog(null)} />
      )}
      {dialog === "escalate" && (
        <ReasonDialog title={t("escalate")} placeholder={t("escalate_reason_ph")} confirmLabel={t("submit")} busy={busy} onConfirm={doEscalate} onClose={() => setDialog(null)} />
      )}

      {toast && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            right: 16,
            background: "#323232",
            color: "#fff",
            borderRadius: 10,
            padding: "12px 14px",
            textAlign: "center",
            fontSize: 13,
            zIndex: 60,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
