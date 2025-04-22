#!/usr/bin/env node

import { execSync } from "child_process";

const args = process.argv.slice(2);
const cmd = args[0];

switch (cmd) {
  case "test":
    execSync(
      "node --experimental-vm-modules --experimental-test-coverage --import tsx node_modules/next-era/dist/test/index.js",
      { stdio: "inherit" },
    );
    break;
  default:
    console.log(`Unknown command: ${cmd}`);
    console.log("Available commands: test");
}
