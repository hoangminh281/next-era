import * as fs from "fs";
import { register } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { MessageChannel } from "node:worker_threads";

const possibleExtensions = [".ts", ".js", ".mjs", ".cjs"];

function resolveFileWithExtensions(basePath: string): string {
  // If basePath already has extension and exists, return it directly

  basePath = path.isAbsolute(basePath)
    ? basePath
    : path.resolve(import.meta.dirname, basePath);

  console.debug(`[NextEraRegister] Resolving: ${basePath}`);

  if (path.extname(basePath) && fs.existsSync(basePath)) {
    return basePath;
  }

  const dirname = path.dirname(basePath);
  const fileName = path.basename(basePath, path.extname(basePath));

  for (const ext of possibleExtensions) {
    const fullPath = path.resolve(dirname, `${fileName}${ext}`);

    console.debug(`[NextEraRegister] Checking: ${fullPath}`);

    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  throw new Error(
    `File not found: ${basePath}. Tried extensions: ${possibleExtensions}`,
  );
}

const { port1, port2 } = new MessageChannel();

port1.on("message", (msg) => {
  console.log(msg);
});
port1.unref();

register(pathToFileURL(resolveFileWithExtensions("./hooks")), {
  parentURL: import.meta.url,
  data: { number: 1, port: port2 },
  transferList: [port2],
});
