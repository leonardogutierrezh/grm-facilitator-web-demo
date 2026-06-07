import React from "react";
import { t } from "../i18n";

export default function Onboarding({ onContinue }) {
  return (
    <div
      className="screen"
      style={{
        padding: 30,
        alignItems: "center",
        justifyContent: "space-around",
      }}
    >
      <img src="/assets/think.svg" alt="" style={{ width: 230, maxWidth: "70%" }} />
      <p
        style={{
          fontSize: 19,
          fontWeight: 700,
          lineHeight: "23px",
          textAlign: "center",
          color: "#707070",
          margin: "0 8px",
        }}
      >
        {t("used_app_before")}
      </p>
      <div style={{ display: "flex", gap: 18, justifyContent: "center" }}>
        <button
          className="btn btn-primary"
          style={{ padding: "12px 26px", fontSize: 15 }}
          onClick={onContinue}
        >
          {t("yes")}
        </button>
        <button
          className="btn"
          style={{
            padding: "12px 26px",
            fontSize: 15,
            background: "#fff",
            color: "#707070",
            border: "1px solid #dedede",
          }}
          onClick={onContinue}
        >
          {t("no")}
        </button>
      </div>
    </div>
  );
}
