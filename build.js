#!/bin/node

const { execSync } = require("child_process");
const { rmSync } = require("fs");
const {resolve } = require("path");

rmSync('dist', { recursive: true, force: true });
rmSync('types', { recursive: true, force: true });
try {
    console.log("[MSMC]:Checking dependencies....")
    console.log(execSync(`npm i`).toString('ascii'))
    console.log("[MSMC]:Compiling....")
    console.log(execSync(`tsc -b ./tsconfig.dist.json`).toString('ascii'))
    console.log("[MSMC]:Constructing declarations....")
    console.log(execSync(`tsc -b ./tsconfig.dist.json`).toString('ascii'))
} catch (e) {
    console.log(e.toString('ascii'))
}