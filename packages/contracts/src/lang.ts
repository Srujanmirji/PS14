import { z } from "zod";

export const LangSchema = z.enum(["en", "kn", "hi"]);
export type Lang = z.infer<typeof LangSchema>;

export const I18nTextSchema = z.strictObject({
  en: z.string().min(1),
  kn: z.string().min(1),
  hi: z.string().min(1),
});
export type I18nText = z.infer<typeof I18nTextSchema>;
