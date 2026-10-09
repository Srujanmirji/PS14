import { toJsonSchema } from "@yojana/contracts";
import { z } from "zod";
import type { LlmProvider } from "./types";

const DEFAULT_TIMEOUT_MS = 8_000;
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

const GeminiResponseSchema = z.object({
  candidates: z.array(z.object({
    content: z.object({
      parts: z.array(z.object({ text: z.string() })).min(1),
    }),
  })).min(1),
});

type ProviderErrorCode = "PROVIDER_FAILED" | "TIMEOUT";

export class GeminiProviderError extends Error {
  readonly code: ProviderErrorCode;

  constructor(code: ProviderErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "GeminiProviderError";
    this.code = code;
  }
}

interface GeminiProviderOptions {
  apiKey: string;
  model: string;
  fetch?: typeof globalThis.fetch;
}

interface GenerateArgs {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  responseSchema?: z.ZodType;
}

export class GeminiProvider implements LlmProvider {
  private readonly apiKey: string;
  private readonly fetch: typeof globalThis.fetch;
  private readonly model: string;

  constructor(options: GeminiProviderOptions) {
    if (!options.apiKey.trim()) {
      throw new Error("LLM_API_KEY is required for the Gemini provider");
    }
    if (!options.model.trim()) {
      throw new Error("LLM_MODEL is required for the Gemini provider");
    }

    this.apiKey = options.apiKey;
    this.model = options.model.replace(/^models\//, "");
    this.fetch = options.fetch ?? globalThis.fetch;
  }

  async json<T>(args: {
    system: string;
    user: string;
    schema: z.ZodType<T>;
    temperature?: number;
    maxTokens?: number;
    timeoutMs?: number;
  }): Promise<T> {
    const text = await this.generate({ ...args, responseSchema: args.schema });

    try {
      return args.schema.parse(JSON.parse(text));
    } catch (cause) {
      throw new GeminiProviderError(
        "PROVIDER_FAILED",
        "Gemini returned invalid structured output",
        { cause },
      );
    }
  }

  text(args: {
    system: string;
    user: string;
    temperature?: number;
    maxTokens?: number;
    timeoutMs?: number;
  }): Promise<string> {
    return this.generate(args);
  }

  private async generate(args: GenerateArgs): Promise<string> {
    const timeoutMs = args.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const signal = AbortSignal.timeout(timeoutMs);
    const generationConfig: Record<string, unknown> = {
      temperature: args.temperature ?? 0,
    };

    if (args.maxTokens !== undefined) {
      generationConfig.maxOutputTokens = args.maxTokens;
    }
    if (args.responseSchema !== undefined) {
      generationConfig.responseMimeType = "application/json";
      generationConfig.responseSchema = toJsonSchema(args.responseSchema);
    }

    let response: Response;
    try {
      response = await this.fetch(
        `${GEMINI_BASE_URL}/models/${encodeURIComponent(this.model)}:generateContent`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-goog-api-key": this.apiKey,
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: args.system }] },
            contents: [{ role: "user", parts: [{ text: args.user }] }],
            generationConfig,
          }),
          signal,
        },
      );
    } catch (cause) {
      if (signal.aborted) {
        throw new GeminiProviderError("TIMEOUT", "Gemini request timed out", { cause });
      }
      throw new GeminiProviderError("PROVIDER_FAILED", "Gemini request failed", { cause });
    }

    if (!response.ok) {
      throw new GeminiProviderError(
        "PROVIDER_FAILED",
        `Gemini request failed with status ${response.status}`,
      );
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch (cause) {
      throw new GeminiProviderError("PROVIDER_FAILED", "Gemini returned invalid JSON", { cause });
    }

    const parsed = GeminiResponseSchema.safeParse(payload);
    if (!parsed.success) {
      throw new GeminiProviderError("PROVIDER_FAILED", "Gemini returned an invalid response");
    }

    const text = parsed.data.candidates[0]?.content.parts
      .map((part) => part.text)
      .join("")
      .trim();
    if (!text) {
      throw new GeminiProviderError("PROVIDER_FAILED", "Gemini returned an empty response");
    }

    return text;
  }
}

export function createGeminiProviderFromEnv(
  environment: NodeJS.ProcessEnv = process.env,
): GeminiProvider {
  return new GeminiProvider({
    apiKey: environment.LLM_API_KEY ?? "",
    model: environment.LLM_MODEL ?? "",
  });
}
