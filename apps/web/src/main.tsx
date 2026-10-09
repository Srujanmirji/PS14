import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { bootstrapApp } from "@/app/bootstrap";
import { ErrorBoundary } from "@/app/ErrorBoundary";
import { Providers } from "@/app/providers";
import { AppRouter } from "@/app/router";
import "./index.css";

void bootstrapApp();

if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        reg.addEventListener("updatefound", () => {
          const installing = reg.installing;
          if (installing) {
            installing.addEventListener("statechange", () => {
              if (
                installing.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                console.info("PWA update available.");
              }
            });
          }
        });
        console.info("PWA ready to work offline.");
      })
      .catch((err: unknown) => {
        console.error("PWA registration failed:", err);
      });
  });
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <Providers>
          <AppRouter />
        </Providers>
      </ErrorBoundary>
    </StrictMode>,
  );
}
