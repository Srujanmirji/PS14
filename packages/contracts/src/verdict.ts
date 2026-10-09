import { z } from "zod";

export const TruthSchema = z.union([z.boolean(), z.literal("unknown")]);
export type Truth = z.infer<typeof TruthSchema>;

export const StatusSchema = z.enum(["eligible", "maybe", "ineligible"]);
export type Status = z.infer<typeof StatusSchema>;

export const CriterionResultSchema = z.strictObject({
  criterionId: z.string().min(1),
  field: z.string().min(1),
  result: TruthSchema,
});
export type CriterionResult = z.infer<typeof CriterionResultSchema>;

export const VerdictSchema = z.strictObject({
  schemeId: z.string().min(1),
  status: StatusSchema,
  results: z.array(CriterionResultSchema),
  missingFields: z.array(z.string()),
  failed: z.array(z.string()),
  nearMiss: z.strictObject({ criterionId: z.string().min(1), field: z.string().min(1) }).optional(),
  score: z.number(),
});
export type Verdict = z.infer<typeof VerdictSchema>;

export const NextQuestionSchema = z.strictObject({
  field: z.string().min(1),
  unlocks: z.number().int().nonnegative(),
  schemeIds: z.array(z.string()),
});
export type NextQuestion = z.infer<typeof NextQuestionSchema>;
