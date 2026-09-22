"use strict";

/**
 * gethPeers.js
 *
 * Provides the static bundled peer list and a dynamic `getPeers()` resolver.
 *
 * Peer resolution order (first valid result wins):
 *   1. Local override  – <userData>/peers.json         (drop-in for devs/node-ops)
 *   2. Remote fetch    – GitHub raw peers.json (3.5s timeout), cached on success
 *   3. Remote cache    – <userData>/peers-cache.json   (last successful remote fetch)
 *   4. Bundled copy    – <appRoot>/peers.json           (packaged with the release build)
 *   5. Hardcoded list  – the array exported below      (last-resort fallback)
 *
 * To update peers for all users without rebuilding:
 *   Simply edit peers.json in the Ether1DesktopWallet repository and merge to master.
 *   Running wallets will pick up the new list on the next startup.
 */

const fs   = require("fs");
const path = require("path");
const https = require("https");

// --- Bundled / hardcoded peer list (always kept in sync with peers.json) ---
const BUNDLED_PEERS = [
  "enode://a1adc27c5fd897fc4b34982575f127bb301d95667afff122800b1cb9453f406cc4f5fcdd0e78ccbbaf7a9497cb4adf315bc98e904a0ca230446b2bb18e0e911a@62.72.177.111:31100",
  "enode://98b92937b5385fe49062e7ba759f80447c2ecdc6e3e2db4fda6f40a4966722a998c4c1f381f7a6644fff1c700173639b15b75a5de7457fccedaf86cc5b04ca68@62.72.177.99:29999",
  "enode://7e88f7d46fe2feeef9c7b74993e9a0a18531f88cbf62f28e3a72c719c0b13496cdbd91af4d8e58ab4b9b77f10ce247de7540784e51611be24d7c80371f246669@62.72.177.114:29999",
  "enode://9d6f31ddac9c96078fc929dac5790be477e8ea8c5c7afe64db0d533f7447b5ba829ab5e3bce77ed534ce042901b1a6a9e6b4a2f3aeb45e86be809463aa5ae2c0@62.72.177.114:30305"
];

// Remote URL — edit peers.json on GitHub master to update all running wallets without a rebuild.
const REMOTE_PEERS_URL =
  "https://raw.githubusercontent.com/Ether1Project/Ether1DesktopWallet/master/peers.json";

const REMOTE_TIMEOUT_MS = 3500;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns `arr` if it is a non-empty array of enode strings, otherwise null.
 * @param {unknown} arr
 * @returns {string[]|null}
 */
function validatePeers(arr) {
  if (
    Array.isArray(arr) &&
    arr.length > 0 &&
    arr.every((p) => typeof p === "string" && p.startsWith("enode://"))
  ) {
    return arr;
  }
  return null;
}

/**
 * Tries to read and parse a JSON peer list from `filePath`.
 * Returns null on any error.
 * @param {string} filePath
 * @returns {string[]|null}
 */
function readPeersFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, "utf8");
    return validatePeers(JSON.parse(raw));
  } catch (_) {
    return null;
  }
}

/**
 * Fetches the remote `peers.json` from GitHub with a configurable timeout.
 * Resolves with a validated array or null.
 * @returns {Promise<string[]|null>}
 */
function fetchRemotePeers() {
  return new Promise((resolve) => {
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        req.destroy();
        resolve(null);
      }
    }, REMOTE_TIMEOUT_MS);

    const req = https.get(REMOTE_PEERS_URL, (res) => {
      if (res.statusCode !== 200) {
        if (!settled) { settled = true; clearTimeout(timer); resolve(null); }
        res.resume();
        return;
      }

      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          try {
            resolve(validatePeers(JSON.parse(body)));
          } catch (_) {
            resolve(null);
          }
        }
      });
    });

    req.on("error", () => {
      if (!settled) { settled = true; clearTimeout(timer); resolve(null); }
    });
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Resolves the best available peer list using the priority chain described at
 * the top of this file.
 *
 * @param {string} [userDataDir] - Electron `app.getPath("userData")` or similar.
 *   Omit when running outside Electron (e.g. scripts/add-peers.js) — steps 1
 *   and 3 are skipped gracefully.
 * @returns {Promise<string[]>}
 */
async function getPeers(userDataDir) {
  // 1. Local override (devs / node operators)
  if (userDataDir) {
    const override = readPeersFile(path.join(userDataDir, "peers.json"));
    if (override) {
      console.log(`[gethPeers] Using local-override peers (${override.length})`);
      return override;
    }
  }

  // 2. Remote fetch from GitHub
  const remote = await fetchRemotePeers();
  if (remote) {
    console.log(`[gethPeers] Using remote peers (${remote.length})`);
    // Cache for future offline use
    if (userDataDir) {
      try {
        fs.writeFileSync(
          path.join(userDataDir, "peers-cache.json"),
          JSON.stringify(remote, null, 2),
          "utf8"
        );
      } catch (_) { /* non-fatal */ }
    }
    return remote;
  }

  // 3. Cached remote peers from a previous successful fetch
  if (userDataDir) {
    const cached = readPeersFile(path.join(userDataDir, "peers-cache.json"));
    if (cached) {
      console.log(`[gethPeers] Using cached remote peers (${cached.length})`);
      return cached;
    }
  }

  // 4. Bundled peers.json (packaged with the app build, at app root)
  try {
    const appRoot = require("app-root-path");
    const bundledPath = path.join(appRoot.path, "peers.json");
    const bundled = readPeersFile(bundledPath);
    if (bundled) {
      console.log(`[gethPeers] Using bundled peers.json (${bundled.length})`);
      return bundled;
    }
  } catch (_) { /* app-root-path may not be available in all contexts */ }

  // 5. Hardcoded fallback — always works
  console.log(`[gethPeers] Using hardcoded fallback peers (${BUNDLED_PEERS.length})`);
  return BUNDLED_PEERS;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

// Backward-compatible: `require("./gethPeers")` still returns the array.
module.exports = BUNDLED_PEERS;

// Named export for dynamic resolution.
module.exports.getPeers = getPeers;
