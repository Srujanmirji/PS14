export interface ValidationIssue {
  severity: "error" | "warning";
  file: string;
  path: string;
  message: string;
}

export class SchemeDataError extends Error {
  readonly issues: ValidationIssue[];

  constructor(issues: ValidationIssue[]) {
    super(issues.map((issue) => `${issue.file}:${issue.path} ${issue.message}`).join("\n"));
    this.name = "SchemeDataError";
    this.issues = issues;
  }
}
