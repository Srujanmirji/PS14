import { readdirSync } from "node:fs";
import { URL } from "node:url";
import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

const appImports = {
  regex: "^@yojana/(?:api|web)(?:/|$)|(?:^|/)apps/",
  message: "Nothing imports from apps; use a shared package.",
};
const featureNames = readdirSync(
  new URL("./apps/web/src/features/", import.meta.url),
  { withFileTypes: true },
).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
const engineTests = [
  "packages/engine/test/**/*.ts",
  "packages/engine/src/**/*.{test,spec}.ts",
  "packages/engine/src/**/__tests__/**/*.ts",
];

export default defineConfig(
  { ignores: ["**/node_modules/**", "**/dist/**", "**/coverage/**", "**/android/build/**"] },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ["**/*.{js,ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [appImports] }],
    },
  },
  {
    files: ["apps/web/src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [appImports, {
          regex: "^@yojana/db(?:/|$)|(?:^|/)packages/db(?:/|$)",
          message: "The browser never imports the database package.",
        }],
      }],
    },
  },
  ...featureNames.map((name) => ({
    files: [`apps/web/src/features/${name}/**/*.{ts,tsx}`],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [
          appImports,
          {
            regex: "^(?:@/|(?:\\.\\.?/)+)app(?:/|$)|^@yojana/(?:db|eval)(?:/|$)",
            message: "Features cannot import app internals or server-only packages.",
          },
          {
            regex: `^@/features/(?!${name}(?:/|$))[^/]+/(?!index(?:\\.ts)?$)|^(?:\\.\\.?/)+(?:features/)?(?:${featureNames.filter((other) => other !== name).join("|")})/(?!index(?:\\.ts)?$)`,
            message: "Import another feature through its index.ts only.",
          },
        ],
      }],
    },
  })),
  {
    files: ["apps/web/src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [appImports, {
          regex: "^(?:@/|(?:\\.\\.?/)+)(?:features|app)(?:/|$)|^@yojana/(?!contracts$)",
          message: "Shared code imports only contracts and other shared code across layers.",
        }],
      }],
    },
  },
  {
    files: ["packages/engine/src/**/*.ts"],
    ignores: engineTests,
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{
          regex: "^(?!@yojana/contracts$|\\.\\.?/)",
          caseSensitive: true,
          message: "Engine source imports only @yojana/contracts and relative paths.",
        }],
      }],
      "no-restricted-globals": ["error", {
        globals: ["Date", "fetch"],
        checkGlobalObject: true,
      }],
      "no-restricted-properties": ["error", {
        object: "Math", property: "random", message: "Engine evaluation must be deterministic.",
      }],
    },
  },
  {
    files: engineTests,
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{
          regex: "^(?!@yojana/(?:contracts|schemes|eval)$|vitest$|node:(?:fs|path)$|\\.\\.?/)",
          caseSensitive: true,
          message: "Engine tests may import contracts, schemes, eval, Vitest, node:fs, node:path and relative paths.",
        }],
      }],
    },
  },
);
