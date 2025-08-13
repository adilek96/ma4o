import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import Iridescence from "./components/Iridescence";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nextProvider i18n={i18n} defaultNS={"translation"}>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          position: "fixed",
          zIndex: -1,
        }}
      >
        <Iridescence
          color={[1, 1, 1]}
          mouseReact={false}
          amplitude={0.1}
          speed={1.0}
        />
      </div>
      <App />
    </I18nextProvider>
  </StrictMode>
);
