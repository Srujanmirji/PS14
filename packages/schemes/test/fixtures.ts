import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const temporaryDirectories: string[] = [];
export const text = { en: "Synthetic test", kn: "ಕೃತಕ ಪರೀಕ್ಷೆ", hi: "कृत्रिम परीक्षण" };

export async function cleanupTemporaryDirectories(): Promise<void> {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => (
    rm(directory, { recursive: true, force: true })
  )));
}

export async function validDataDirectory(): Promise<string> {
  const root = await temporaryDirectory();
  await mkdir(join(root, "data/central"), { recursive: true });
  await mkdir(join(root, "data/karnataka"), { recursive: true });
  await writeJson(join(root, "fields.json"), [
    { id: "age", type: "number", min: 0, max: 120, askOrder: 1, question: text },
    { id: "status", type: "enum", options: ["active", "inactive"], askOrder: 2, question: text },
  ]);
  await writeJson(join(root, "documents.json"), [
    { id: "proof", name: text, howToGet: text },
  ]);
  await writeJson(join(root, "data/central/central.alpha.json"), scheme({
    id: "central.alpha", field: "age", value: 18, document: "proof",
  }));
  await writeJson(join(root, "data/karnataka/ka.beta.json"), scheme({
    id: "ka.beta", field: "status", value: "active", state: "KA",
  }));
  return root;
}

export async function writeJson(file: string, value: unknown): Promise<void> {
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function criterion(id: string, field: string, op: "eq", value: unknown) {
  return { id, field, op, value, label: text };
}

function scheme(options: {
  id: string;
  field: string;
  value: number | string;
  document?: string;
  state?: "KA";
}) {
  return {
    id: options.id,
    name: text,
    level: options.state ? "state" : "central",
    ...(options.state ? { state: options.state } : {}),
    category: "other",
    benefit: { summary: text },
    rule: criterion(`${options.id}.criterion`, options.field, "eq", options.value),
    documents: options.document ? [options.document] : [],
    steps: [text],
    sourceUrl: `https://example.invalid/${options.id}`,
    lastChecked: "2026-10-09",
  };
}

export async function temporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "yojana-schemes-"));
  temporaryDirectories.push(directory);
  return directory;
}
