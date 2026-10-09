import { createHash } from "node:crypto";
import { SchemeBundleSchema } from "@yojana/contracts";
import type { SchemeBundle } from "@yojana/contracts";
import { loadSchemeData, SchemeDataError } from "./load";
import type { LoadedSchemeData } from "./load";
import { validateSchemeData } from "./validate";

export interface BuildBundleOptions {
  data?: LoadedSchemeData;
  now?: Date;
  rootDirectory?: string;
}

export async function buildBundle(
  state: string,
  options: BuildBundleOptions = {},
): Promise<SchemeBundle> {
  const normalizedState = state.trim().toUpperCase();
  if (normalizedState !== "KA") throw new Error(`Unsupported state "${state}"`);

  const data = options.data ?? await loadSchemeData(options.rootDirectory);
  const now = options.now ?? new Date();
  const errors = validateSchemeData(data, now)
    .filter((issue) => issue.severity === "error");
  if (errors.length > 0) throw new SchemeDataError(errors);

  const publishedAt = now.toISOString();
  const schemes = data.schemes
    .map(({ scheme }) => scheme)
    .filter((scheme) => scheme.level === "central" || scheme.state === normalizedState);
  const content = { fields: data.fields, documents: data.documents, schemes };
  const shortHash = createHash("sha256")
    .update(stableStringify(content))
    .digest("hex")
    .slice(0, 8);
  const version = `${publishedAt}-${normalizedState.toLowerCase()}-${shortHash}`;

  return SchemeBundleSchema.parse({ version, publishedAt, ...content });
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value);
}
