import React from "react";
// Side effect: on desktop web, style #root as a centered phone-sized box.
import "./src/web/installPhoneShell";
import AppRoot from "./src/AppRoot";

/**
 * Web entry point. The app renders directly (no iframe) into Expo's #root.
 * On desktop, #root is styled as a centered phone box and Dimensions is pinned
 * to phone size (see installPhoneShell / patchDimensions). On a phone-sized
 * viewport everything is a no-op and the app simply fills the screen.
 */
const App = () => <AppRoot />;

export default App;
