import { Compiler } from "webpack";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { NextEraPluginType } from "@/src/sw/lib/definitions.js";
import _ from "lodash";

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
        resources: [],
      },
    });
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
        sw.replace(
          /(addResourcesToCache)\([^\)]*\)/,
          `$1(${JSON.stringify(this.#options.sw.resources)})`
        )
      );

      const md5 = this.readMD5Sync(inputFile);

      console.log(`[NextEraPlugin] Service worker's MD5: ${md5}`);

      const component = fs.readFileSync(this.#options.sw.component, "utf8");

      fs.writeFileSync(
        this.#options.sw.component,
        component.replaceAll(/\/sw\.js(?:\?v=[\w]+)?/g, `/sw.js?v=${md5}`)
      );
    });
  }
}
