import { z } from "zod";
import { I18nTextSchema } from "./lang";

export const FieldTypeSchema = z.enum(["boolean", "number", "enum", "string"]);
export type FieldType = z.infer<typeof FieldTypeSchema>;

const rangeSchema = z.strictObject({
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
}).refine((range) => Object.values(range).some((bound) => bound !== undefined), {
  message: "A range must contain at least one numeric bound",
}).meta({ minProperties: 1 });

export const FieldValueSchema = z.union([z.boolean(), z.number(), z.string(), rangeSchema]);
export type FieldValue = z.infer<typeof FieldValueSchema>;

export const QuickReplySchema = z.strictObject({
  label: I18nTextSchema,
  value: FieldValueSchema,
});
export type QuickReply = z.infer<typeof QuickReplySchema>;

export const FieldDefSchema = z.strictObject({
  id: z.string().min(1),
  type: FieldTypeSchema,
  options: z.array(z.string()).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  unit: z.enum(["INR_per_year", "years", "acres", "hectares", "percent"]).optional(),
  sensitive: z.boolean().optional(),
  askOrder: z.number(),
  askable: z.boolean().optional(),
  question: I18nTextSchema,
  why: I18nTextSchema.optional(),
  quickReplies: z.array(QuickReplySchema).optional(),
});
export type FieldDef = z.infer<typeof FieldDefSchema>;
