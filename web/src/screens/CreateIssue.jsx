import React, { useEffect, useMemo, useState } from "react";
import { t } from "../i18n";
import { useNav } from "../nav";
import { useAuth } from "../auth";
import {
  fetchIssueTypes,
  fetchIssueSubTypes,
  fetchIssueCategories,
  fetchRegions,
  fetchAgeGroups,
  fetchIssueStatuses,
  createIssue,
} from "../api";
import { Header, Spinner } from "../components";
import { idOf } from "../util";

function genTrackingCode() {
  const rnd = Math.random().toString(36).slice(2, 7).toUpperCase();
  const ts = Date.now().toString(36).toUpperCase().slice(-5);
  return `WEB-${ts}-${rnd}`;
}

function Select({ label, value, onChange, options, placeholder }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <select className="form-control" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder || t("f_select")}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name || o.hierarchical_name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function CreateIssue() {
  const nav = useNav();
  const { session } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [createdCode, setCreatedCode] = useState(null);

  const [ref, setRef] = useState({ types: [], subtypes: [], categories: [], regions: [], ages: [], statuses: [] });
  const [form, setForm] = useState({
    issue_type: "",
    issue_sub_type: "",
    category: "",
    description: "",
    region: "",
    location_description: "",
    citizen_name: "",
    age_group: "",
    confidential: false,
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [types, subtypes, categories, regions, ages, statuses] = await Promise.all([
        fetchIssueTypes().catch(() => []),
        fetchIssueSubTypes().catch(() => []),
        fetchIssueCategories().catch(() => []),
        fetchRegions().catch(() => []),
        fetchAgeGroups().catch(() => []),
        fetchIssueStatuses().catch(() => []),
      ]);
      if (cancelled) return;
      setRef({ types, subtypes, categories, regions, ages, statuses });
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // subtypes filtered by selected type (parent)
  const subtypeOptions = useMemo(
    () => ref.subtypes.filter((s) => String(idOf(s.parent)) === String(form.issue_type)),
    [ref.subtypes, form.issue_type]
  );

  // leaf regions only (those that are not a parent of another region) — keeps the list usable
  const regionOptions = useMemo(() => {
    const parents = new Set(ref.regions.map((r) => idOf(r.parent)).filter((p) => p != null).map(String));
    const leaves = ref.regions.filter((r) => !parents.has(String(r.id)));
    return (leaves.length ? leaves : ref.regions).map((r) => ({
      id: r.id,
      name: r.hierarchical_name || r.name,
    }));
  }, [ref.regions]);

  const step0Valid = form.issue_type && form.issue_sub_type && form.category && form.description.trim();
  const step1Valid = !!form.region;

  async function submit() {
    setError(null);
    if (!step0Valid || !step1Valid) {
      setError(t("fill_required"));
      return;
    }
    setSubmitting(true);
    try {
      const initial = ref.statuses.find((s) => s.initial_status);
      const body = {
        description: form.description.trim(),
        category: Number(form.category),
        issue_type: Number(form.issue_type),
        issue_sub_type: Number(form.issue_sub_type),
        contact_medium: "anonymous",
        contact_information: "",
        tracking_code: genTrackingCode(),
        intake_date: new Date().toISOString(),
        ongoing_issue: false,
        location_description: form.location_description || "",
        administrative_region: Number(form.region),
        reporter: session?.user_id,
        ...(initial ? { status: initial.id } : {}),
        citizen: {
          name: form.citizen_name.trim() || "Anonyme",
          age_group: form.age_group ? Number(form.age_group) : null,
          type: form.confidential ? "keep_name_confidential" : null,
          group: null,
          group_2: null,
        },
      };
      const created = await createIssue(body);
      setCreatedCode(created?.tracking_code || body.tracking_code);
      setStep(3);
    } catch (e) {
      setError(t("create_failed") + (e?.response?.status ? ` (${e.response.status})` : ""));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <>
        <Header title={t("new_complaint")} showBack />
        <Spinner />
      </>
    );
  }

  // Success screen
  if (step === 3) {
    return (
      <>
        <Header title={t("new_complaint")} />
        <div className="scroll" style={{ padding: 24, textAlign: "center" }}>
          <div style={{ marginTop: 30 }}>
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                background: "var(--primary)",
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
          <p style={{ fontSize: 18, fontWeight: 700, color: "#707070", marginTop: 24 }}>
            {t("complaint_created")}
          </p>
          <p style={{ color: "#707070", marginTop: 18, fontSize: 14 }}>{t("tracking_code_label")}</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: "var(--primary)", letterSpacing: 1 }}>
            {createdCode}
          </p>
          <button
            className="btn btn-primary btn-block"
            style={{ marginTop: 40 }}
            onClick={() => nav.goBack()}
          >
            {t("done")}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={t("new_complaint")} showBack />
      <div className="step-dots">
        {[0, 1, 2].map((i) => (
          <i key={i} className={i === step ? "on" : ""} />
        ))}
      </div>
      <div className="scroll" style={{ padding: 18 }}>
        {step === 0 && (
          <>
            <h3 style={{ color: "#707070", marginTop: 0 }}>{t("step_details_title")}</h3>
            <Select label={t("f_type")} value={form.issue_type} options={ref.types}
              onChange={(v) => { set("issue_type", v); set("issue_sub_type", ""); }} />
            <Select label={t("f_subtype")} value={form.issue_sub_type} options={subtypeOptions}
              onChange={(v) => set("issue_sub_type", v)} />
            <Select label={t("f_category")} value={form.category} options={ref.categories}
              onChange={(v) => set("category", v)} />
            <div className="form-group">
              <label>{t("f_description")}</label>
              <textarea className="form-control" rows={5} value={form.description}
                onChange={(e) => set("description", e.target.value)} />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h3 style={{ color: "#707070", marginTop: 0 }}>{t("step_location_title")}</h3>
            <Select label={t("f_region")} value={form.region} options={regionOptions}
              onChange={(v) => set("region", v)} />
            <div className="form-group">
              <label>{t("f_location_desc")}</label>
              <textarea className="form-control" rows={3} value={form.location_description}
                onChange={(e) => set("location_description", e.target.value)} />
            </div>
            <div className="form-group">
              <label>{t("f_citizen_name")}</label>
              <input className="form-control" value={form.citizen_name}
                onChange={(e) => set("citizen_name", e.target.value)} />
            </div>
            <Select label={t("f_age_group")} value={form.age_group} options={ref.ages}
              onChange={(v) => set("age_group", v)} />
            <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#707070" }}>
              <input type="checkbox" checked={form.confidential}
                onChange={(e) => set("confidential", e.target.checked)} style={{ width: 18, height: 18 }} />
              {t("f_confidential")}
            </label>
          </>
        )}

        {step === 2 && (
          <>
            <h3 style={{ color: "#707070", marginTop: 0 }}>{t("step_confirm_title")}</h3>
            <Confirm label={t("field_type")} value={ref.types.find((x) => x.id == form.issue_type)?.name} />
            <Confirm label={t("field_subtype")} value={subtypeOptions.find((x) => x.id == form.issue_sub_type)?.name} />
            <Confirm label={t("field_category")} value={ref.categories.find((x) => x.id == form.category)?.name} />
            <Confirm label={t("field_region")} value={regionOptions.find((x) => x.id == form.region)?.name} />
            <Confirm label={t("field_description")} value={form.description} />
          </>
        )}

        {error && <p style={{ color: "var(--error)", fontSize: 13 }}>{error}</p>}

        <div style={{ display: "flex", gap: 10, marginTop: 18, marginBottom: 24 }}>
          {step > 0 && (
            <button className="btn" style={{ flex: 1, padding: "13px 0", background: "var(--lightgray)", color: "#fff" }}
              onClick={() => setStep((s) => s - 1)}>
              {t("previous")}
            </button>
          )}
          {step < 2 && (
            <button className="btn btn-primary" style={{ flex: 2, padding: "13px 0" }}
              disabled={(step === 0 && !step0Valid) || (step === 1 && !step1Valid)}
              onClick={() => setStep((s) => s + 1)}>
              {t("next")}
            </button>
          )}
          {step === 2 && (
            <button className="btn btn-primary" style={{ flex: 2, padding: "13px 0" }}
              disabled={submitting} onClick={submit}>
              {submitting ? t("submitting") : t("submit_complaint")}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function Confirm({ label, value }) {
  return (
    <div style={{ padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
      <div style={{ fontWeight: 700, fontSize: 12.5, color: "#9aa0a6" }}>{label}</div>
      <div style={{ fontSize: 14, color: "#707070", marginTop: 2 }}>{value || "—"}</div>
    </div>
  );
}
