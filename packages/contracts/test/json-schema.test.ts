import { expect, test } from "vitest";
import { z } from "zod";
import * as contracts from "@yojana/contracts";

const schemas = Object.entries(contracts).filter(([name]) => /^[A-Z].*Schema$/.test(name));

for (const [name, schema] of schemas) {
  test(`${name} exports serializable JSON Schema`, () => {
    if (!(schema instanceof z.ZodType)) throw new Error(`${name} must be a Zod schema`);
    const output = contracts.toJsonSchema(schema);
    expect(JSON.parse(JSON.stringify(output))).toEqual(output);
    expect(output.$schema).toBe("https://json-schema.org/draft/2020-12/schema");
  });
}

test("recursive rules and profiles emit references instead of circular JSON", () => {
  for (const schema of [contracts.RuleNodeSchema, contracts.ProfileSchema]) {
    expect(JSON.stringify(contracts.toJsonSchema(schema))).toContain('"$ref"');
  }
});

test("range objects require at least one bound in JSON Schema too", () => {
  const schema = contracts.toJsonSchema(contracts.FieldValueSchema);
  expect(schema.anyOf).toEqual(expect.arrayContaining([expect.objectContaining({ type: "object", minProperties: 1, additionalProperties: false })]));
});

test("JSON Schema conversion fails clearly for unsupported schemas", () => {
  expect(() => contracts.toJsonSchema(z.custom<Uint8Array>())).toThrow();
});

test("source quote validation is represented in generated JSON Schema", () => {
  expect(contracts.toJsonSchema(contracts.CriterionSchema)).toMatchObject({
    properties: { source: { properties: { quote: { pattern: expect.any(String) } } } },
  });
});
