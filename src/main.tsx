import { StrictMode } from "react";
import { Capacitor } from "@capacitor/core";
import { initializeNativeAppBootstrap } from "./mobile/nativeAppBootstrap";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

import "./index.css";
import "./styles/theme.css";
import "./styles/LandingImports.css";
import "./styles/portalResponsive.css";

initializeNativeAppBootstrap();

if (Capacitor.isNativePlatform()) {
  document.documentElement.classList.add("tp-native-app");
  document.body.classList.add("tp-native-app");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);