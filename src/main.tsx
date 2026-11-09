import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { App } from "./App";
import { ToastProvider } from "./components/Toast";
import { CrashForReview, ErrorBoundary } from "./components/ErrorBoundary";
import { StoreProvider } from "./store";
import "./styles.css";

// Artifact builds run in a sandboxed frame whose URL the app doesn't own, so routes live in memory there.
const Router = import.meta.env.MODE === "artifact" ? (p: { children: React.ReactNode }) => <MemoryRouter initialEntries={["/learn/groupby"]}>{p.children}</MemoryRouter> : BrowserRouter;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <StoreProvider>
        <ToastProvider>
          <ErrorBoundary>
            <CrashForReview />
            <App />
          </ErrorBoundary>
        </ToastProvider>
      </StoreProvider>
    </Router>
  </StrictMode>,
);
