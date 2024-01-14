import { execSync } from "child_process";
console.log("Testing raw framework");
execSync("npm run start", { cwd: "tests/raw" });
console.log("Testing nwjs framework");
execSync("npm run start", { cwd: "tests/nwjs" });
console.log("Testing electron framework");
execSync("npm run start", { cwd: "tests/electron" });
