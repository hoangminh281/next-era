import * as crypto from "crypto";
import * as fs from "fs";
import _ from "lodash";
import * as path from "path";
import { Compiler } from "webpack";
import { readFileNames } from "../lib/utils.js";
import { interpolate } from "../utils/index.js";
import {
  NextEraPluginMethodEnum,
  NextEraPluginType,
} from "./lib/definitions.js";

export default class NextEraPlugin {
  #options: NextEraPluginType & {
    sw: {
      input: string;
      component: string;
      output: string;
    };
  };

  constructor(options: Partial<NextEraPluginType>) {
    const nodeEnv = options.sw?.nodeEnv || process.env.NODE_ENV || "production";

    this.#options = {
      sw: {
        input: "node_modules/next-era/dist/sw/public/sw.js",
        component: "node_modules/next-era/dist/sw/component.js",
        output: "public/sw.js",
        nodeEnv,
        cacheName: _.get(options, "sw.cacheName", "v1"),
        resources: _.compact(
          _.union(
            _.get(options, "sw.resources", []),
            readFileNames("public", { exclude: ["/sw.js"], root: "public" }),
          ),
        ),
        strategy: {
          filter: _.compact(
            _.union(_.get(options, "sw.strategy.filter", []), [
              { method: NextEraPluginMethodEnum.Get, allow: true },
            ]),
          ),
          cf: _.compact(_.get(options, "sw.strategy.cf", [])),
          nf: _.compact(
            _.union(
              _.get(options, "sw.strategy.nf", []),
              nodeEnv === "development" ? ["/**"] : undefined,
            ),
          ),
          swr: _.compact(_.get(options, "sw.strategy.swr", [])),
        },
      },
    };
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
            cacheName: JSON.stringify(this.#options.sw.cacheName),
            resources: JSON.stringify(this.#options.sw.resources),
            task: {
              install:
                this.#options.sw.nodeEnv === "development"
                  ? "self.skipWaiting()"
                  : undefined,
              activate:
                this.#options.sw.nodeEnv === "development"
                  ? "selve.clients.claim()"
                  : undefined,
            },
            strategy: {
              filter: JSON.stringify(this.#options.sw.strategy.filter),
              cf: JSON.stringify(this.#options.sw.strategy.cf),
              nf: JSON.stringify(this.#options.sw.strategy.nf),
              swr: JSON.stringify(this.#options.sw.strategy.swr),
            },
          }),
      );

      const md5 = this.readMD5Sync(outputFile);
      const resourcesSize = this.#options.sw.resources.length;
      const { filter, nf, swr, cf } = this.#options.sw.strategy;

      console.debug(
        `[NextEraPlugin] Service worker's cache name: ${this.#options.sw.cacheName}`,
      );
      console.debug(`[NextEraPlugin] Service worker's MD5: ${md5}`);
      console.debug(
        `[NextEraPlugin] Service worker's resources (${resourcesSize}/${resourcesSize}): ${JSON.stringify(this.#options.sw.resources, null, " ")}`,
      );
      console.debug(
        `[NextEraPlugin] Service worker's filters (${filter.length}/${filter.length}): ${JSON.stringify(filter, null, " ")}`,
      );
      console.debug(
        `[NextEraPlugin] Service worker's CF URIs (${cf.length}/${cf.length}): ${JSON.stringify(cf, null, " ")}`,
      );
      console.debug(
        `[NextEraPlugin] Service worker's NF URIs (${nf.length}/${nf.length}): ${JSON.stringify(nf, null, " ")}`,
      );
      console.debug(
        `[NextEraPlugin] Service worker's SWR URIs (${swr.length}/${swr.length}): ${JSON.stringify(swr, null, " ")}`,
      );

      const component = fs.readFileSync(this.#options.sw.component, "utf8");

      fs.writeFileSync(
        this.#options.sw.component,
        component.replaceAll(/\/sw\.js(?:\?v=[\w]+)?/g, `/sw.js?v=${md5}`),
      );
    });
  }
}
