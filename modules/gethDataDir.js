"use strict";

const {execFileSync} = require("child_process");
const path = require("path");

let dataDir;

function resolveDataDir(gethPath) {
  // Let geth apply its own platform defaults, migration, and legacy fallback.
  // dumpconfig exits without starting a node or opening its databases.
  const config = execFileSync(gethPath, ["dumpconfig"], {
    encoding: "utf8",
    windowsHide: true,
    timeout: 15000
  });
  const match = config.match(/^DataDir\s*=\s*(".*")\s*$/m);
  const resolved = match && JSON.parse(match[1]);

  if (typeof resolved !== "string" || !path.isAbsolute(resolved)) {
    throw new Error("Geth did not report an absolute data directory.");
  }

  dataDir = resolved;
  return dataDir;
}

function getDataDir() {
  if (!dataDir) {
    throw new Error("The node data directory is not ready yet.");
  }
  return dataDir;
}

module.exports = {resolveDataDir, getDataDir};
