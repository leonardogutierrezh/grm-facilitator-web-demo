import React, { useEffect, useMemo, useState } from "react";
import { t } from "../i18n";
import { useNav } from "../nav";
import { useAuth } from "../auth";
import {
  fetchIssueTypes,
  fetchIssueSubTypes,
  fetchIssueCategories,
  fetchComponents,
  fetchSubComponents,
  fetchRegions,
  fetchAgeGroups,
  fetchCitizenGroups,
  fetchIssueStatuses,
  createIssue,
  uploadAttachment,
} from "../api";
import { Header, Spinner, Modal } from "../components";
import { idOf } from "../util";

const ANON = "anonymous";
const FACILITATOR = "facilitator";
const ALERT = "channel-alert";

const TRACK_WORDS = ["lac", "plaine", "savane", "colline"];
function genTrackingCode() {
  const w = TRACK_WORDS[Math.floor(Math.random() * TRACK_WORDS.length)];
  const n = Math.floor(Math.random() * 9000) + 1000;
  return `${w}${n}`;
}

function StepHeader({ num, title }) {
  return (
    <>
      <div className="step-num">{t(num)}</div>
      <div className="step-title">{title}</div>
    </>
  );
}

function Radio({ checked, label, onClick }) {
  return (
    <div className="radio-row" onClick={onClick}>
      <span className={"radio-dot" + (checked ? " on" : "")} />
      <span>{label}</span>
    </div>
  );
}

function Select({ label, value, onChange, options, placeholder, disabled }) {
  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <select
        className="form-control"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder || t("f_select")}</option>
        {options.map((o) => (
          <option key={o.id ?? o.value} value={o.id ?? o.value}>
            {o.name || o.hierarchical_name || o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CreateIssue() {
  const nav = useNav();
  const { session } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [confirmConfidential, setConfirmConfidential] = useState(false);
  const [createdCode, setCreatedCode] = useState(null);

  const [ref, setRef] = useState({
    types: [], subtypes: [], categories: [], components: [], subcomponents: [],
    regions: [], ages: [], citizenGroups: [], statuses: [],
  });

  const [form, setForm] = useState({
    // step 1
    typeOfPerson: FACILITATOR,
    methodOfContact: "phone_number",
    contactInfo: "",
    // step 2
    name: "",
    citizenType: "keep_name_confidential",
    ageGroup: "",
    gender: "",
    groups: {}, // by type
    // step 3
    date: "",
    ongoing: false,
    issueType: "",
    issueSubType: "",
    category: "",
    component: "",
    subComponent: "",
    description: "",
    attachment: null,
    // step 4
    region: "",
    locationDescription: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [types, subtypes, categories, components, subcomponents, regions, ages, citizenGroups, statuses] =
        await Promise.all([
          fetchIssueTypes().catch(() => []),
          fetchIssueSubTypes().catch(() => []),
          fetchIssueCategories().catch(() => []),
          fetchComponents().catch(() => []),
          fetchSubComponents().catch(() => []),
          fetchRegions().catch(() => []),
          fetchAgeGroups().catch(() => []),
          fetchCitizenGroups().catch(() => []),
          fetchIssueStatuses().catch(() => []),
        ]);
      if (cancelled) return;
      setRef({ types, subtypes, categories, components, subcomponents, regions, ages, citizenGroups, statuses });
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const subtypeOptions = useMemo(
    () => ref.subtypes.filter((s) => String(idOf(s.parent)) === String(form.issueType)),
    [ref.subtypes, form.issueType]
  );
  const subComponentOptions = useMemo(
    () => ref.subcomponents.filter((s) => String(idOf(s.parent)) === String(form.component)),
    [ref.subcomponents, form.component]
  );
  const regionOptions = useMemo(() => {
    const parents = new Set(ref.regions.map((r) => idOf(r.parent)).filter((p) => p != null).map(String));
    const leaves = ref.regions.filter((r) => !parents.has(String(r.id)));
    return (leaves.length ? leaves : ref.regions).map((r) => ({ id: r.id, name: r.hierarchical_name || r.name }));
  }, [ref.regions]);
  const groupTypes = useMemo(() => {
    const map = {};
    ref.citizenGroups.forEach((g) => {
      const ty = g.type || "groupe";
      (map[ty] = map[ty] || []).push(g);
    });
    return map;
  }, [ref.citizenGroups]);
  const selectedCategory = ref.categories.find((c) => String(c.id) === String(form.category));

  // ---- validation ----
  function contactValid() {
    if (form.typeOfPerson !== ALERT) return true;
    if (form.methodOfContact === "email") return EMAIL_RE.test(form.contactInfo);
    return /^01\d{8}$/.test(form.contactInfo);
  }
  const stepValid = {
    0: true,
    1: contactValid(),
    2: form.name.trim().length > 0,
    3: form.date && form.issueType && form.issueSubType && form.category && form.description.trim(),
    4: !!form.region,
    5: true,
  };

  function next() {
    setError(null);
    if (!stepValid[step]) {
      setError(step === 1 ? t("invalid_contact") : t("please_choose_value_for_required_field"));
      return;
    }
    setStep((s) => s + 1);
  }
  function back() {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  async function doSubmit() {
    setConfirmConfidential(false);
    setError(null);
    setSubmitting(true);
    try {
      const initial = ref.statuses.find((s) => s.initial_status);
      const typeIds = Object.values(groupTypes);
      const gKeys = Object.keys(groupTypes);
      const body = {
        description: form.description.trim(),
        category: Number(form.category),
        issue_type: Number(form.issueType),
        issue_sub_type: Number(form.issueSubType),
        contact_medium: form.typeOfPerson,
        contact_information: form.typeOfPerson === ALERT ? form.contactInfo : "",
        ...(form.typeOfPerson === ALERT ? { contact_method: form.methodOfContact } : {}),
        tracking_code: genTrackingCode(),
        intake_date: form.date ? new Date(form.date).toISOString() : new Date().toISOString(),
        ongoing_issue: !!form.ongoing,
        location_description: form.locationDescription || "",
        administrative_region: Number(form.region),
        ...(form.component ? { component: Number(form.component) } : {}),
        ...(form.subComponent ? { sub_component: Number(form.subComponent) } : {}),
        ...(initial ? { status: initial.id } : {}),
        reporter: session?.user_id,
        citizen: {
          name: form.name.trim() || "Anonyme",
          age_group: form.ageGroup ? Number(form.ageGroup) : null,
          type: form.citizenType,
          group: gKeys[0] && form.groups[gKeys[0]] ? Number(form.groups[gKeys[0]]) : null,
          group_2: gKeys[1] && form.groups[gKeys[1]] ? Number(form.groups[gKeys[1]]) : null,
        },
      };
      const created = await createIssue(body);
      const code = created?.tracking_code || body.tracking_code;
      if (created?.id && form.attachment) {
        await uploadAttachment(created.id, form.attachment, false).catch(() => {});
      }
      setCreatedCode(code);
      setStep(6);
    } catch (e) {
      setError(t("create_failed") + (e?.response?.status ? ` (${e.response.status})` : ""));
    } finally {
      setSubmitting(false);
    }
  }

  function submitClicked() {
    if (selectedCategory && /confidential/i.test(selectedCategory.confidentiality_level || "")) {
      setConfirmConfidential(true);
    } else {
      doSubmit();
    }
  }

  if (loading) {
    return (<><Header title={t("new_complaint")} showBack /><Spinner /></>);
  }

  // ---- Step 6: success ----
  if (step === 6) {
    return (
      <>
        <Header title={t("new_complaint")} />
        <div className="scroll" style={{ padding: 23, textAlign: "center" }}>
          <div className="step-num" style={{ textAlign: "left" }}>{t("step_6")}</div>
          <p className="step-title" style={{ textAlign: "center" }}>{t("step_4_subtitle")}</p>
          <p className="note" style={{ textAlign: "left" }}>{t("step_4_description")}</p>
          <img src="/assets/think.svg" alt="" style={{ width: "55%", margin: "10px auto", display: "block" }} />
          <p style={{ color: "#707070", marginTop: 10 }}>{t("step_4_issue_code")}</p>
          <p style={{ fontSize: 40, fontWeight: 700, color: "var(--primary)", letterSpacing: 1, margin: "6px 0 30px" }}>
            {createdCode}
          </p>
          <button className="btn btn-primary btn-block" onClick={() => nav.goBack()}>
            {t("step_4_back_text")}
          </button>
        </div>
      </>
    );
  }

  const stepNums = ["step_1", "step_1", "step_2", "step_3", "step_4", "step_5"];

  return (
    <>
      <Header title={t("new_complaint")} showBack={step > 0} />
      <div className="scroll" style={{ padding: 23 }}>
        {step === 0 && (
          <>
            <img src="/assets/think.svg" alt="" className="crowd-illus" style={{ width: 120 }} />
            <p className="step-title" style={{ color: "var(--primary)", marginTop: 12 }}>
              {t("welcome_citizen_input")}
            </p>
            <p className="note" style={{ fontWeight: 600 }}>{t("intro_text_0")}</p>
            {["intro_text_1", "intro_text_2", "intro_text_3", "intro_text_4", "intro_text_5", "intro_text_6"].map((k) => (
              <p className="note" key={k}>{t(k)}</p>
            ))}
          </>
        )}

        {step === 1 && (
          <>
            <StepHeader num="step_1" title={t("stay_touch_question")} />
            <p className="note">{t("step_1_hint_1")}</p>
            <Radio checked={form.typeOfPerson === ANON} label={t("step_1_option_1")} onClick={() => set("typeOfPerson", ANON)} />
            <Radio checked={form.typeOfPerson === FACILITATOR} label={t("step_1_option_2")} onClick={() => set("typeOfPerson", FACILITATOR)} />
            <Radio checked={form.typeOfPerson === ALERT} label={t("step_1_option_3")} onClick={() => set("typeOfPerson", ALERT)} />
            {form.typeOfPerson === ALERT && (
              <div style={{ marginTop: 12 }}>
                <Select
                  value={form.methodOfContact}
                  onChange={(v) => set("methodOfContact", v)}
                  placeholder={t("step_1_placeholder_1")}
                  options={[
                    { value: "phone_number", name: t("step_1_method_1") },
                    { value: "whatsapp", name: t("step_1_method_2") },
                    { value: "email", name: t("step_1_method_3") },
                  ]}
                />
                <div className="form-group">
                  <input
                    className="form-control"
                    placeholder={form.methodOfContact === "email" ? t("step_1_placeholder_2") : "01XXXXXXXX"}
                    value={form.contactInfo}
                    onChange={(e) => set("contactInfo", e.target.value)}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <StepHeader num="step_2" title={t("contact_step_subtitle")} />
            <p className="note">{t("contact_step_explanation")}</p>
            <div className="form-group">
              <input className="form-control" placeholder={t("contact_step_placeholder_1")}
                value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <Radio checked={form.citizenType === "keep_name_confidential"} label={t("step_2_keep_name_confidential")} onClick={() => set("citizenType", "keep_name_confidential")} />
            <Radio checked={form.citizenType === "on_behalf_of_someone"} label={t("step_2_on_behalf_of_someone")} onClick={() => set("citizenType", "on_behalf_of_someone")} />
            <Radio checked={form.citizenType === "organization_behalf_someone"} label={t("step_2_organization_behalf_someone")} onClick={() => set("citizenType", "organization_behalf_someone")} />
            <div style={{ height: 10 }} />
            <Select value={form.ageGroup} onChange={(v) => set("ageGroup", v)} options={ref.ages} placeholder={t("contact_step_placeholder_2")} />
            <Select value={form.gender} onChange={(v) => set("gender", v)} placeholder={t("contact_step_placeholder_3")}
              options={[{ value: "male", name: t("male") }, { value: "female", name: t("female") }]} />
            {Object.keys(groupTypes).map((ty, i) => (
              <Select key={ty} value={form.groups[ty] || ""}
                onChange={(v) => set("groups", { ...form.groups, [ty]: v })}
                options={groupTypes[ty]}
                placeholder={i === 0 ? t("contact_step_placeholder_5") : t("contact_step_placeholder_6")} />
            ))}
          </>
        )}

        {step === 3 && (
          <>
            <StepHeader num="step_3" title={t("step_2_subtitle")} />
            <p className="note">{t("step_2_explanation")}</p>
            <div className="form-group">
              <label>{t("step_2_select_date")}</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="date" className="form-control" max={new Date().toISOString().slice(0, 10)}
                  value={form.date} onChange={(e) => set("date", e.target.value)} style={{ flex: 1 }} />
                <button className="btn btn-primary" style={{ padding: "0 14px" }}
                  onClick={() => set("date", new Date().toISOString().slice(0, 10))}>
                  {t("step_2_set_today")}
                </button>
              </div>
            </div>
            <label className="radio-row" style={{ alignItems: "center" }}>
              <input type="checkbox" checked={form.ongoing} onChange={(e) => set("ongoing", e.target.checked)}
                style={{ width: 18, height: 18 }} />
              {t("step_2_ongoing_hint")}
            </label>
            <Select value={form.issueType} onChange={(v) => { set("issueType", v); set("issueSubType", ""); }}
              options={ref.types} placeholder={t("step_2_placeholder_1")} />
            <Select value={form.issueSubType} onChange={(v) => set("issueSubType", v)}
              options={subtypeOptions} placeholder={t("step_2_placeholder_5")} disabled={!form.issueType} />
            <Select value={form.category} onChange={(v) => set("category", v)}
              options={ref.categories} placeholder={t("step_2_placeholder_2")} />
            <Select value={form.component} onChange={(v) => { set("component", v); set("subComponent", ""); }}
              options={ref.components} placeholder={t("step_2_placeholder_6")} />
            {form.component && (
              <Select value={form.subComponent} onChange={(v) => set("subComponent", v)}
                options={subComponentOptions} placeholder={t("step_2_placeholder_7")} />
            )}
            <div className="form-group">
              <textarea className="form-control" rows={4} placeholder={t("step_2_placeholder_3")}
                value={form.description} onChange={(e) => set("description", e.target.value)} />
            </div>
            <p className="note">{t("step_2_share_photos")}</p>
            <input type="file" accept="image/*,audio/*"
              onChange={(e) => set("attachment", e.target.files?.[0] || null)} />
          </>
        )}

        {step === 4 && (
          <>
            <StepHeader num="step_4" title={t("step_location_description")} />
            <p className="note">{t("step_location_body")}</p>
            <Select value={form.region} onChange={(v) => set("region", v)}
              options={regionOptions} placeholder={t("step_location_dropdown_placeholder")} />
            <p className="note">{t("step_location_input_explanation")}</p>
            <div className="form-group">
              <textarea className="form-control" rows={4} placeholder={t("step_2_placeholder_3")}
                value={form.locationDescription} onChange={(e) => set("locationDescription", e.target.value)} />
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <StepHeader num="step_5" title={t("step_3_confirmation")} />
            <p className="note">{t("step_3_subtitle")}</p>
            <div style={{ border: "4px solid #f5f5f5", borderRadius: 10, padding: 16 }}>
              <Conf label={t("step_3_field_title_1")} value={form.date} />
              <Conf label={t("step_3_field_title_2")} value={ref.types.find((x) => x.id == form.issueType)?.name} />
              <Conf label={t("step_3_field_title_2_1")} value={subtypeOptions.find((x) => x.id == form.issueSubType)?.name} />
              <Conf label={t("step_3_field_title_3")} value={selectedCategory?.name} />
              <Conf label={t("step_3_field_title_5")} value={ref.components.find((x) => x.id == form.component)?.name} />
              <Conf label={t("step_3_field_title_4")} value={form.description} />
              <Conf label="Localité:" value={regionOptions.find((x) => x.id == form.region)?.name} />
              <Conf label={t("step_3_attachments")} value={form.attachment ? form.attachment.name : "--"} last />
            </div>
          </>
        )}

        {error && <p style={{ color: "var(--error)", fontSize: 13, marginTop: 12 }}>{error}</p>}

        <div style={{ display: "flex", gap: 10, marginTop: 22, marginBottom: 24 }}>
          {step > 0 && step < 6 && (
            <button className="btn" style={{ flex: 1, padding: "13px 0", background: "var(--lightgray)", color: "#fff" }} onClick={back}>
              {t("previous")}
            </button>
          )}
          {step < 5 && (
            <button className="btn btn-primary" style={{ flex: 2, padding: "13px 0" }}
              disabled={!stepValid[step]} onClick={next}>
              {t("next")}
            </button>
          )}
          {step === 5 && (
            <button className="btn btn-primary" style={{ flex: 2, padding: "13px 0" }}
              disabled={submitting} onClick={submitClicked}>
              {submitting ? t("submitting") : t("submit_button_text")}
            </button>
          )}
        </div>
      </div>

      {confirmConfidential && (
        <Modal title={t("new_complaint")} onClose={() => setConfirmConfidential(false)}>
          <p style={{ fontSize: 13, color: "#707070", marginTop: 0 }}>{t("confidential_complaint")}</p>
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button className="btn" style={{ flex: 1, padding: "11px 0", background: "var(--lightgray)", color: "#fff" }}
              onClick={() => setConfirmConfidential(false)}>{t("non")}</button>
            <button className="btn btn-primary" style={{ flex: 1, padding: "11px 0" }} onClick={doSubmit}>{t("oui")}</button>
          </div>
        </Modal>
      )}
    </>
  );
}

function Conf({ label, value, last }) {
  return (
    <div style={{ padding: "7px 0", borderBottom: last ? "none" : "1px solid #f0f0f0" }}>
      <span style={{ fontWeight: 700, fontSize: 13, color: "#707070" }}>{label} </span>
      <span style={{ fontSize: 13, color: "#707070" }}>{value || "--"}</span>
    </div>
  );
}
