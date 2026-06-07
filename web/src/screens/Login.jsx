import React, { useState } from "react";
import { t } from "../i18n";
import { login as apiLogin } from "../api";
import { useAuth } from "../auth";
import { Field, IconAccount, IconEye, IconBack } from "../components";

export default function Login({ onBack }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e?.preventDefault?.();
    setError(null);
    if (!email.trim() || !password) {
      setError(t("required_field"));
      return;
    }
    setLoading(true);
    try {
      const res = await apiLogin(email.trim(), password);
      if (res && res.token) {
        signIn(res);
      } else {
        setError(res?.error || "Identifiants invalides.");
      }
    } catch (_e) {
      setError("Échec de la connexion. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen">
      <div className="app-header">
        <button className="back" onClick={onBack} aria-label="Retour">
          <IconBack />
        </button>
      </div>
      <form className="scroll" onSubmit={submit} style={{ padding: "0 30px 30px" }}>
        <div style={{ textAlign: "center", marginTop: 50, marginBottom: 40 }}>
          <img src="/assets/eadl-logo.svg" alt="logo" style={{ height: 90 }} />
          <p
            style={{
              marginTop: 16,
              fontSize: 19,
              fontWeight: 700,
              lineHeight: "23px",
              color: "#707070",
            }}
          >
            {t("welcome_login")}
          </p>
        </div>

        <Field
          label={t("email")}
          icon={<IconAccount />}
          value={email}
          onChange={setEmail}
          autoFocus
        />
        <Field
          label={t("password")}
          icon={<IconEye off={secure} />}
          leftButton
          onLeftButton={() => setSecure((s) => !s)}
          type={secure ? "password" : "text"}
          value={password}
          onChange={setPassword}
        />

        {error && (
          <p style={{ color: "var(--error)", paddingLeft: 14, fontSize: 13 }}>{error}</p>
        )}

        <div style={{ marginTop: 36 }}>
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? "…" : t("connect")}
          </button>
        </div>

        <p style={{ textAlign: "center", color: "#707070", fontSize: 12, marginTop: 24 }}>
          v 1.0.0
        </p>
      </form>
    </div>
  );
}
