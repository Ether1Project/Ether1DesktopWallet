"use strict";

const fs = require("fs");
const path = require("path");

module.exports = async function afterPack(context) {
  if (context.electronPlatformName !== "linux") {
    return;
  }

  const appOutDir = context.appOutDir;
  const executableName = (context.packager && context.packager.executableName) || "ethowallet";
  const launcherPath = path.join(appOutDir, executableName);
  const binaryPath = path.join(appOutDir, `${executableName}-bin`);

  if (!fs.existsSync(launcherPath)) {
    throw new Error(`Linux executable not found at ${launcherPath}`);
  }

  fs.renameSync(launcherPath, binaryPath);

  const launcherScript = `#!/bin/sh
HERE="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
export ELECTRON_DISABLE_SANDBOX=1
exec "$HERE/${executableName}-bin" --no-sandbox "$@"
`;

  fs.writeFileSync(launcherPath, launcherScript, {mode: 0o755});
};
