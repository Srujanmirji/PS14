import type { Criterion, FieldDef, RuleNode } from "@yojana/contracts";
import type { ValidationIssue } from "./load";

export function validateRule(
  file: string,
  rule: RuleNode,
  fields: Map<string, FieldDef>,
  issues: ValidationIssue[],
): void {
  const criterionIds = new Set<string>();
  visitRule(rule, "$.rule", (criterion, path) => {
    if (criterionIds.has(criterion.id)) {
      addError(issues, file, `${path}.id`, `Duplicate criterion id "${criterion.id}"`);
    } else {
      criterionIds.add(criterion.id);
    }

    const field = fields.get(criterion.field);
    if (!field) {
      addError(issues, file, `${path}.field`, `Unknown field id "${criterion.field}"`);
      return;
    }

    const valueIssue = criterionValueIssue(criterion, field);
    if (valueIssue) addError(issues, file, `${path}.value`, valueIssue);
  });
}

function visitRule(
  rule: RuleNode,
  path: string,
  visit: (criterion: Criterion, path: string) => void,
): void {
  if ("all" in rule) {
    rule.all.forEach((child, index) => visitRule(child, `${path}.all[${index}]`, visit));
  } else if ("any" in rule) {
    rule.any.forEach((child, index) => visitRule(child, `${path}.any[${index}]`, visit));
  } else if ("not" in rule) {
    visitRule(rule.not, `${path}.not`, visit);
  } else {
    visit(rule, path);
  }
}

function criterionValueIssue(criterion: Criterion, field: FieldDef): string | undefined {
  const hasValue = Object.hasOwn(criterion, "value");
  if (criterion.op === "truthy" || criterion.op === "falsy") {
    return hasValue ? `${criterion.op} must not define a value` : undefined;
  }
  if (!hasValue) return `${criterion.op} requires a value`;

  if (criterion.op === "between") {
    if (field.type !== "number") return "between is only valid for number fields";
    if (!Array.isArray(criterion.value) || criterion.value.length !== 2
      || !criterion.value.every((value) => typeof value === "number")) {
      return "between requires exactly two numeric bounds";
    }
    const [lower, upper] = criterion.value;
    if (lower === undefined || upper === undefined || lower > upper) {
      return "between bounds must be ordered from lower to upper";
    }
    return numericRangeIssue([lower, upper], field);
  }

  if (criterion.op === "lt" || criterion.op === "lte"
    || criterion.op === "gt" || criterion.op === "gte") {
    if (field.type !== "number" || typeof criterion.value !== "number") {
      return `${criterion.op} requires a numeric field and numeric value`;
    }
    return numericRangeIssue([criterion.value], field);
  }

  if (criterion.op === "in" || criterion.op === "nin") {
    if (!Array.isArray(criterion.value) || criterion.value.length === 0) {
      return `${criterion.op} requires a non-empty array`;
    }
    for (const value of criterion.value) {
      const issue = scalarValueIssue(value, field);
      if (issue) return issue;
    }
    return undefined;
  }

  return scalarValueIssue(criterion.value, field);
}

function scalarValueIssue(value: unknown, field: FieldDef): string | undefined {
  if (field.type === "number") {
    if (typeof value !== "number") return "Expected a numeric value";
    return numericRangeIssue([value], field);
  }
  if (field.type === "boolean") {
    return typeof value === "boolean" ? undefined : "Expected a boolean value";
  }
  if (typeof value !== "string") return "Expected a string value";
  if (field.type === "enum" && !field.options?.includes(value)) {
    return `Value "${value}" is not an allowed option for field "${field.id}"`;
  }
  return undefined;
}

function numericRangeIssue(values: number[], field: FieldDef): string | undefined {
  for (const value of values) {
    if (field.min !== undefined && value < field.min) {
      return `Value ${value} is below field minimum ${field.min}`;
    }
    if (field.max !== undefined && value > field.max) {
      return `Value ${value} is above field maximum ${field.max}`;
    }
  }
  return undefined;
}

function addError(
  issues: ValidationIssue[],
  file: string,
  path: string,
  message: string,
): void {
  issues.push({ severity: "error", file, path, message });
}
