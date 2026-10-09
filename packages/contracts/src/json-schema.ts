import { z } from "zod";

export function toJsonSchema(schema: z.ZodType) {
  return z.toJSONSchema(schema);
}
