import { createElement } from "react";
import type { RouteObject } from "react-router";
import { AppShell } from "./AppShell";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: createElement(AppShell),
    children: [
      {
        index: true,
        lazy: async () => {
          const { Home } = await import("@/features/intake");
          return { Component: Home };
        },
      },
      {
        path: "welcome",
        lazy: async () => {
          const { Welcome } = await import("@/features/onboarding");
          return { Component: Welcome };
        },
      },
      {
        path: "chat",
        lazy: async () => {
          const { Conversation } = await import("@/features/intake");
          return { Component: Conversation };
        },
      },
      {
        path: "results",
        lazy: async () => {
          const { Results } = await import("@/features/results");
          return { Component: Results };
        },
      },
      {
        path: "scheme/:id",
        lazy: async () => {
          const { SchemeDetail } = await import("@/features/scheme-detail");
          return { Component: SchemeDetail };
        },
      },
      {
        path: "documents",
        lazy: async () => {
          const { Documents } = await import("@/features/documents");
          return { Component: Documents };
        },
      },
      {
        path: "card",
        lazy: async () => {
          const { BenefitCard } = await import("@/features/benefit-card");
          return { Component: BenefitCard };
        },
      },
      {
        path: "settings",
        lazy: async () => {
          const { Settings } = await import("@/features/settings");
          return { Component: Settings };
        },
      },
      {
        path: "lab",
        lazy: async () => {
          const { AccuracyLab } = await import("@/features/accuracy-lab");
          return { Component: AccuracyLab };
        },
      },
      {
        path: "operator/*",
        lazy: async () => {
          const { AssistedMode } = await import("@/features/assisted-mode");
          return { Component: AssistedMode };
        },
      },
    ],
  },
];
