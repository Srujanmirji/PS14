import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { ExtractResponseSchema } from "@yojana/contracts";
import { describe, expect, test, vi } from "vitest";
import {
  createGeminiProviderFromEnv,
  GeminiProvider,
  GeminiProviderError,
} from "../src/providers/llm/gemini";

const fixtureDirectory = new URL("./fixtures/", import.meta.url);

async function fixtureResponse(name: string, status = 200): Promise<Response> {
  const body = await readFile(fileURLToPath(new URL(name, fixtureDirectory)), "utf8");
  return new Response(body, {
    status,
    headers: { "content-type": "application/json" },
  });
}

function providerWith(fetch: typeof globalThis.fetch): GeminiProvider {
  return new GeminiProvider({
    apiKey: "recorded-fixture-key",
    model: "gemini-recorded-fixture",
    fetch,
  });
}

describe("GeminiProvider", () => {
  test("replays a recorded structured response and validates it", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(() => fixtureResponse("gemini-json-success.json"));
    const provider = providerWith(fetch);

    await expect(provider.json({
      system: "system prompt",
      user: "user prompt",
      schema: ExtractResponseSchema,
      maxTokens: 400,
    })).resolves.toEqual({
      updates: [{
        field: "marital_status",
        value: "widow",
        evidence: "I am a widow",
      }],
    });

    expect(fetch).toHaveBeenCalledOnce();
    const [url, init] = fetch.mock.calls[0] ?? [];
    expect(url).toBe(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-recorded-fixture:generateContent",
    );
    expect(init?.headers).toEqual({
      "content-type": "application/json",
      "x-goog-api-key": "recorded-fixture-key",
    });
    expect(init?.signal).toBeInstanceOf(AbortSignal);
    expect(JSON.parse(String(init?.body))).toMatchObject({
      systemInstruction: { parts: [{ text: "system prompt" }] },
      contents: [{ role: "user", parts: [{ text: "user prompt" }] }],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 400,
        responseMimeType: "application/json",
      },
    });
    expect(JSON.parse(String(init?.body)).generationConfig.responseSchema).toBeTypeOf("object");
  });

  test("replays a recorded text response", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(() => fixtureResponse("gemini-text-success.json"));

    await expect(providerWith(fetch).text({
      system: "system prompt",
      user: "user prompt",
    })).resolves.toBe("A short recorded explanation.");
  });

  test.each([
    "gemini-malformed-structured-output.json",
    "gemini-schema-invalid-output.json",
  ])("rejects invalid structured fixture %s", async (fixture) => {
    const fetch = vi.fn<typeof globalThis.fetch>(() => fixtureResponse(fixture));

    await expect(providerWith(fetch).json({
      system: "system prompt",
      user: "user prompt",
      schema: ExtractResponseSchema,
    })).rejects.toMatchObject({ code: "PROVIDER_FAILED" });
  });

  test("rejects an invalid recorded provider envelope", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(() => fixtureResponse("gemini-empty-candidates.json"));

    await expect(providerWith(fetch).text({
      system: "system prompt",
      user: "user prompt",
    })).rejects.toMatchObject({ code: "PROVIDER_FAILED" });
  });

  test("does not expose a recorded provider error body", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(() => fixtureResponse("gemini-text-success.json", 429));

    await expect(providerWith(fetch).text({
      system: "system prompt",
      user: "user prompt",
    })).rejects.toEqual(expect.objectContaining({
      code: "PROVIDER_FAILED",
      message: "Gemini request failed with status 429",
    }));
  });

  test("maps an aborted request to TIMEOUT", async () => {
    vi.useFakeTimers();
    const fetch = vi.fn<typeof globalThis.fetch>((_input, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(init.signal?.reason), { once: true });
    }));
    const result = providerWith(fetch).text({
      system: "system prompt",
      user: "user prompt",
      timeoutMs: 25,
    });

    await vi.advanceTimersByTimeAsync(25);
    await expect(result).rejects.toBeInstanceOf(GeminiProviderError);
    await expect(result).rejects.toMatchObject({ code: "TIMEOUT" });
    vi.useRealTimers();
  });

  test("defaults the provider timeout to eight seconds", async () => {
    const timeout = vi.spyOn(AbortSignal, "timeout");
    const fetch = vi.fn<typeof globalThis.fetch>(() => fixtureResponse("gemini-text-success.json"));

    await providerWith(fetch).text({
      system: "system prompt",
      user: "user prompt",
    });

    expect(timeout).toHaveBeenCalledWith(8_000);
    timeout.mockRestore();
  });

  test("requires env-only production configuration", () => {
    expect(() => createGeminiProviderFromEnv({})).toThrow("LLM_API_KEY is required");
    expect(() => createGeminiProviderFromEnv({ LLM_API_KEY: "key" })).toThrow("LLM_MODEL is required");
    expect(createGeminiProviderFromEnv({
      LLM_API_KEY: "key",
      LLM_MODEL: "gemini-model",
    })).toBeInstanceOf(GeminiProvider);
  });
});
