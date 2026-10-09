import { z } from "zod";
import { FieldValueSchema } from "./fields";
import { LangSchema } from "./lang";

export const ProfileEntrySchema = z.strictObject({
  value: FieldValueSchema,
  source: z.enum(["user_said", "user_tapped", "life_event", "demo"]),
  evidence: z.string().optional(),
  updatedAt: z.iso.datetime({ offset: true }),
});
export type ProfileEntry = z.infer<typeof ProfileEntrySchema>;

const profileBaseSchema = z.strictObject({
  id: z.string().min(1),
  lang: LangSchema,
  entries: z.record(z.string(), ProfileEntrySchema),
  declined: z.array(z.string()),
});
type RecursiveProfile = z.infer<typeof profileBaseSchema> & { members?: RecursiveProfile[] };

export const ProfileSchema: z.ZodType<RecursiveProfile> = z.lazy(() => profileBaseSchema.extend({
  members: z.array(ProfileSchema).optional(),
}));
export type Profile = z.infer<typeof ProfileSchema>;
