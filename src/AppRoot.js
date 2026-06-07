import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import { Provider as ReduxProvider } from "react-redux";
import store from "./store";
import "./translations/i18n";
import Router from "./router";

/**
 * The actual application tree (Redux + Paper providers + Router).
 * Shared by the native entry (App.js) and the web entry (App.web.js).
 */
const AppRoot = () => (
  <ReduxProvider store={store}>
    <PaperProvider>
      <Router />
    </PaperProvider>
  </ReduxProvider>
);

export default AppRoot;
