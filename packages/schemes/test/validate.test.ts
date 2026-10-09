import {
  DocumentDefSchema,
  FieldDefSchema,
  SchemeSchema,
} from "@yojana/contracts";
import type { Criterion } from "@yojana/contracts";
import { describe, expect, test } from "vitest";
import type { LoadedSchemeData } from "../src/load";
import { validateSchemeData } from "../src/validate";

const text = { en: "Synthetic test", kn: "ಕೃತಕ ಪರೀಕ್ಷೆ", hi: "कृत्रिम परीक्षण" };

describe("scheme cross-validation", () => {
  test("rejects operator, type, option and numeric-range mismatches", () => {
    const data = validData();
    data.schemes[0]!.scheme.rule = {
      all: [
        criterion("age.high", "age", "eq", 121),
        criterion("status.compare", "status", "gte", "active"),
        criterion("age.reversed", "age", "between", [60, 20]),
        criterion("status.unknown", "status", "in", ["missing"]),
        criterion("age.truthy", "age", "truthy", true),
      ],
    };

    const issues = validateSchemeData(data, new Date("2026-10-09T00:00:00Z"));
    expect(issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: "$.rule.all[0].value", message: expect.stringContaining("maximum") }),
      expect.objectContaining({ path: "$.rule.all[1].value", message: expect.stringContaining("numeric") }),
      expect.objectContaining({ path: "$.rule.all[2].value", message: expect.stringContaining("ordered") }),
      expect.objectContaining({ path: "$.rule.all[3].value", message: expect.stringContaining("not an allowed") }),
      expect.objectContaining({ path: "$.rule.all[4].value", message: expect.stringContaining("must not") }),
    ]));
  });

  test("rejects duplicate registry and scheme ids", () => {
    const data = validData();
    data.fields.push(data.fields[0]!);
    data.documents.push(data.documents[0]!);
    data.schemes.push({
      file: "data/central/central.duplicate.json",
      scheme: data.schemes[0]!.scheme,
    });

    const issues = validateSchemeData(data, new Date("2026-10-09T00:00:00Z"));
    expect(issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ file: "fields.json", message: expect.stringContaining("Duplicate id") }),
      expect.objectContaining({ file: "documents.json", message: expect.stringContaining("Duplicate id") }),
      expect.objectContaining({
        file: "data/central/central.duplicate.json",
        message: expect.stringContaining("Duplicate scheme id"),
      }),
    ]));
  });
});

function validData(): LoadedSchemeData {
  const fields = [
    FieldDefSchema.parse({
      id: "age", type: "number", min: 0, max: 120, askOrder: 1, question: text,
    }),
    FieldDefSchema.parse({
      id: "status", type: "enum", options: ["active"], askOrder: 2, question: text,
    }),
  ];
  const documents = [DocumentDefSchema.parse({ id: "proof", name: text, howToGet: text })];
  const scheme = SchemeSchema.parse({
    id: "central.alpha",
    name: text,
    level: "central",
    category: "other",
    benefit: { summary: text },
    rule: criterion("age.minimum", "age", "gte", 18),
    documents: ["proof"],
    steps: [text],
    sourceUrl: "https://example.invalid/central.alpha",
    lastChecked: "2026-10-09",
  });
  return {
    rootDirectory: "/synthetic",
    fields,
    documents,
    schemes: [{ file: "data/central/central.alpha.json", scheme }],
  };
}

function criterion(id: string, field: string, op: Criterion["op"], value: unknown): Criterion {
  return { id, field, op, value, label: text };
}
