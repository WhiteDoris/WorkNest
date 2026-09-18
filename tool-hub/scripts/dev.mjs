import { spawn } from "node:child_process";

const viteArgs = process.argv.slice(2);
const api = spawn(process.execPath, ["server/index.mjs"], { stdio: "inherit", env: process.env });
const vite = spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["vite", ...viteArgs], { stdio: "inherit", env: process.env });

const stop = (code = 0) => {
  api.kill("SIGTERM");
  vite.kill("SIGTERM");
  process.exit(code);
};

api.on("error", () => stop(1));
vite.on("error", () => stop(1));
process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));
