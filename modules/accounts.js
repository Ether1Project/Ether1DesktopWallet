const { app, dialog, ipcMain } = require("electron");
const admZip = require("adm-zip");
const path = require("path");
const fs = require("fs-extra");
const os = require("os");
const {getDataDir} = require("./gethDataDir");

class Accounts {
    constructor() {}
    
     async getKeyStoreLocation() {
        return path.join(getDataDir(), "keystore");
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



    async saveAccount(account) {
        const accPath = await this.getKeyStoreLocation();
        await fs.outputFile(path.join(accPath, "0x" + account.address), JSON.stringify(account), "utf8");
    }

    async findKeystorePaths() {
        const platform = os.type();
        const possiblePaths = [];

        try {
            possiblePaths.push(await this.getKeyStoreLocation());
        } catch (e) {
            // Data dir not resolved yet
        }

        if (platform === "Linux") {
            possiblePaths.push(
                path.join(os.homedir(), ".etho", "keystore"),
                path.join(os.homedir(), ".ether1", "keystore"),
                path.join(os.homedir(), ".ethereum", "keystore"),
                path.join(app.getPath("userData"), "Etho", "keystore"),
                path.join(app.getPath("userData"), "Ether1", "keystore"),
                path.join(app.getPath("userData"), "keystore"),
                path.join(app.getPath("home"), ".ether1", "keystore")
            );
        } else if (platform === "Darwin") {
            possiblePaths.push(
                path.join(os.homedir(), "Library", "Etho", "keystore"),
                path.join(os.homedir(), "Library", "Ether1", "keystore"),
                path.join(os.homedir(), "Library", "Ethereum", "keystore")
            );
        } else {
            if (process.env.LOCALAPPDATA) {
                possiblePaths.push(
                    path.join(process.env.LOCALAPPDATA, "Etho", "keystore"),
                    path.join(process.env.LOCALAPPDATA, "Ether1", "keystore")
                );
            }
            possiblePaths.push(
                path.join(process.env.APPDATA || app.getPath("userData"), "Etho", "keystore"),
                path.join(process.env.APPDATA || app.getPath("userData"), "Ether1", "keystore"),
                path.join(process.env.APPDATA || app.getPath("userData"), "Ethereum", "keystore")
            );
        }

        const uniquePaths = [...new Set(possiblePaths)];
        const results = [];
        for (const testPath of uniquePaths) {
            try {
                const exists = await fs.pathExists(testPath);
                if (exists) {
                    const files = await fs.readdir(testPath);
                    results.push({
                        path: testPath,
                        exists: true,
                        fileCount: files.length,
                        files: files.slice(0, 5)
                    });
                } else {
                    results.push({
                        path: testPath,
                        exists: false,
                        fileCount: 0
                    });
                }
            } catch (error) {
                results.push({
                    path: testPath,
                    exists: false,
                    error: error.message
                });
            }
        }

        return results;
    }

    async getLocalKeystores() {
        try {
            const keystores = [];
            const possiblePaths = [];

            try {
                possiblePaths.push(await this.getKeyStoreLocation());
            } catch (e) {
                // Data dir not resolved yet
            }

            if (os.type() === "Windows_NT") {
                const winPaths = await this.getWindowsKeystorePaths();
                possiblePaths.push(...winPaths);
            } else if (os.type() === "Darwin") {
                possiblePaths.push(
                    path.join(os.homedir(), "Library", "Etho", "keystore"),
                    path.join(os.homedir(), "Library", "Ether1", "keystore")
                );
            } else {
                possiblePaths.push(
                    path.join(os.homedir(), ".etho", "keystore"),
                    path.join(os.homedir(), ".ether1", "keystore")
                );
            }

            const uniquePaths = [...new Set(possiblePaths)];
            for (const keystorePath of uniquePaths) {
                const pathKeystores = await this.processKeystoreDirectory(keystorePath);
                keystores.push(...pathKeystores);
            }

            const uniqueKeystores = [];
            const seenAddresses = new Set();

            for (const keystore of keystores) {
                if (!seenAddresses.has(keystore.address)) {
                    seenAddresses.add(keystore.address);
                    uniqueKeystores.push(keystore);
                }
            }

            return uniqueKeystores;
        } catch (error) {
            console.error("Error getting local keystores:", error);
            return [];
        }
    }

    async getWindowsKeystorePaths() {
        const paths = [];

        try {
            paths.push(await this.getKeyStoreLocation());
        } catch (e) {
            // Data dir not resolved yet
        }

        if (process.env.LOCALAPPDATA) {
            paths.push(path.join(process.env.LOCALAPPDATA, "Etho", "keystore"));
            paths.push(path.join(process.env.LOCALAPPDATA, "Ether1", "keystore"));
        }

        if (process.env.APPDATA) {
            paths.push(path.join(process.env.APPDATA.replace("Roaming", "Local"), "Etho", "keystore"));
            paths.push(path.join(process.env.APPDATA.replace("Roaming", "Local"), "Ether1", "keystore"));
            paths.push(path.join(process.env.APPDATA, "Etho", "keystore"));
            paths.push(path.join(process.env.APPDATA, "Ether1", "keystore"));
        }

        try {
            paths.push(path.join(app.getPath("userData"), "Etho", "keystore"));
            paths.push(path.join(app.getPath("userData"), "Ether1", "keystore"));
        } catch (e) {
            console.warn("Could not get userData path:", e.message);
        }

        paths.push(path.join(os.homedir(), "Etho", "keystore"));
        paths.push(path.join(os.homedir(), "Ether1", "keystore"));

        return [...new Set(paths)];
    }

    async processKeystoreDirectory(accPath) {
        try {
            const exists = await fs.pathExists(accPath);
            if (!exists) {
                return [];
            }

            const keystores = [];

            const processDirectory = async (dirPath, dirName = "root") => {
                try {
                    const files = await fs.readdir(dirPath);

                    for (const file of files) {
                        try {
                            const filePath = path.join(dirPath, file);
                            const stats = await fs.stat(filePath);

                            if (stats.isDirectory()) {
                                await processDirectory(filePath, file);
                                continue;
                            }

                            if (file.startsWith(".") || file.includes("~") || file.includes(".tmp")) {
                                continue;
                            }

                            const keystore = await fs.readFile(filePath, "utf8");
                            const keystoreObj = JSON.parse(keystore);

                            let address = keystoreObj.address;
                            if (address && !address.startsWith("0x")) {
                                address = "0x" + address;
                            }

                            if (address) {
                                keystores.push({
                                    address: address.toLowerCase(),
                                    keystore: keystoreObj,
                                    file: file,
                                    directory: dirName,
                                    fullPath: filePath
                                });
                            }
                        } catch (fileError) {
                            console.warn("Error reading keystore file:", file, fileError.message);
                        }
                    }
                } catch (dirError) {
                    console.warn("Error reading directory:", dirPath, dirError.message);
                }
            };

            await processDirectory(accPath, "keystore");

            return keystores;
        } catch (error) {
            console.error("Error processing keystore directory:", accPath, error);
            return [];
        }
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


ipcMain.on("saveAccount", async (event, arg) => {
    const ethoAccounts = new Accounts();
    try {
        await ethoAccounts.saveAccount(arg);
        event.returnValue = true;
    } catch (error) {
        event.returnValue = {success: false, error: error.message};
    }
});

ipcMain.on("findKeystorePaths", async (event, arg) => {
    const ethoAccounts = new Accounts();
    try {
        const paths = await ethoAccounts.findKeystorePaths();
        event.returnValue = paths;
    } catch (error) {
        console.error("Error finding keystore paths:", error);
        event.returnValue = [];
    }
});

ipcMain.on("getLocalKeystores", async (event, arg) => {
    const ethoAccounts = new Accounts();
    try {
        const keystores = await ethoAccounts.getLocalKeystores();
        event.returnValue = keystores;
    } catch (error) {
        console.error("Error getting local keystores:", error);
        event.returnValue = [];
    }
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

