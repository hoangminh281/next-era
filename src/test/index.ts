import _ from "lodash";
import assert, { AssertPredicate } from "node:assert/strict";
import { readFileSync } from "node:fs";
import { format } from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { createContext, SourceTextModule } from "node:vm";
import ts from "typescript";
import { readFileNames } from "../lib/utils.js";
import { TemplateType } from "./lib/definitions.js";

const assertMapping = {
  equal: assert.equal,
  strictEqual: assert.strictEqual,
  deepStrictEqual: assert.deepStrictEqual,
  partialDeepStrictEqual: assert.partialDeepStrictEqual,
  notStrictEqual: assert.notStrictEqual,
  notDeepStrictEqual: assert.notDeepStrictEqual,
  match: (output, expected, message) =>
    assert.match(output as string, expected as RegExp, message),
  doesNotMatch: (output, expected, message) =>
    assert.doesNotMatch(output as string, expected as RegExp, message),
  doesNotReject: (output, expected, message) =>
    assert.doesNotReject(
      output as (() => Promise<unknown>) | Promise<unknown>,
      expected as AssertPredicate,
      message,
    ),
  doesNotThrow: (output, expected, message) =>
    assert.doesNotThrow(
      output as () => unknown,
      expected as AssertPredicate,
      message,
    ),
  fail: (_output: unknown, _expected: unknown, message) => assert.fail(message),
  ok: (output: unknown, _expected: unknown, message) =>
    assert.ok(output, message),
  ifError: (output: unknown) => assert.ifError(output),
} satisfies Record<
  string,
  (
    output: unknown,
    expected: unknown,
    message: string | Error | undefined,
  ) => unknown
>;

readFileNames("test", { pattern: "**/*.spec.ts" }).map(async (fileName) => {
  const testPath = pathToFileURL(
    format({ root: process.cwd(), base: fileName }),
  ).href;

  console.debug(`[NextEraTesting] Reading: ${fileName} => ${testPath}`);

  const {
    default: template,
  }: {
    default: {
      [module: string]: { [name: string]: TemplateType<unknown[], unknown> };
    };
  } = await import(testPath);

  for (const moduleName in template) {
    const fnNames = Object.keys(template[moduleName]);

    console.debug(
      `[NextEraTesting] Exporting ${fnNames} from ${moduleName}...`,
    );

    // Create the export declaration: export const __TESTING__ = { ... }; for mocking
    const testingExportDeclaration = ts.factory.createVariableStatement(
      [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)], // export
      ts.factory.createVariableDeclarationList(
        [
          ts.factory.createVariableDeclaration(
            ts.factory.createIdentifier("__TESTING__"),
            undefined,
            undefined,
            ts.factory.createObjectLiteralExpression(
              fnNames.map((fnName) =>
                ts.factory.createShorthandPropertyAssignment(
                  ts.factory.createIdentifier(fnName),
                ),
              ),
            ),
          ),
        ],
        ts.NodeFlags.Const,
      ),
    );

    for (const fnName of fnNames) {
      console.debug(
        `[NextEraTesting] Preparing module ${moduleName} to test function ${fnName}...`,
      );

      const { test: _test } = template[moduleName][fnName];

      console.debug(`[NextEraTesting] Reading module file ${moduleName}...`);

      // Read the module's code
      const modulePath = format({
        root: process.cwd(),
        base: moduleName,
      });
      const tsCode = readFileSync(modulePath, "utf-8");

      console.debug(`[NextEraTesting] Parsing the loaded code...`);

      // Parse the loaded code into a SourceFile
      const sourceFile = ts.createSourceFile(
        modulePath, // The file name (used for diagnostics)
        tsCode, // The source code content
        ts.ScriptTarget.ESNext, // Script target (can be changed if needed)
        false, // Set to `false` to not set the `isDeclarationFile` flag
        ts.ScriptKind.TS, // Treat as TypeScript code
      );

      console.debug(`[NextEraTesting] Exporting the prepared declaration...`);

      // Updated SourceFile with new statements
      const updatedSourceFile = ts.factory.updateSourceFile(sourceFile, [
        ...sourceFile.statements,
        testingExportDeclaration, // Add the new export statement
      ]);

      // Transform the typescript to javascript with exporting the __TESTING__ object
      const { outputText: jsCode } = ts.transpileModule(
        ts
          .createPrinter()
          .printNode(ts.EmitHint.Unspecified, updatedSourceFile, sourceFile),
        {
          compilerOptions: {
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ESNext,
            strict: true,
          },
        },
      );

      console.debug(
        `[NextEraTesting] Transpiled module ${moduleName} to JS...`,
      );

      // Prepare the context including global variables,...
      const context: Record<string, unknown> = {};

      for (const attribute in _test.context) {
        context[attribute] = _test.context[attribute];

        console.debug(
          `[NextEraTesting] Added context ${attribute} to module ${moduleName}`,
        );
      }

      // Create the module context and build the module
      createContext(context);
      const _module = new SourceTextModule(jsCode, { context });

      console.debug(`[NextEraTesting] Running module ${moduleName}...`);

      // Link and evaluate
      await _module.link((specifier) => {
        throw new Error(`Unable to resolve module: ${specifier}`);
      });
      await _module.evaluate();

      const fn =
        _.get(_module, ["namespace", "__TESTING__", fnName]) ||
        _.get(_module, ["default", fnName]) ||
        _.get(_module, fnName);

      test(_test.label || fnName, _test.config, async (t) => {
        _.map(_test.cases, (_case, index) => {
          t.test(_case.label || `Case #${index}`, () => {
            let output = _.isArray(_case.input)
              ? fn(..._case.input)
              : _case.input(fn);
            let expected = _case.expected;
            const assert = _.defaultsDeep({}, _case.assert, _test.assert);

            if (_.isArray(output) && _.isArray(expected)) {
              output = JSON.stringify(output);
              expected = JSON.stringify(expected);
            }

            _.get(assertMapping, assert.method, assertMapping.strictEqual)(
              output,
              expected,
              assert.message,
            );
          });
        });
      });
    }
  }
});
