import { z } from "zod";
import { FieldValueSchema } from "./fields";
import { LangSchema } from "./lang";
import { ProfileEntrySchema } from "./profile";
import { CriterionResultSchema, StatusSchema } from "./verdict";

export const ExtractRequestSchema = z.strictObject({
  utterance: z.string(),
  lang: LangSchema,
  known: z.record(z.string(), FieldValueSchema),
  askedField: z.string().optional(),
});
export type ExtractRequest = z.infer<typeof ExtractRequestSchema>;

export const ExtractResponseSchema = z.strictObject({
  updates: z.array(z.strictObject({ field: z.string().min(1), value: FieldValueSchema, evidence: z.string() })),
  unclear: z.string().optional(),
});
export type ExtractResponse = z.infer<typeof ExtractResponseSchema>;

export const ExplainRequestSchema = z.strictObject({
  schemeId: z.string().min(1),
  status: StatusSchema,
  results: z.array(CriterionResultSchema),
  lang: LangSchema,
});
export type ExplainRequest = z.infer<typeof ExplainRequestSchema>;

export const ExplainResponseSchema = z.strictObject({ text: z.string(), cached: z.boolean() });
export type ExplainResponse = z.infer<typeof ExplainResponseSchema>;

export const FeedbackRequestSchema = z.strictObject({
  schemeId: z.string().optional(),
  screen: z.string().min(1),
  helpful: z.boolean(),
  comment: z.string().max(280).optional(),
  lang: LangSchema,
  appVersion: z.string().min(1),
});
export type FeedbackRequest = z.infer<typeof FeedbackRequestSchema>;

export const FeedbackResponseSchema = z.strictObject({ ok: z.literal(true) });
export type FeedbackResponse = z.infer<typeof FeedbackResponseSchema>;

// Multipart metadata only; audio validation belongs to BE-10.
export const SttRequestSchema = z.strictObject({ lang: LangSchema });
export type SttRequest = z.infer<typeof SttRequestSchema>;

export const SttResponseSchema = z.strictObject({ text: z.string() });
export type SttResponse = z.infer<typeof SttResponseSchema>;

export const TtsRequestSchema = z.strictObject({ text: z.string().max(600), lang: LangSchema });
export type TtsRequest = z.infer<typeof TtsRequestSchema>;

export const BaselineRequestSchema = z.strictObject({
  profile: z.record(z.string(), ProfileEntrySchema),
  schemeIds: z.array(z.string()),
});
export type BaselineRequest = z.infer<typeof BaselineRequestSchema>;

export const BaselineResponseSchema = z.strictObject({
  verdicts: z.array(z.strictObject({ schemeId: z.string().min(1), status: StatusSchema })),
});
export type BaselineResponse = z.infer<typeof BaselineResponseSchema>;

export const ErrorBodySchema = z.strictObject({
  error: z.strictObject({
    code: z.enum(["INVALID_INPUT", "PROVIDER_FAILED", "TIMEOUT", "RATE_LIMITED", "NOT_FOUND", "UNAUTHORIZED", "INTERNAL"]),
    message: z.string(),
    requestId: z.string().min(1),
  }),
});
export type ErrorBody = z.infer<typeof ErrorBodySchema>;
