"use strict";

const WebSocket = require("ws");

const DEFAULT_WS_URL = process.env.GETH_WS_URL || "ws://127.0.0.1:8546";

function createRpcClient(wsUrl = DEFAULT_WS_URL) {
  const socket = new WebSocket(wsUrl);
  const pending = new Map();

  socket.on("message", (rawMessage) => {
    let message;

    try {
      message = JSON.parse(rawMessage);
    } catch (error) {
      return;
    }

    const deferred = pending.get(message.id);

    if (!deferred) {
      return;
    }

    pending.delete(message.id);

    if (message.error) {
      deferred.reject(new Error(message.error.message || "RPC request failed"));
      return;
    }

    deferred.resolve(message.result);
  });

  socket.on("close", () => {
    for (const deferred of pending.values()) {
      deferred.reject(new Error("geth WebSocket connection closed"));
    }

    pending.clear();
  });

  socket.on("error", (error) => {
    if (socket.readyState === WebSocket.CONNECTING) {
      for (const deferred of pending.values()) {
        deferred.reject(error);
      }

      pending.clear();
    }
  });

  return {
    nextId: 1,
    pending,
    socket,
    wsUrl
  };
}

function waitForConnection(client, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const {socket} = client;

    if (socket.readyState === WebSocket.OPEN) {
      resolve();
      return;
    }

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("timed out waiting for the geth WebSocket connection"));
    }, timeoutMs);

    function cleanup() {
      clearTimeout(timeout);

      socket.removeListener("open", onConnect);
      socket.removeListener("error", onError);
    }

    function onConnect() {
      cleanup();
      resolve();
    }

    function onError(error) {
      cleanup();
      reject(error instanceof Error ? error : new Error(String(error)));
    }

    socket.on("open", onConnect);
    socket.on("error", onError);
  });
}

function callRpc(client, method, params, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const {socket, pending} = client;
    const id = client.nextId++;
    const timeout = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`RPC timeout calling ${method}`));
    }, timeoutMs);

    pending.set(id, {
      reject: (error) => {
        clearTimeout(timeout);
        reject(error);
      },
      resolve: (result) => {
        clearTimeout(timeout);
        resolve(result);
      }
    });

    socket.send(
      JSON.stringify({
        jsonrpc: "2.0",
        id,
        method,
        params
      }),
      (error) => {
        if (error) {
          clearTimeout(timeout);
          pending.delete(id);
          reject(error);
        }
      }
    );
  });
}

function disconnect(client) {
  if (client.socket.readyState === WebSocket.OPEN || client.socket.readyState === WebSocket.CONNECTING) {
    client.socket.close(1000, "done");
  }
}

module.exports = {
  DEFAULT_WS_URL,
  callRpc,
  createRpcClient,
  disconnect,
  waitForConnection
};
