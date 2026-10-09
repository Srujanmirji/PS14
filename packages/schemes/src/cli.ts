import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { buildBundle } from "./bundle";
import { loadSchemeData, SchemeDataError } from "./load";
import type { ValidationIssue } from "./load";
import { validateSchemeData } from "./validate";

interface CliDependencies {
  rootDirectory?: string;
  outputFile?: string;
  now?: Date;
  stdout?: (message: string) => void;
  stderr?: (message: string) => void;
}

export async function runCli(
  args: string[],
  dependencies: CliDependencies = {},
): Promise<number> {
  const stdout = dependencies.stdout ?? console.log;
  const stderr = dependencies.stderr ?? console.error;

  try {
    const data = await loadSchemeData(dependencies.rootDirectory);
    const issues = validateSchemeData(data, dependencies.now);
    printIssues(issues, stdout, stderr);
    if (issues.some((issue) => issue.severity === "error")) return 1;

    const command = args[0];
    if (command === "check") {
      stdout(`Validated ${data.schemes.length} scheme files`);
      return 0;
    }
    if (command === "bundle") {
      const state = option(args, "--state");
      if (!state) {
        stderr("--state is required (for example: --state KA)");
        return 1;
      }
      const outputFile = dependencies.outputFile
        ?? resolve(data.rootDirectory, "../../apps/web/public/schemes.bundle.json");
      const bundle = await buildBundle(state, { data, now: dependencies.now });
      await mkdir(dirname(outputFile), { recursive: true });
      await writeFile(outputFile, `${JSON.stringify(bundle, null, 2)}\n`, "utf8");
      stdout(`Wrote ${bundle.schemes.length} schemes to ${outputFile}`);
      return 0;
    }

    stderr("Usage: cli.ts <check|bundle> [--state KA]");
    return 1;
  } catch (cause) {
    if (cause instanceof SchemeDataError) {
      printIssues(cause.issues, stdout, stderr);
    } else {
      stderr(cause instanceof Error ? cause.message : "Unknown schemes error");
    }
    return 1;
  }
}

function option(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function printIssues(
  issues: ValidationIssue[],
  stdout: (message: string) => void,
  stderr: (message: string) => void,
): void {
  for (const issue of issues) {
    const message = `${issue.file}:${issue.path} ${issue.message}`;
    (issue.severity === "error" ? stderr : stdout)(message);
  }
}

const isEntryPoint = process.argv[1] !== undefined
  && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isEntryPoint) process.exitCode = await runCli(process.argv.slice(2));
