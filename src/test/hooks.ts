import * as fs from "fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

type NextEraContextType = {
  conditions: string[];
  importAttributes: Record<string, unknown>;
  parentURL: string | undefined;
};

const possibleExtensions = [".ts", ".mts", ".cts", ".js", ".mjs", ".cjs"];

function resolveFileWithExtensions(basePath: string): string {
  console.debug(`[NextEraHook] BasePath: ${basePath}`);

  basePath = path.isAbsolute(basePath)
    ? basePath
    : path.resolve(import.meta.dirname, basePath);

  if (path.extname(basePath) && fs.existsSync(basePath)) {
    return basePath;
  }

  const dirname = path.dirname(basePath);
  const fileName = path.basename(basePath, path.extname(basePath));

  for (const ext of possibleExtensions) {
    const fullPath = path.resolve(dirname, `${fileName}${ext}`);

    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  throw new Error(
    `File not found: ${basePath}. Tried extensions: ${possibleExtensions}`,
  );
}

export async function initialize({
  number,
  port,
}: {
  number: number;
  port: MessagePort;
}) {
  port.postMessage(`increment: ${number + 1}`);
}

export async function resolve(
  specifier: string,
  context: NextEraContextType,
  nextResolve: (
    specifier: string,
    context?: NextEraContextType,
  ) => Promise<string>,
) {
  console.debug(`[NextEraHook] Resolving: ${specifier}`, context);

  try {
    specifier = fileURLToPath(specifier);
  } catch {}

  try {
    specifier = pathToFileURL(resolveFileWithExtensions(specifier)).href;
  } catch {}

  console.debug(`[NextEraHook] Resolved: ${specifier}`);

  return nextResolve(specifier, {
    ...context,
    conditions: [...context.conditions, "another-condition"],
  });
}

export async function load(
  url: string,
  context: NextEraContextType,
  nextLoad: (
    url: string,
    context?: NextEraContextType,
  ) => Promise<{ format: string; source?: string; responseURL?: string }>,
) {
  console.debug(`[NextEraHook] Loading: ${url}`);

  const result = await nextLoad(url, context);

  try {
    url = fileURLToPath(result.responseURL ?? url);
  } catch {}

  console.debug(`[NextEraHook] URL: ${url}`);

  try {
    result.source = fs.readFileSync(url, "utf8");
  } catch {}

  if (result.source) {
    const { outputText } = ts.transpileModule(
      result.source, // The source code content
      {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ESNext,
          strict: true,
        },
        fileName: url,
      },
    );

    result.source = outputText;
  }

  console.debug(`[NextEraHook] Loaded: ${url}`);

  return result;
}
