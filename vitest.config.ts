import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["api", "contracts", "engine", "schemes", "db", "eval"].map(
      (name) => ({
        test: {
          name: `@yojana/${name}`,
          root: name === "api" ? "apps/api" : `packages/${name}`,
          include: ["test/**/*.{test,spec}.ts", "src/**/*.{test,spec}.ts"],
          environment: "node",
        },
      }),
    ),
  },
});
