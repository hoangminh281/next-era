import * as fs from "fs";
import * as path from "path";
import { normalizePath, wildcardize } from "../utils/index.js";

export function readFileNames(
  dir: string,
  options: { exclude?: string[]; pattern?: string; root?: string },
) {
  const files: string[] = [];
  const test = options.pattern ? wildcardize(options.pattern).test : undefined;

  fs.readdirSync(dir, { withFileTypes: true, recursive: true }).map((entry) => {
    const file = path.join("/", entry.parentPath, entry.name);

    if (!entry.isDirectory()) {
      let normalizedPath = normalizePath(file);

      if (options.exclude?.includes(normalizedPath)) {
        return;
      }

      if (test && !test(normalizedPath)) {
        return;
      }

      if (options.root) {
        const normalizedRoot = normalizePath(path.join("/", options.root));

        if (normalizedPath.startsWith(normalizedRoot)) {
          normalizedPath = normalizedPath.replace(
            new RegExp(`^${normalizedRoot}`),
            "",
          );
        }
      }

      files.push(normalizedPath);
    }
  });

  return files;
}
