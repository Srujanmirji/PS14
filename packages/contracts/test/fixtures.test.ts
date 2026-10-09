import { readFileSync, readdirSync } from "node:fs";
import { expect, test } from "vitest";
import { z } from "zod";
import * as contracts from "@yojana/contracts";

const fixturesDirectory = new URL("../fixtures/", import.meta.url);
const schemas = Object.entries(contracts).filter(([name]) => /^[A-Z].*Schema$/.test(name));
const fixtureName = (name: string) => name.replace(/Schema$/, "").replace(/[A-Z]/g, (letter, index) => `${index ? "-" : ""}${letter.toLowerCase()}`);

test("every exported schema has exactly one valid and one invalid fixture", () => {
  expect(schemas.length).toBeGreaterThan(0);
  const expected = schemas.flatMap(([name]) => ["valid", "invalid"].map((kind) => `${fixtureName(name)}.${kind}.json`));
  expect(readdirSync(fixturesDirectory).filter((file) => file.endsWith(".json")).sort()).toEqual(expected.sort());
});

for (const [name, schema] of schemas) {
  for (const kind of ["valid", "invalid"] as const) {
    test(`${name}: ${kind} fixture`, () => {
      expect(schema).toBeInstanceOf(z.ZodType);
      if (!(schema instanceof z.ZodType)) throw new Error(`${name} must be a Zod schema`);
      const input: unknown = JSON.parse(readFileSync(new URL(`${fixtureName(name)}.${kind}.json`, fixturesDirectory), "utf8"));
      const result = schema.safeParse(input);
      if (kind === "valid") {
        expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
      } else {
        expect(result.success).toBe(false);
        if (result.success) throw new Error(`${name} accepted its invalid fixture`);
        expect(result.error.issues.length).toBeGreaterThan(0);
        for (const issue of result.error.issues) {
          expect(Array.isArray(issue.path)).toBe(true);
          expect(issue.message.length).toBeGreaterThan(0);
        }
      }
    });
  }
}
