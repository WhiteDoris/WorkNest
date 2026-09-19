import { spawn } from "node:child_process";

const previewArgs = process.argv.slice(2);
const api = spawn(process.execPath, ["server/index.mjs"], { stdio: "inherit", env: process.env });
const preview = spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["vite", "preview", ...previewArgs], { stdio: "inherit", env: process.env });

const stop = (code = 0) => {
  api.kill("SIGTERM");
  preview.kill("SIGTERM");
  process.exit(code);
};

api.on("error", () => stop(1));
preview.on("error", () => stop(1));
process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));
