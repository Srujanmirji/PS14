import type { z } from "zod";

export interface LlmProvider {
  json<T>(args: {
    system: string;
    user: string;
    schema: z.ZodType<T>;
    temperature?: number;
    maxTokens?: number;
    timeoutMs?: number;
  }): Promise<T>;

  text(args: {
    system: string;
    user: string;
    temperature?: number;
    maxTokens?: number;
    timeoutMs?: number;
  }): Promise<string>;
}
