import { z } from "zod";
import { FieldDefSchema } from "./fields";
import { I18nTextSchema } from "./lang";

export const CriterionSchema = z.strictObject({
  id: z.string().min(1),
  field: z.string().min(1),
  op: z.enum(["eq", "neq", "in", "nin", "lt", "lte", "gt", "gte", "between", "truthy", "falsy"]),
  value: z.unknown().optional(),
  label: I18nTextSchema,
  source: z.strictObject({
    url: z.httpUrl(),
    quote: z.string().regex(/^\s*(?:\S+(?:\s+\S+){0,24})?\s*$/, "Source quotes must contain at most 25 words").optional(),
  }).optional(),
});
export type Criterion = z.infer<typeof CriterionSchema>;

type RecursiveRule = Criterion | { all: RecursiveRule[] } | { any: RecursiveRule[] } | { not: RecursiveRule };

export const RuleNodeSchema: z.ZodType<RecursiveRule> = z.lazy(() => z.union([
  z.strictObject({ all: z.array(RuleNodeSchema) }),
  z.strictObject({ any: z.array(RuleNodeSchema) }),
  z.strictObject({ not: RuleNodeSchema }),
  CriterionSchema,
]));
export type RuleNode = z.infer<typeof RuleNodeSchema>;

export const SchemeSchema = z.strictObject({
  id: z.string().min(1),
  name: I18nTextSchema,
  shortName: z.string().optional(),
  level: z.enum(["central", "state"]),
  state: z.literal("KA").optional(),
  category: z.enum(["pension", "health", "housing", "education", "agriculture", "livelihood", "insurance", "women_child", "disability", "other"]),
  benefit: z.strictObject({
    summary: I18nTextSchema,
    amountINR: z.number().optional(),
    period: z.enum(["one_time", "monthly", "yearly"]).optional(),
  }),
  rule: RuleNodeSchema,
  documents: z.array(z.string()),
  steps: z.array(I18nTextSchema),
  applyUrl: z.httpUrl().optional(),
  sourceUrl: z.httpUrl(),
  lastChecked: z.iso.date(),
  verifyNotes: z.array(I18nTextSchema).optional(),
  priority: z.number().int().min(1).max(5).optional(),
});
export type Scheme = z.infer<typeof SchemeSchema>;

export const DocumentDefSchema = z.strictObject({
  id: z.string().min(1),
  name: I18nTextSchema,
  howToGet: I18nTextSchema,
  portalUrl: z.httpUrl().optional(),
  verify: z.boolean().optional(),
});
export type DocumentDef = z.infer<typeof DocumentDefSchema>;

export const SchemeBundleSchema = z.strictObject({
  version: z.string().min(1),
  publishedAt: z.iso.datetime({ offset: true }),
  fields: z.array(FieldDefSchema),
  documents: z.array(DocumentDefSchema),
  schemes: z.array(SchemeSchema),
});
export type SchemeBundle = z.infer<typeof SchemeBundleSchema>;
