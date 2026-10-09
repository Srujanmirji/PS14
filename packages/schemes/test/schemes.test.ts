import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { buildBundle } from "../src/bundle";
import { runCli } from "../src/cli";
import { loadSchemeData, SchemeDataError } from "../src/load";
import { validateSchemeData } from "../src/validate";
import {
  cleanupTemporaryDirectories,
  criterion,
  temporaryDirectory,
  validDataDirectory,
  writeJson,
} from "./fixtures";

afterEach(cleanupTemporaryDirectories);

describe("scheme data loading and validation", () => {
  test("loads contract-validated files in deterministic order", async () => {
    const root = await validDataDirectory();
    const data = await loadSchemeData(root);

    expect(data.fields.map((field) => field.id)).toEqual(["age", "status"]);
    expect(data.schemes.map(({ file }) => file)).toEqual([
      "data/central/central.alpha.json",
      "data/karnataka/ka.beta.json",
    ]);
    expect(validateSchemeData(data, new Date("2026-10-09T00:00:00Z"))).toEqual([]);
  });

  test("reports contract failures with a file and JSON path", async () => {
    const root = await validDataDirectory();
    await writeJson(join(root, "fields.json"), [{ id: "age", type: "wrong" }]);

    await expect(loadSchemeData(root)).rejects.toMatchObject({
      issues: expect.arrayContaining([
        expect.objectContaining({ file: "fields.json", path: "$[0].type" }),
      ]),
    });
  });

  test("reports missing required data without inventing defaults", async () => {
    const root = await temporaryDirectory();

    await expect(loadSchemeData(root)).rejects.toBeInstanceOf(SchemeDataError);
    await expect(loadSchemeData(root)).rejects.toMatchObject({
      issues: expect.arrayContaining([
        expect.objectContaining({ file: "fields.json", path: "$" }),
        expect.objectContaining({ file: "documents.json", path: "$" }),
        expect.objectContaining({ file: "data/central", path: "$" }),
        expect.objectContaining({ file: "data/karnataka", path: "$" }),
      ]),
    });
  });

  test("cross-checks ids, fields, values, documents and freshness", async () => {
    const root = await validDataDirectory();
    const data = await loadSchemeData(root);
    const source = data.schemes[0];
    if (!source) throw new Error("Expected a scheme fixture");
    source.scheme.id = "central.wrong-name";
    source.scheme.lastChecked = "2025-01-01";
    source.scheme.documents = ["missing-document"];
    source.scheme.rule = {
      all: [
        criterion("duplicate", "missing-field", "eq", 18),
        criterion("duplicate", "status", "eq", "not-allowed"),
      ],
    };

    const issues = validateSchemeData(data, new Date("2026-10-09T00:00:00Z"));
    expect(issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: "$.id", severity: "error" }),
      expect.objectContaining({ path: "$.lastChecked", severity: "warning" }),
      expect.objectContaining({ path: "$.documents[0]", severity: "error" }),
      expect.objectContaining({ path: "$.rule.all[0].field", severity: "error" }),
      expect.objectContaining({ path: "$.rule.all[1].id", severity: "error" }),
      expect.objectContaining({ path: "$.rule.all[1].value", severity: "error" }),
    ]));
  });
});

describe("scheme bundle", () => {
  test("includes central and requested-state schemes with a content hash version", async () => {
    const root = await validDataDirectory();
    const data = await loadSchemeData(root);
    const now = new Date("2026-10-09T12:00:00.000Z");
    const first = await buildBundle("KA", { data, now });
    const second = await buildBundle("ka", { data, now });

    expect(first).toEqual(second);
    expect(first.version).toMatch(/^2026-10-09T12:00:00\.000Z-ka-[a-f0-9]{8}$/);
    expect(first.schemes.map((scheme) => scheme.id)).toEqual(["central.alpha", "ka.beta"]);
  });

  test("rejects an unsupported state", async () => {
    const data = await loadSchemeData(await validDataDirectory());
    await expect(buildBundle("MH", { data })).rejects.toThrow('Unsupported state "MH"');
  });

  test("refuses to bundle data with invalid cross-references", async () => {
    const data = await loadSchemeData(await validDataDirectory());
    const schemeValue = data.schemes[0]?.scheme;
    if (!schemeValue) throw new Error("Expected a scheme fixture");
    schemeValue.documents = ["missing"];

    await expect(buildBundle("KA", { data })).rejects.toMatchObject({
      issues: [expect.objectContaining({ path: "$.documents[0]" })],
    });
  });
});

describe("schemes CLI", () => {
  test("returns non-zero with file and path for validation errors", async () => {
    const root = await validDataDirectory();
    const data = await loadSchemeData(root);
    const schemeValue = data.schemes[0]?.scheme;
    if (!schemeValue) throw new Error("Expected a scheme fixture");
    schemeValue.documents = ["missing"];
    await writeJson(join(root, "data/central/central.alpha.json"), schemeValue);
    const errors: string[] = [];

    await expect(runCli(["check"], {
      rootDirectory: root,
      stderr: (message) => errors.push(message),
      stdout: () => undefined,
    })).resolves.toBe(1);
    expect(errors).toContain(
      'data/central/central.alpha.json:$.documents[0] Unknown document id "missing"',
    );
  });

  test("writes a validated bundle for the requested state", async () => {
    const root = await validDataDirectory();
    const outputFile = join(root, "output/schemes.bundle.json");
    const messages: string[] = [];
    const result = await runCli(["bundle", "--state", "KA"], {
      rootDirectory: root,
      outputFile,
      now: new Date("2026-10-09T12:00:00.000Z"),
      stdout: (message) => messages.push(message),
      stderr: () => undefined,
    });

    expect(result).toBe(0);
    expect(JSON.parse(await readFile(outputFile, "utf8"))).toMatchObject({
      schemes: [{ id: "central.alpha" }, { id: "ka.beta" }],
    });
    expect(messages.at(-1)).toContain("Wrote 2 schemes");
  });
});
