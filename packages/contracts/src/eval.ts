import { z } from "zod";
import { StatusSchema } from "./verdict";

const countSchema = z.number().int().nonnegative();
const ratioSchema = z.number().min(0).max(1);
const rowSchema = z.tuple([countSchema, countSchema, countSchema]);
const metricsSchema = z.strictObject({
  pairs: countSchema,
  exact: ratioSchema,
  falseEligibleRate: ratioSchema,
  recall: ratioSchema,
  precision: ratioSchema,
  confusion: z.tuple([rowSchema, rowSchema, rowSchema]),
});

export const EvalReportSchema = z.strictObject({
  runAt: z.iso.datetime({ offset: true }),
  bundleVersion: z.string().min(1),
  engine: metricsSchema,
  baseline: metricsSchema.optional(),
  disagreements: z.array(z.strictObject({
    personaId: z.string().min(1),
    schemeId: z.string().min(1),
    expected: StatusSchema,
    engine: StatusSchema,
    baseline: StatusSchema.optional(),
  })),
});
export type EvalReport = z.infer<typeof EvalReportSchema>;
