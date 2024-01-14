#!/bin/node

const { execSync } = require("child_process");
const { rmSync, writeFileSync } = require("fs");
const { join } = require("path");

rmSync("dist", { recursive: true, force: true });
rmSync("types", { recursive: true, force: true });
try {
  console.log("[MSMC]:Checking dependencies....");
  console.log(execSync(`npm i`).toString("ascii"));
  console.log("[MSMC]:Compiling commonjs....");
  console.log(execSync(`tsc -b ./tsconfig.cjs.json`).toString("ascii"));
  console.log("[MSMC]:Compiling es6....");
  console.log(execSync(`tsc -b ./tsconfig.mjs.json`).toString("ascii"));
  console.log("[MSMC]:Adding patch");
  writeFileSync(
    join("dist", "mjs", "package.json"),
    JSON.stringify({ type: "module", private: true }),
  );

  console.log("[MSMC]:Constructing declarations....");
  console.log(execSync(`tsc -b ./tsconfig.types.json`).toString("ascii"));
} catch (e) {
  console.log(e.toString("ascii"));
}
