import { expect, test } from "vitest";
import {
  CriterionSchema, ExtractRequestSchema, ExtractResponseSchema, FeedbackRequestSchema,
  FieldDefSchema, FieldValueSchema, PersonaSchema, ProfileSchema, QuickReplySchema, RuleNodeSchema, SchemeSchema,
} from "@yojana/contracts";

const label = { en: "Fixture", kn: "ಕೃತಕ", hi: "कृत्रिम" };
const criterion = { id: "fixture.number", field: "fixture_number", op: "gte", value: 10, label };

test.each([true, false, 0, -1, 1.5, "", "not_sure", "declined"])("preserves field value %j without coercion", (value) => {
  expect(FieldValueSchema.parse(value)).toEqual(value);
});

test.each([{ lt: 0 }, { lte: 0 }, { gt: 0 }, { gte: 0 }, { gt: 0, lte: 10 }])("preserves range %j", (range) => {
  expect(FieldValueSchema.parse(range)).toEqual(range);
});

test.each([undefined, null, [], {}, { lt: undefined }, { lt: "10" }, { minimum: 10 }, { lt: 10, extra: true }, NaN, Infinity])("rejects unsupported field value %j", (value) => {
  expect(FieldValueSchema.safeParse(value).success).toBe(false);
});

test("missing profile facts and optional settings stay absent", () => {
  const profile = { id: "fixture", lang: "en", entries: {}, declined: [] };
  expect(ProfileSchema.parse(profile)).toEqual(profile);
  expect(ProfileSchema.parse(profile).entries).not.toHaveProperty("age");
  const field = { id: "fixture_number", type: "number", askOrder: 1, question: label };
  expect(FieldDefSchema.parse(field)).toEqual(field);
  expect(FieldDefSchema.parse(field)).not.toHaveProperty("askable");
  expect(ExtractRequestSchema.parse({ utterance: "fixture", lang: "en", known: {} }).known).toEqual({});
});

test("profile entries require a known value, source and timestamp", () => {
  expect(ProfileSchema.safeParse({ id: "fixture", lang: "en", entries: { age: {} }, declined: [] }).success).toBe(false);
});

test("recursive family profiles retain missing fields", () => {
  const member = { id: "fixture-member", lang: "kn", entries: {}, declined: ["age"] };
  const profile = { id: "fixture-parent", lang: "en", entries: {}, declined: [], members: [{ ...member, members: [member] }] };
  expect(ProfileSchema.parse(profile)).toEqual(profile);
});

test("recursive rules accept all, any, not and every documented operator", () => {
  const rule = { all: [criterion, { any: [{ not: criterion }, { all: [] }] }] };
  expect(RuleNodeSchema.parse(rule)).toEqual(rule);
  for (const op of ["eq", "neq", "in", "nin", "lt", "lte", "gt", "gte", "between", "truthy", "falsy"]) {
    expect(CriterionSchema.safeParse({ ...criterion, op }).success).toBe(true);
  }
});

test("ambiguous rule nodes and invalid nested operators are rejected", () => {
  expect(RuleNodeSchema.safeParse({ all: [], any: [] }).success).toBe(false);
  expect(RuleNodeSchema.safeParse({ not: { ...criterion, op: "approximate" } }).success).toBe(false);
});

test("quick reply sentinels remain explicit strings", () => {
  for (const value of ["not_sure", "declined"]) {
    expect(QuickReplySchema.parse({ label, value }).value).toBe(value);
  }
});

test("extract responses cannot add a verdict", () => {
  expect(ExtractResponseSchema.safeParse({ updates: [], status: "eligible" }).success).toBe(false);
  expect(ExtractResponseSchema.safeParse({ updates: [{ field: "age", value: 10, evidence: "ten", status: "eligible" }] }).success).toBe(false);
  expect(ExtractResponseSchema.parse({ updates: [] })).toEqual({ updates: [] });
});

test("nested invalid values produce a useful JSON path", () => {
  const result = ExtractResponseSchema.safeParse({ updates: [{ field: "age", value: null, evidence: "fixture" }] });
  expect(result.success).toBe(false);
  if (result.success) throw new Error("Null field values must remain invalid");
  expect(result.error.issues[0]?.path).toEqual(["updates", 0, "value"]);
});

test("feedback enforces the comment limit and rejects citizen data", () => {
  const feedback = { screen: "fixture", helpful: true, lang: "en", appVersion: "fixture" };
  expect(FeedbackRequestSchema.safeParse({ ...feedback, comment: "x".repeat(280) }).success).toBe(true);
  expect(FeedbackRequestSchema.safeParse({ ...feedback, comment: "x".repeat(281) }).success).toBe(false);
  expect(FeedbackRequestSchema.safeParse({ ...feedback, profile: { age: 10 } }).success).toBe(false);
});

test("persona labels require exactly two reviewers", () => {
  const persona = { id: "fixture", description: "Synthetic", tags: ["partial"], profile: {}, expected: {} };
  expect(PersonaSchema.safeParse({ ...persona, labelledBy: ["A"] }).success).toBe(false);
  expect(PersonaSchema.safeParse({ ...persona, labelledBy: ["A", "B", "C"] }).success).toBe(false);
  expect(PersonaSchema.safeParse({ ...persona, labelledBy: ["A", "B"] }).success).toBe(true);
});

test("source quotes accept 25 whitespace-separated words and reject 26", () => {
  const source = { url: "https://example.invalid/fixture", quote: `  ${Array(25).fill("word").join("\n\t")}  ` };
  expect(CriterionSchema.safeParse({ ...criterion, source }).success).toBe(true);
  expect(CriterionSchema.safeParse({ ...criterion, source: { ...source, quote: `${source.quote} word` } }).success).toBe(false);
  expect(CriterionSchema.safeParse({ ...criterion, source: { ...source, quote: Array(26).fill("x".repeat(500)).join(" ") } }).success).toBe(false);
});

test("scheme links accept HTTP(S) and reject executable protocols", () => {
  const scheme = { id: "central.fixture", name: label, level: "central", category: "other", benefit: { summary: label }, rule: criterion, documents: [], steps: [], lastChecked: "2026-10-09" };
  expect(SchemeSchema.safeParse({ ...scheme, sourceUrl: "https://example.invalid/fixture" }).success).toBe(true);
  expect(SchemeSchema.safeParse({ ...scheme, sourceUrl: "javascript:alert(1)" }).success).toBe(false);
  expect(SchemeSchema.safeParse({ ...scheme, sourceUrl: "https://example.invalid/fixture", applyUrl: "javascript:alert(1)" }).success).toBe(false);
});
