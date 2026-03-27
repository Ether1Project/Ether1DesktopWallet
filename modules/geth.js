const {app, dialog, ipcMain} = require("electron");
const child_process = require("child_process");
const appRoot = require("app-root-path");
const path = require("path");
const fs = require("fs");
const os = require("os");
const peers = require("./gethPeers");
const {
  callRpc,
  createRpcClient,
  disconnect,
  waitForConnection
} = require("./gethRpc");

class Geth {
  constructor() {
    this.isRunning = false;
    this.isStopping = false;
    this.gethProcess = null;
    this.autoAddPeersTimer = null;
    this.forceKillTimer = null;
    this.logGethEvents = false;
    // create the user data dir (needed for MacOS)
    if (!fs.existsSync(app.getPath("userData"))) {
      fs.mkdirSync(app.getPath("userData"));
    }

    if (this.logGethEvents) {
      this.logStream = fs.createWriteStream(path.join(app.getPath("userData"), "gethlog.txt"), {flags: "a"});
    }

    if (appRoot.path.indexOf("app.asar") > -1) {
      this.rootPath = path.dirname(appRoot.path);
    } else {
      this.rootPath = appRoot.path;
    }

    switch (os.type()) {
      case "Linux":
        this.binaries = path.join(this.rootPath, "bin", "linux");
        break;
      case "Darwin":
        this.binaries = path.join(this.rootPath, "bin", "macos");
        break;
      case "Windows_NT":
        this.binaries = path.join(this.rootPath, "bin", "win");
        break;
      default:
        this.binaries = path.join(this.rootPath, "bin", "win");
    }
  }

  _writeLog(text) {
    if (this.logGethEvents) {
      this.logStream.write(text);
    }
    if (process.env.ETHO_DEBUG_START === "1") {
      process.stdout.write(`[geth] ${text}`);
    }
    // Print log messages to the console
    //console.log("geth..."+text);
  }

  _clearAutoAddPeersTimer() {
    if (this.autoAddPeersTimer) {
      clearTimeout(this.autoAddPeersTimer);
      this.autoAddPeersTimer = null;
    }
  }

  _clearForceKillTimer() {
    if (this.forceKillTimer) {
      clearTimeout(this.forceKillTimer);
      this.forceKillTimer = null;
    }
  }

  _schedulePeerBootstrap(attempt = 0) {
    this._clearAutoAddPeersTimer();

    if (!this.isRunning) {
      return;
    }

    this.autoAddPeersTimer = setTimeout(async () => {
      const success = await this._addStartupPeers();

      if (!success && this.isRunning && attempt < 14) {
        this._schedulePeerBootstrap(attempt + 1);
      } else {
        this._clearAutoAddPeersTimer();
      }
    }, 2000);
  }

  async _addStartupPeers() {
    const client = createRpcClient();

    try {
      await waitForConnection(client, 5000);

      for (const peer of peers) {
        await callRpc(client, "admin_addPeer", [peer]);
      }

      this._writeLog(`startup peers configured (${peers.length})\n`);
      return true;
    } catch (err) {
      this._writeLog(`startup peers not ready: ${err.message}\n`);
      return false;
    } finally {
      disconnect(client);
    }
  }

  startGeth() {
    // get the path of get and execute the child process
    try {
      if (this.gethProcess && this.gethProcess.exitCode === null && !this.gethProcess.killed) {
        return;
      }

      this.isRunning = true;
      this.isStopping = false;
      const gethPath = path.join(this.binaries, "geth");
      this.gethProcess = child_process.spawn(gethPath, [
        "--ws",
        "--ws.origins",
        "*",
        "--ws.addr",
        "127.0.0.1",
        "--ws.port",
        "8546",
        "--ws.api",
        "admin,db,eth,net,miner,personal,web3",
        "--networkid",
        "1313114",
        "--allow-insecure-unlock"
      ]);
      this._schedulePeerBootstrap();

      if (!this.gethProcess) {
        dialog.showErrorBox("Error starting application", "Geth failed to start!");
        app.quit();
      } else {
        this.gethProcess.on("error", (err) => {
          if (!this.isStopping) {
            console.error(`Geth failed to start: ${err.message}`);
            dialog.showErrorBox("Error starting application", "Geth failed to start!");
            app.quit();
          }
        });
        this.gethProcess.on("close", () => {
          const wasStopping = this.isStopping;

          this._clearAutoAddPeersTimer();
          this._clearForceKillTimer();
          this.isRunning = false;
          this.isStopping = false;
          this.gethProcess = null;

          if (!wasStopping) {
            console.error("Geth exited unexpectedly during wallet startup or runtime.");
            dialog.showErrorBox("Error running the node", "The node stoped working. Wallet will close!");
            app.quit();
          }
        });
        this.gethProcess.stderr.on("data", function (data) {
          EthoGeth._writeLog(data.toString() + "\n");
        });
        this.gethProcess.stdout.on("data", function (data) {
          EthoGeth._writeLog(data.toString() + "\n");
        });
      }
    } catch (err) {
      dialog.showErrorBox("Error starting application", err.message);
      app.quit();
    }
  }

  stopGeth() {
    this.isRunning = false;
    this.isStopping = true;
    this._clearAutoAddPeersTimer();
    this._clearForceKillTimer();

    if (!this.gethProcess || this.gethProcess.exitCode !== null || this.gethProcess.killed) {
      this.gethProcess = null;
      this.isStopping = false;
      return;
    }

    if (os.type() == "Windows_NT") {
      const gethWrapePath = path.join(this.binaries, "WrapGeth.exe");
      child_process.spawnSync(gethWrapePath, [this.gethProcess.pid]);
    } else {
      this.gethProcess.kill("SIGTERM");
      this.forceKillTimer = setTimeout(() => {
        if (this.gethProcess && this.gethProcess.exitCode === null && !this.gethProcess.killed) {
          this.gethProcess.kill("SIGKILL");
        }
      }, 5000);
    }
  }
}

ipcMain.on("stopGeth", (event, arg) => {
  EthoGeth.stopGeth();
});

const EthoGeth = new Geth();

module.exports = EthoGeth;
