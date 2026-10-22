// Generates packages/ui/types/api.gen.ts from itoolbox-backend's committed
// OpenAPI schema. A script rather than an inline npm command because npm runs
// scripts with cmd.exe on Windows, where ${VAR:-default} does not expand.
//
//   npm run gen:types
//   ITOOLBOX_CONTRACT_DIR=/path/to/itoolbox-backend/contract npm run gen:types

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const contractDir = resolve(root, process.env.ITOOLBOX_CONTRACT_DIR ?? "../itoolbox-backend/contract");
const input = join(contractDir, "openapi.api.json");
const output = join(root, "packages", "ui", "types", "api.gen.ts");

if (!existsSync(input)) {
  console.error(`No contract at ${input}.\nSet ITOOLBOX_CONTRACT_DIR to itoolbox-backend's contract/ directory.`);
  process.exit(1);
}

const require = createRequire(import.meta.url);
const cli = join(dirname(require.resolve("openapi-typescript/package.json")), "bin", "cli.js");
execFileSync(process.execPath, [cli, input, "-o", output], { stdio: "inherit" });
