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
                // Try multiple possible Windows locations
                if (process.env.LOCALAPPDATA) {
                    // Use LOCALAPPDATA if available (more reliable)
                    keystorePath = path.join(process.env.LOCALAPPDATA, "Ether1", "keystore");
                } else if (process.env.APPDATA) {
                    // Fallback to APPDATA/Local
                    keystorePath = path.join(process.env.APPDATA.replace('Roaming', 'Local'), "Ether1", "keystore");
                } else {
                    // Last resort fallback
                    keystorePath = path.join(app.getPath("userData"), "Ether1", "keystore");
                }
                break;
            case "Linux":
                keystorePath = path.join(os.homedir(), ".ether1", "keystore");
                break;
            default:
                keystorePath = path.join(app.getPath("userData"), "Ether1", "keystore");
                break;
        }

        console.log("Platform detected:", platform);
        console.log("Environment variables - LOCALAPPDATA:", process.env.LOCALAPPDATA);
        console.log("Environment variables - APPDATA:", process.env.APPDATA);
        console.log("Constructed keystore path:", keystorePath);

        // Ensure directory exists
        return fs.ensureDir(keystorePath).then(() => {
            console.log("Keystore directory ensured:", keystorePath);
            return keystorePath;
        }).catch(err => {
            console.error("Error ensuring keystore directory:", err);
            // Return the path anyway, let other functions handle the error
            return keystorePath;
        });
    }



     exportAccounts() {
        dialog.showSaveDialog({
        defaultPath: path.join(app.getPath("documents"), "accounts.zip")
        }).then(result => {
        if (!result.canceled) {
            const savePath = result.filePath;
            const accPathPromise = this.getKeyStoreLocation();

            accPathPromise.then(async accPath => {
                try {
                    console.log("Attempting to export from keystore path:", accPath);
                    
                    // Check if directory exists
                    const exists = await fs.pathExists(accPath);
                    if (!exists) {
                        console.error("Keystore directory does not exist:", accPath);
                        return;
                    }
                    
                    const files = await fs.readdir(accPath);
                    console.log("Found files for export:", files);
                    
                    if (files.length === 0) {
                        console.log("No keystore files found to export");
                        return;
                    }

                    var zip = new admZip();

                    for (let fileName of files) {
                        try {
                            const filePath = path.join(accPath, fileName);
                            const stats = await fs.stat(filePath);
                            
                            // Only process files, not directories
                            if (stats.isFile()) {
                                const fileContent = await fs.readFile(filePath);
                                zip.addFile(fileName, fileContent);
                                console.log("Added file to zip:", fileName);
                            }
                        } catch (fileError) {
                            console.warn("Error processing file for export:", fileName, fileError.message);
                        }
                    }

                    // store zip to path
                    zip.writeZip(savePath);
                    console.log("Export completed successfully to:", savePath);
                } catch (error) {
                    console.error("Error during export:", error);
                }
            }).catch(err => {
                console.error("Error getting keystore location:", err);
            });
        }
        }).catch(err => {
        console.error("Error showing save dialog:", err);
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
    
    async findKeystorePaths() {
        const platform = os.type();
        const possiblePaths = [];
        
        // Add all possible keystore locations
        if (platform === "Linux") {
            possiblePaths.push(
                path.join(os.homedir(), ".ether1", "keystore"),
                path.join(os.homedir(), ".ethereum", "keystore"),
                path.join(os.homedir(), ".etho", "keystore"),
                path.join(app.getPath("userData"), "Ether1", "keystore"),
                path.join(app.getPath("userData"), "keystore"),
                path.join(app.getPath("home"), ".ether1", "keystore")
            );
        } else if (platform === "Darwin") {
            possiblePaths.push(
                path.join(os.homedir(), "Library", "Ether1", "keystore"),
                path.join(os.homedir(), "Library", "Ethereum", "keystore"),
                path.join(os.homedir(), "Library", "Etho", "keystore")
            );
        } else {
            possiblePaths.push(
                path.join(process.env.APPDATA || app.getPath("userData"), "Ether1", "keystore"),
                path.join(process.env.APPDATA || app.getPath("userData"), "Ethereum", "keystore")
            );
        }
        
        const results = [];
        for (const testPath of possiblePaths) {
            try {
                const exists = await fs.pathExists(testPath);
                if (exists) {
                    const files = await fs.readdir(testPath);
                    results.push({
                        path: testPath,
                        exists: true,
                        fileCount: files.length,
                        files: files.slice(0, 5) // Just first 5 files for debugging
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
            
            // For Windows, check multiple possible locations
            if (os.type() === "Windows_NT") {
                const possiblePaths = await this.getWindowsKeystorePaths();
                console.log("Checking multiple Windows keystore paths:", possiblePaths);
                
                for (const keystorePath of possiblePaths) {
                    console.log("Checking path:", keystorePath);
                    const pathKeystores = await this.processKeystoreDirectory(keystorePath);
                    keystores.push(...pathKeystores);
                }
            } else {
                // For non-Windows platforms, use the standard path
                const accPath = await this.getKeyStoreLocation();
                const pathKeystores = await this.processKeystoreDirectory(accPath);
                keystores.push(...pathKeystores);
            }
            
            // Remove duplicates based on address
            const uniqueKeystores = [];
            const seenAddresses = new Set();
            
            for (const keystore of keystores) {
                if (!seenAddresses.has(keystore.address)) {
                    seenAddresses.add(keystore.address);
                    uniqueKeystores.push(keystore);
                }
            }
            
            console.log("Total unique keystores loaded:", uniqueKeystores.length);
            return uniqueKeystores;
        } catch (error) {
            console.error("Error getting local keystores:", error);
            return [];
        }
    }

    async getWindowsKeystorePaths() {
        const paths = [];
        
        // Primary path - LOCALAPPDATA
        if (process.env.LOCALAPPDATA) {
            paths.push(path.join(process.env.LOCALAPPDATA, "Ether1", "keystore"));
        }
        
        // Secondary path - APPDATA/Local
        if (process.env.APPDATA) {
            paths.push(path.join(process.env.APPDATA.replace('Roaming', 'Local'), "Ether1", "keystore"));
        }
        
        // Legacy path check - APPDATA/Roaming (in case some keystores are there)
        if (process.env.APPDATA) {
            paths.push(path.join(process.env.APPDATA, "Ether1", "keystore"));
        }
        
        // Electron userData path fallback
        try {
            paths.push(path.join(app.getPath("userData"), "Ether1", "keystore"));
        } catch (e) {
            console.warn("Could not get userData path:", e.message);
        }
        
        // Home directory fallback
        paths.push(path.join(os.homedir(), "Ether1", "keystore"));
        
        // Remove duplicates
        return [...new Set(paths)];
    }

    async processKeystoreDirectory(accPath) {
        try {
            console.log("Processing keystore path:", accPath);
            
            // Check if directory exists
            const exists = await fs.pathExists(accPath);
            if (!exists) {
                console.log("Keystore directory does not exist:", accPath);
                return [];
            }
            
            const keystores = [];
            
            // Function to process files in a directory
            const processDirectory = async (dirPath, dirName = "root") => {
                try {
                    const files = await fs.readdir(dirPath);
                    console.log(`Found files in ${dirName} directory (${dirPath}):`, files);
                    
                    for (const file of files) {
                        try {
                            const filePath = path.join(dirPath, file);
                            const stats = await fs.stat(filePath);
                            
                            if (stats.isDirectory()) {
                                // Recursively process subdirectories
                                console.log(`Processing subdirectory: ${file}`);
                                await processDirectory(filePath, file);
                                continue;
                            }
                            
                            // Skip files that don't look like keystore files
                            if (file.startsWith('.') || file.includes('~') || file.includes('.tmp')) {
                                console.log("Skipping temporary/hidden file:", file);
                                continue;
                            }
                            
                            const keystore = await fs.readFile(filePath, 'utf8');
                            const keystoreObj = JSON.parse(keystore);
                            
                            // Extract address from keystore
                            let address = keystoreObj.address;
                            if (address && !address.startsWith('0x')) {
                                address = '0x' + address;
                            }
                            
                            if (address) {
                                keystores.push({
                                    address: address.toLowerCase(),
                                    keystore: keystoreObj,
                                    file: file,
                                    directory: dirName,
                                    fullPath: filePath
                                });
                                console.log(`Successfully loaded keystore for address: ${address} (from ${dirName}/${file})`);
                            }
                        } catch (fileError) {
                            console.warn("Error reading keystore file:", file, fileError.message);
                        }
                    }
                } catch (dirError) {
                    console.warn("Error reading directory:", dirPath, dirError.message);
                }
            };
            
            // Process main keystore directory and subdirectories
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

    // Debug function to help diagnose Windows keystore issues
    async debugWindowsKeystorePaths() {
        console.log("=== WINDOWS KEYSTORE DEBUG ===");
        console.log("Platform:", os.type());
        console.log("Home directory:", os.homedir());
        console.log("LOCALAPPDATA:", process.env.LOCALAPPDATA);
        console.log("APPDATA:", process.env.APPDATA);
        
        try {
            console.log("Electron userData path:", app.getPath("userData"));
        } catch (e) {
            console.log("Could not get userData path:", e.message);
        }
        
        const possiblePaths = await this.getWindowsKeystorePaths();
        console.log("All possible keystore paths:");
        
        for (const keystorePath of possiblePaths) {
            console.log(`\nChecking: ${keystorePath}`);
            try {
                const exists = await fs.pathExists(keystorePath);
                console.log(`  Exists: ${exists}`);
                
                if (exists) {
                    const files = await fs.readdir(keystorePath);
                    console.log(`  Files found: ${files.length}`);
                    console.log(`  Files: ${files.join(', ')}`);
                    
                    // Check for subdirectories
                    for (const file of files) {
                        const filePath = path.join(keystorePath, file);
                        const stats = await fs.stat(filePath);
                        if (stats.isDirectory()) {
                            console.log(`  Subdirectory: ${file}`);
                            try {
                                const subFiles = await fs.readdir(filePath);
                                console.log(`    Files in ${file}: ${subFiles.join(', ')}`);
                            } catch (e) {
                                console.log(`    Error reading ${file}:`, e.message);
                            }
                        }
                    }
                }
            } catch (error) {
                console.log(`  Error: ${error.message}`);
            }
        }
        console.log("=== END DEBUG ===");
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

ipcMain.on("debugWindowsKeystores", async (event, arg) => {
    const ethoAccounts = new Accounts();
    try {
        await ethoAccounts.debugWindowsKeystorePaths();
        event.returnValue = "Debug complete - check console";
    } catch (error) {
        console.error("Error in Windows keystore debug:", error);
        event.returnValue = "Debug failed: " + error.message;
    }
});

module.exports = Accounts;

