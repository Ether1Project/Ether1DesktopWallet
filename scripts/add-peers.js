"use strict";

const { getPeers } = require("../modules/gethPeers");
const {
  DEFAULT_WS_URL,
  callRpc,
  createRpcClient,
  disconnect,
  waitForConnection
} = require("../modules/gethRpc");

const client = createRpcClient(DEFAULT_WS_URL);

async function main() {
  try {
    await waitForConnection(client);

    // Resolve the latest peer list (remote → cache → bundled → hardcoded)
    const peers = await getPeers();

    const results = [];

    for (const peer of peers) {
      const added = await callRpc(client, "admin_addPeer", [peer]);
      results.push({peer, added});
    }

    results.forEach(({peer, added}) => {
      console.log(`${added ? "ADDED" : "SKIPPED"} ${peer}`);
    });
  } catch (error) {
    console.error(`Failed to add peers via ${DEFAULT_WS_URL}: ${error.message}`);
    process.exitCode = 1;
  } finally {
    disconnect(client);
  }
}

main();
