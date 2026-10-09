import { readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DocumentDefSchema,
  FieldDefSchema,
  SchemeSchema,
} from "@yojana/contracts";
import type { DocumentDef, FieldDef, Scheme } from "@yojana/contracts";
import { SchemeDataError } from "./errors";
import type { ValidationIssue } from "./errors";

export { SchemeDataError } from "./errors";
export type { ValidationIssue } from "./errors";

const packageRoot = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));

interface ParseIssue {
  message: string;
  path: readonly PropertyKey[];
}

interface SchemaParser<T> {
  safeParse(value: unknown):
    | { success: true; data: T }
    | { success: false; error: { issues: readonly ParseIssue[] } };
}

export interface SchemeSource {
  file: string;
  scheme: Scheme;
}

export interface LoadedSchemeData {
  rootDirectory: string;
  fields: FieldDef[];
  documents: DocumentDef[];
  schemes: SchemeSource[];
}

export async function loadSchemeData(
  rootDirectory: string = packageRoot,
): Promise<LoadedSchemeData> {
  const issues: ValidationIssue[] = [];
  const fields = await readJson(
    rootDirectory,
    "fields.json",
    arrayParser(FieldDefSchema),
    issues,
  );
  const documents = await readJson(
    rootDirectory,
    "documents.json",
    arrayParser(DocumentDefSchema),
    issues,
  );
  const schemes: SchemeSource[] = [];

  for (const directory of ["data/central", "data/karnataka"]) {
    const files = await listJsonFiles(rootDirectory, directory, issues);
    for (const file of files) {
      const scheme = await readJson(rootDirectory, file, SchemeSchema, issues);
      if (scheme !== undefined) schemes.push({ file, scheme });
    }
  }

  if (issues.some((issue) => issue.severity === "error")) {
    throw new SchemeDataError(issues);
  }

  return {
    rootDirectory,
    fields: fields ?? [],
    documents: documents ?? [],
    schemes,
  };
}

function arrayParser<T>(item: SchemaParser<T>): SchemaParser<T[]> {
  return {
    safeParse(value: unknown) {
      if (!Array.isArray(value)) {
        return {
          success: false,
          error: { issues: [{ path: [], message: "Expected an array" }] },
        };
      }

      const data: T[] = [];
      const issues: ParseIssue[] = [];
      value.forEach((entry, index) => {
        const parsed = item.safeParse(entry);
        if (parsed.success) {
          data.push(parsed.data);
        } else {
          issues.push(...parsed.error.issues.map((issue) => ({
            ...issue,
            path: [index, ...issue.path],
          })));
        }
      });

      return issues.length === 0
        ? { success: true, data }
        : { success: false, error: { issues } };
    },
  };
}

async function listJsonFiles(
  rootDirectory: string,
  directory: string,
  issues: ValidationIssue[],
): Promise<string[]> {
  try {
    const entries = await readdir(join(rootDirectory, directory), { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => join(directory, entry.name))
      .sort();
  } catch (cause) {
    issues.push({
      severity: "error",
      file: directory,
      path: "$",
      message: filesystemMessage(cause),
    });
    return [];
  }
}

async function readJson<T>(
  rootDirectory: string,
  file: string,
  schema: SchemaParser<T>,
  issues: ValidationIssue[],
): Promise<T | undefined> {
  let source: string;
  try {
    source = await readFile(join(rootDirectory, file), "utf8");
  } catch (cause) {
    issues.push({
      severity: "error",
      file,
      path: "$",
      message: filesystemMessage(cause),
    });
    return undefined;
  }

  let value: unknown;
  try {
    value = JSON.parse(source);
  } catch (cause) {
    issues.push({
      severity: "error",
      file,
      path: "$",
      message: cause instanceof Error ? cause.message : "Invalid JSON",
    });
    return undefined;
  }

  const parsed = schema.safeParse(value);
  if (parsed.success) return parsed.data;

  issues.push(...parsed.error.issues.map((issue) => ({
    severity: "error" as const,
    file,
    path: jsonPath(issue.path),
    message: issue.message,
  })));
  return undefined;
}

function jsonPath(path: readonly PropertyKey[]): string {
  return path.reduce<string>((result, segment) => (
    typeof segment === "number"
      ? `${result}[${segment}]`
      : `${result}.${String(segment)}`
  ), "$");
}

function filesystemMessage(cause: unknown): string {
  if (cause instanceof Error && "code" in cause && cause.code === "ENOENT") {
    return "Required file or directory is missing";
  }
  return cause instanceof Error ? cause.message : "Unable to read file";
}
