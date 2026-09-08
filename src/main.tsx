import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { TelemetryBridge } from "./observability/TelemetryBridge";

createRoot(document.getElementById("root")!).render(
  <TelemetryBridge>
    <App />
  </TelemetryBridge>,
);
