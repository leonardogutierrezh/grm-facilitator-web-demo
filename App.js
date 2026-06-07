import React from "react";
import AppRoot from "./src/AppRoot";

if (__DEV__) {
  // eslint-disable-next-line no-console
  import("./ReactotronConfig").then(() => console.log("Reactotron Configured"));
}

const App = () => <AppRoot />;

export default App;
