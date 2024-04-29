const { app, dialog, ipcMain } = require("electron");
const admZip = require("adm-zip");
const path = require("path");
const fs = require("fs-extra");
const os = require("os");

class Accounts {
    constructor() {}
    
     getKeyStoreLocation() {
        const platform = os.type();
        let keystorePath;

        switch (platform) {
            case "Darwin":
                keystorePath = path.join(os.homedir(), "Library", "Ether1", "keystore");
                break;
            case "Windows_NT":
                if (process.env.APPDATA) {
                    keystorePath = path.join(process.env.APPDATA.replace('Roaming', 'Local'), "Ether1", "keystore");
                } else {
                    keystorePath = path.join(app.getPath("userData"), "Ether1", "keystore");
                }
                break;
            case "Linux":
                keystorePath = path.join(app.getPath("home"), ".ether1", "keystore");
                break;
            default:
                keystorePath = path.join(app.getPath("userData"), "Ether1", "keystore");
                break;
        }

        return Promise.resolve(keystorePath);
    }



     exportAccounts() {
        dialog.showSaveDialog({
        defaultPath: path.join(app.getPath("documents"), "accounts.zip")
        }).then(result => {
        if (!result.canceled) {
            const savePath = result.filePath;
            const accPathPromise = this.getKeyStoreLocation();

            accPathPromise.then(accPath => {
                fs.readdir(accPath, function (err, files) {
                    if (err) {
                        console.error("Error reading directory:", err);
                        // Handle the error, e.g., show an error dialog to the user
                        return;
                    }

                    var zip = new admZip();

                    for (let filePath of files) {
                        zip.addFile(filePath, fs.readFileSync(path.join(accPath, filePath)));
                    }

                    // store zip to path
                    zip.writeZip(savePath);
                });
            }).catch(err => {
                console.error("Error getting keystore location:", err);
                // Handle the error, e.g., show an error dialog to the user
            });
        }
        }).catch(err => {
        console.error("Error showing save dialog:", err);
        // Handle the error, e.g., show an error dialog to the user
        });
    }


    async importAccounts() {
        try {
        const openPath = await dialog.showOpenDialog({
            defaultPath: app.getPath("documents"),
            filters: [
                {
                    name: "archive",
                    extensions: ["zip"]
                },
                {
                    name: "json",
                    extensions: ["json"]
                },
                {
                    name: "All",
                    extensions: ["*"]
                }
            ]
        });
        
        if (!openPath.canceled && openPath.filePaths.length > 0) {
            const accPath = await this.getKeyStoreLocation();
            const extName = path.extname(openPath.filePaths[0]).toUpperCase();

            if (extName === ".ZIP") {
                const zip = new admZip(openPath.filePaths[0]);
                zip.extractAllTo(accPath, true);
                return { success: true, text: "Accounts were successfully imported." };
            } else {
                await fs.copy(openPath.filePaths[0], path.join(accPath, path.basename(openPath.filePaths[0])));
                return { success: true, text: "Account was successfully imported." };
            }
        } else {
            return { success: false, text: "No file selected for import." };
        }
        } catch (error) {
        return { success: false, text: error.message };
        }
    }



    saveAccount(account) {
        fs.writeFile(path.join(this.getKeyStoreLocation(), "0x" + account.address), JSON.stringify(account), "utf8", function () {
            // file was written
        });
    }
    
    deteteAccount(address) {
        return new Promise((resolve, reject) => {
        const accPathPromise = this.getKeyStoreLocation();

        accPathPromise.then(accPath => {
            fs.readdir(accPath, function (err, files) {
                if (err) {
                    reject(err);
                    return;
                }

                let deleteFilePath = null;
                const searchStr = String(address).substring(2, String(address).length).toLowerCase();

                for (let filePath of files) {
                    if (String(filePath).toLowerCase().indexOf(searchStr) > -1) {
                        deleteFilePath = filePath;
                        break;
                    }
                }

                if (deleteFilePath) {
                    fs.unlink(path.join(accPath, deleteFilePath), function (error) {
                        if (error) reject(error);
                        else resolve(true);
                    });
                } else {
                    resolve(true);
                }
            });
        }).catch(err => {
            reject(err);
        });
        });
    }

}

ipcMain.on("exportAccounts", (event, arg) => {
    const ethoAccounts = new Accounts();
    ethoAccounts.exportAccounts();
});


ipcMain.on("importAccounts", async (event, arg) => {
    const ethoAccounts = new Accounts();
    try {
        const importResult = await ethoAccounts.importAccounts();
        event.reply("importAccountsReply", importResult);
    } catch (error) {
        event.reply("importAccountsReply", { success: false, text: error.message });
    }
});


ipcMain.on("saveAccount", (event, arg) => {
    const ethoAccounts = new Accounts();
    ethoAccounts.saveAccount(arg);
    event.returnValue = true;
});

ipcMain.on("deteteAccount", (event, arg) => {
    const ethoAccounts = new Accounts();
    ethoAccounts.deteteAccount(arg)
        .then((res) => {
            event.returnValue = res;
        })
        .catch((err) => {
            event.returnValue = err;
        });
});

