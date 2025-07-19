const { ipcMain } = require("electron");
const storage = require("electron-storage");
const path = require("path");
const fs = require("fs");

class ConnectionManager {
  constructor() {
    this.connectionMode = 'local'; // Default to local mode for backward compatibility
    this.loadConnectionMode();
  }

  loadConnectionMode() {
    try {
      const storagePath = path.join(require("electron").app.getPath("userData"), "connection-mode.json");
      
      // Try to read synchronously first
      if (fs.existsSync(storagePath)) {
        const data = fs.readFileSync(storagePath, 'utf8');
        const parsed = JSON.parse(data);
        if (parsed && parsed.mode) {
          this.connectionMode = parsed.mode;
          console.log("Loaded connection mode:", this.connectionMode);
          return;
        }
      }
      
      // Fallback to async storage method
      storage.get(storagePath, (err, data) => {
        if (!err && data && data.mode) {
          this.connectionMode = data.mode;
          console.log("Loaded connection mode (async):", this.connectionMode);
        } else {
          console.log("No saved connection mode found, using default:", this.connectionMode);
        }
      });
    } catch (err) {
      console.log("Error loading connection mode, defaulting to RPC:", err.message);
    }
  }

  saveConnectionMode() {
    try {
      const storagePath = path.join(require("electron").app.getPath("userData"), "connection-mode.json");
      
      // Save synchronously to ensure it's written immediately
      const data = { mode: this.connectionMode };
      fs.writeFileSync(storagePath, JSON.stringify(data, null, 2));
      console.log("Saved connection mode:", this.connectionMode);
      
    } catch (err) {
      console.log("Error saving connection mode:", err);
      
      // Fallback to async storage
      try {
        storage.set(storagePath, { mode: this.connectionMode }, (err) => {
          if (err) console.log("Error saving connection mode (async):", err);
          else console.log("Saved connection mode (async):", this.connectionMode);
        });
      } catch (fallbackErr) {
        console.log("Error with fallback save:", fallbackErr);
      }
    }
  }

  getConnectionMode() {
    return this.connectionMode;
  }

  setConnectionMode(mode) {
    this.connectionMode = mode;
    this.saveConnectionMode();
  }
}

// IPC handlers
ipcMain.on("getConnectionMode", (event) => {
  const mode = EthoConnection.getConnectionMode();
  console.log("IPC getConnectionMode returning:", mode);
  event.returnValue = mode;
});

ipcMain.on("setConnectionMode", (event, mode) => {
  console.log("IPC setConnectionMode called with:", mode);
  EthoConnection.setConnectionMode(mode);
  console.log("Connection mode set to:", EthoConnection.getConnectionMode());
  event.returnValue = { success: true };
});

EthoConnection = new ConnectionManager();
