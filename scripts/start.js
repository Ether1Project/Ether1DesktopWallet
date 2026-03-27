"use strict";

const {spawn} = require("child_process");
const path = require("path");

const electronBinary = require("electron");
const appPath = path.resolve(__dirname, "..");
const env = Object.assign({}, process.env);
const args = [appPath];

env.ETHO_DEBUG_START = env.ETHO_DEBUG_START || "1";

if (process.platform === "linux") {
  env.ELECTRON_DISABLE_SANDBOX = env.ELECTRON_DISABLE_SANDBOX || "1";
  args.unshift("--no-sandbox");
}

const child = spawn(electronBinary, args, {
  env,
  stdio: "inherit"
});

child.on("error", (error) => {
  console.error(`Failed to launch Electron: ${error.message}`);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code === null ? 1 : code);
});
