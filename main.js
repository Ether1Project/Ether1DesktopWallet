// Modules to control application life and create native browser window
const {
  app,
  ipcMain,
  BrowserWindow
} = require("electron");
const path = require("path");
const fs = require("fs");
const EthoGeth = require("./modules/geth.js");

if (process.platform === "linux") {
  process.env.ELECTRON_DISABLE_SANDBOX = "1";
  app.commandLine.appendSwitch("no-sandbox");
}

let isQuitting = false;
let mainWindow = null;

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (!mainWindow) {
      return;
    }

    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }

    mainWindow.show();
    mainWindow.focus();
  });

  function shutdownNode() {
    if (isQuitting) {
      return;
    }

    isQuitting = true;
    EthoGeth.stopGeth();
  }

  function createWindow() {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
      return;
    }

    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 1100,
      minHeight: 700,
      backgroundColor: "#000000",
      icon: "assets/images/icon.png",
      webPreferences: {
        nodeIntegration: true
      }
    });

    mainWindow.loadFile("index.html");
    EthoGeth.startGeth();

    mainWindow.on("closed", function() {
      mainWindow = null;
    });

    require("./modules/menu.js");
  }

  app.on("ready", createWindow);

  app.on("window-all-closed", function() {
    if (process.platform !== "darwin") {
      shutdownNode();
      app.quit();
    }
  });

  app.on("before-quit", function() {
    shutdownNode();
  });

  app.on("activate", function() {
    if (mainWindow === null) {
      createWindow();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  ipcMain.on("getTemplateContent", (event, arg) => {
    event.returnValue = fs.readFileSync(path.join(app.getAppPath(), "assets/templates/") + arg, "utf8");
  });

  ipcMain.on("appQuit", () => {
    shutdownNode();
    app.quit();
  });
}

require("./modules/accounts.js");
require("./modules/database.js");
