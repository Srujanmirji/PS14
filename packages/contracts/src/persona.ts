import { z } from "zod";
import { ProfileEntrySchema } from "./profile";
import { StatusSchema } from "./verdict";

export const PersonaSchema = z.strictObject({
  id: z.string().min(1),
  description: z.string(),
  tags: z.array(z.enum(["complete", "partial", "edge"])),
  profile: z.record(z.string(), ProfileEntrySchema),
  truth: z.record(z.string(), ProfileEntrySchema).optional(),
  expected: z.record(z.string(), StatusSchema),
  labelledBy: z.tuple([z.string().min(1), z.string().min(1)]),
  notes: z.string().optional(),
});
export type Persona = z.infer<typeof PersonaSchema>;
