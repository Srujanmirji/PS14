import { basename, dirname } from "node:path";
import type { FieldDef, Scheme } from "@yojana/contracts";
import { validateRule } from "./validate-rule";
import type { LoadedSchemeData, ValidationIssue } from "./load";

const DAY_MS = 24 * 60 * 60 * 1_000;
const MAX_LAST_CHECKED_AGE_DAYS = 90;

export function validateSchemeData(
  data: LoadedSchemeData,
  now: Date = new Date(),
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const fields = uniqueDefinitions(data.fields, "fields.json", issues);
  const documents = uniqueDefinitions(data.documents, "documents.json", issues);
  const schemeIds = new Map<string, string>();

  validateFieldDefinitions(data.fields, issues);

  for (const { file, scheme } of data.schemes) {
    validateSchemeFile(file, scheme, issues);
    validateSchemeId(file, scheme, schemeIds, issues);
    validateLastChecked(file, scheme, now, issues);
    validateDocuments(file, scheme, documents, issues);
    validateRule(file, scheme.rule, fields, issues);
  }

  return issues;
}

function uniqueDefinitions<T extends { id: string }>(
  definitions: T[],
  file: string,
  issues: ValidationIssue[],
): Map<string, T> {
  const result = new Map<string, T>();
  definitions.forEach((definition, index) => {
    if (result.has(definition.id)) {
      error(issues, file, `$[${index}].id`, `Duplicate id "${definition.id}"`);
    } else {
      result.set(definition.id, definition);
    }
  });
  return result;
}

function validateFieldDefinitions(fields: FieldDef[], issues: ValidationIssue[]): void {
  fields.forEach((field, index) => {
    const path = `$[${index}]`;
    if (field.type === "enum" && (!field.options || field.options.length === 0)) {
      error(issues, "fields.json", `${path}.options`, "Enum fields require at least one option");
    }
    if (field.options && new Set(field.options).size !== field.options.length) {
      error(issues, "fields.json", `${path}.options`, "Field options must be unique");
    }
    if (field.min !== undefined && field.max !== undefined && field.min > field.max) {
      error(issues, "fields.json", path, "Field min cannot be greater than max");
    }
  });
}

function validateSchemeFile(file: string, scheme: Scheme, issues: ValidationIssue[]): void {
  const fileId = basename(file, ".json");
  if (scheme.id !== fileId) {
    error(issues, file, "$.id", `Scheme id "${scheme.id}" must match file name "${fileId}"`);
  }

  const directory = basename(dirname(file));
  if (directory === "central" && (scheme.level !== "central" || scheme.state !== undefined)) {
    error(issues, file, "$.level", "Schemes in data/central must be central and have no state");
  }
  if (directory === "karnataka" && (scheme.level !== "state" || scheme.state !== "KA")) {
    error(issues, file, "$.state", "Schemes in data/karnataka must have level state and state KA");
  }
}

function validateSchemeId(
  file: string,
  scheme: Scheme,
  schemeIds: Map<string, string>,
  issues: ValidationIssue[],
): void {
  const firstFile = schemeIds.get(scheme.id);
  if (firstFile) {
    error(issues, file, "$.id", `Duplicate scheme id "${scheme.id}"; first declared in ${firstFile}`);
  } else {
    schemeIds.set(scheme.id, file);
  }
}

function validateLastChecked(
  file: string,
  scheme: Scheme,
  now: Date,
  issues: ValidationIssue[],
): void {
  const checkedAt = new Date(`${scheme.lastChecked}T00:00:00Z`);
  const ageDays = Math.floor((now.getTime() - checkedAt.getTime()) / DAY_MS);
  if (ageDays > MAX_LAST_CHECKED_AGE_DAYS) {
    issues.push({
      severity: "warning",
      file,
      path: "$.lastChecked",
      message: `Last checked ${ageDays} days ago (older than ${MAX_LAST_CHECKED_AGE_DAYS} days)`,
    });
  }
}

function validateDocuments(
  file: string,
  scheme: Scheme,
  documents: Map<string, { id: string }>,
  issues: ValidationIssue[],
): void {
  scheme.documents.forEach((documentId, index) => {
    if (!documents.has(documentId)) {
      error(issues, file, `$.documents[${index}]`, `Unknown document id "${documentId}"`);
    }
  });
}

function error(
  issues: ValidationIssue[],
  file: string,
  path: string,
  message: string,
): void {
  issues.push({ severity: "error", file, path, message });
}
