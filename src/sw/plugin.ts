import * as crypto from "crypto";
import * as fs from "fs";
import _ from "lodash";
import * as path from "path";
import { Compiler } from "webpack";
import { interpolate, normalizePath } from "../utils/index.js";
import { NextEraPluginType } from "./lib/definitions.js";

export default class NextEraPlugin {
  #options: NextEraPluginType & {
    sw: {
      input: string;
      component: string;
      output: string;
    };
  };

  constructor(options: Partial<NextEraPluginType>) {
    this.#options = _.defaultsDeep({}, options, {
      sw: {
        input: "node_modules/next-era/dist/sw/public/sw.js",
        component: "node_modules/next-era/dist/sw/component.js",
        output: "public/sw.js",
        resources: [
          ...(options.sw?.resources || []),
          ...this.readFiles("public", ["/sw.js"]),
        ],
        strategy: {
          nf: _.compact([
            ...(options.sw?.strategy.nf || []),
            process.env.NODE_ENV === "development" ? "/**" : undefined,
          ]),
          swr: _.compact([...(options.sw?.strategy.swr || [])]),
          cf: _.compact([...(options.sw?.strategy.cf || [])]),
        },
      },
    });
  }

  doReadFiles = (dir: string, parentPath: string, files: string[]) => {
    fs.readdirSync(dir, { withFileTypes: true }).map((entry) => {
      const file = path.join(parentPath, entry.name);
      const filePath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        this.doReadFiles(filePath, file, files);
      } else {
        files.push(normalizePath(file));
      }
    });
  };

  readFiles(dir: string, exclude: string[] = []) {
    const files: string[] = [];

    this.doReadFiles(dir, "/", files);

    return _.without(files, ...exclude);
  }

  readMD5Sync(filePath: string) {
    const fileBuffer = fs.readFileSync(filePath);

    return crypto.createHash("md5").update(fileBuffer).digest("hex");
  }

  apply(compiler: Compiler) {
    compiler.hooks.environment.tap("NextEraPlugin", () => {
      const inputFile = path.resolve(this.#options.sw.input);
      const inputDir = path.dirname(inputFile);
      const outputFile = path.resolve(this.#options.sw.output);

      if (!fs.existsSync(inputDir)) {
        console.warn(`[NextEraPlugin] Directory not found: ${inputDir}`);

        return;
      }

      const sw = fs.readFileSync(inputFile, "utf8");

      fs.writeFileSync(
        outputFile,
        interpolate(
          /(?:\/\/[ ]*{{([\s\S]+?)}}$)|(?:\/\*[ ]*{{([\s\S]+?)}}[ ]*\*\/).*$/gm,
        )
          .template(sw)
          .compiled({
            resourcesToCache: JSON.stringify(this.#options.sw.resources),
            task: {
              install:
                process.env.NODE_ENV === "development"
                  ? "self.skipWaiting()"
                  : undefined,
              activate:
                process.env.NODE_ENV === "development"
                  ? "selve.clients.claim()"
                  : undefined,
            },
            strategy: {
              nf: JSON.stringify(this.#options.sw.strategy.nf),
              swr: JSON.stringify(this.#options.sw.strategy.swr),
              cf: JSON.stringify(this.#options.sw.strategy.cf),
            },
          }),
      );

      const md5 = this.readMD5Sync(outputFile);
      const resourcesSize = this.#options.sw.resources.length;
      const { nf, swr, cf } = this.#options.sw.strategy;

      console.debug(`[NextEraPlugin] Service worker's MD5: ${md5}`);
      console.debug(
        `[NextEraPlugin] Service worker's resources (${resourcesSize}/${resourcesSize}): ${JSON.stringify(this.#options.sw.resources, null, " ")}`,
      );
      console.debug(
        `[NextEraPlugin] Service worker's NF URIs (${nf.length}/${nf.length}): ${JSON.stringify(nf, null, " ")}`,
      );
      console.debug(
        `[NextEraPlugin] Service worker's SWR URIs (${swr.length}/${swr.length}): ${JSON.stringify(swr, null, " ")}`,
      );
      console.debug(
        `[NextEraPlugin] Service worker's CF URIs (${cf.length}/${cf.length}): ${JSON.stringify(cf, null, " ")}`,
      );

      const component = fs.readFileSync(this.#options.sw.component, "utf8");

      fs.writeFileSync(
        this.#options.sw.component,
        component.replaceAll(/\/sw\.js(?:\?v=[\w]+)?/g, `/sw.js?v=${md5}`),
      );
    });
  }
}
