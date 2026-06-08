import React, { useState } from "react";
import { useAuth } from "./auth";
import { NavProvider, useNav } from "./nav";
import { Spinner, TabBar } from "./components";
import { t } from "./i18n";
import Onboarding from "./screens/Onboarding";
import Login from "./screens/Login";
import Dashboard from "./screens/Dashboard";
import IssueSummary from "./screens/IssueSummary";
import IssueDetail from "./screens/IssueDetail";
import Profile from "./screens/Profile";
import CreateIssue from "./screens/CreateIssue";

/* Centered phone box on desktop; full-screen on phones (handled by CSS). */
function Shell({ children }) {
  return (
    <div className="backdrop">
      <div className="backdrop-title">
        <b>MGP-BJ</b>
        <span>Mécanisme de Gestion de Plainte · Démo</span>
      </div>
      <div className="phone">{children}</div>
    </div>
  );
}

function PublicFlow() {
  const [screen, setScreen] = useState("onboarding");
  if (screen === "onboarding") {
    return <Onboarding onContinue={() => setScreen("login")} />;
  }
  return <Login onBack={() => setScreen("onboarding")} />;
}

function ProfileError() {
  const { profileError, retryProfile, signOut } = useAuth();
  return (
    <div
      className="screen"
      style={{ padding: 24, alignItems: "center", justifyContent: "center", textAlign: "center" }}
    >
      <div style={{ flex: 1 }} />
      <p style={{ color: "var(--primary)", fontWeight: 600, fontSize: 18 }}>
        {profileError === "no_profile" ? t("no_credentials_profile") : t("something_wrong")}
      </p>
      <div style={{ flex: 1 }} />
      <button className="btn btn-primary btn-block" onClick={retryProfile} style={{ maxWidth: 320 }}>
        {t("reload")}
      </button>
      <div style={{ height: 16 }} />
      <button
        className="btn btn-block"
        onClick={signOut}
        style={{ background: "var(--lightgray)", color: "#fff", maxWidth: 320 }}
      >
        {t("logout")}
      </button>
      <div style={{ flex: 1 }} />
    </div>
  );
}

function PrivateRouter() {
  const nav = useNav();
  const { screen, params } = nav.current;
  let content;
  switch (screen) {
    case "GRM":
      content = <Dashboard />;
      break;
    case "IssueSummary":
      content = <IssueSummary />;
      break;
    case "IssueDetail":
      content = <IssueDetail issue={params.issue} />;
      break;
    case "CreateIssue":
      content = <CreateIssue />;
      break;
    case "Profile":
      content = <Profile />;
      break;
    default:
      content = <Dashboard />;
  }
  return (
    <div className="screen">
      {content}
      <TabBar />
    </div>
  );
}

function Root() {
  const { ready, session, profile, profileError } = useAuth();
  if (!ready) return <Spinner />;
  if (!session) return <PublicFlow />;
  if (profileError) return <ProfileError />;
  if (!profile) return <Spinner />;
  return (
    <NavProvider>
      <PrivateRouter />
    </NavProvider>
  );
}

export default function App() {
  return (
    <Shell>
      <Root />
    </Shell>
  );
}
