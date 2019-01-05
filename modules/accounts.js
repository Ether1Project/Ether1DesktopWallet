const {app, dialog, ipcMain} = require('electron');
const admZip = require('adm-zip');
const path = require('path');
const fs = require('fs');
const os = require('os');

class Accounts {
  constructor() {
      this.getKeyStoreLocation = function() {
        switch(os.type()) {
            case "Darwin":
              return path.join(os.homedir(), 'Documents/ethereum-wallet/ethereum-wallet/Classes/Business layer/Core/Services', 'keystore');
              break;
            default:
              return path.join(process.env.APPDATA, 'Ether1', 'keystore');
          }     
      }
  }

  exportAccounts() {
    var savePath = dialog.showSaveDialog({
        defaultPath: path.join(app.getPath('documents'), 'accounts.zip')
    });

    if (savePath) {
        const accPath = this.getKeyStoreLocation();
        
        fs.readdir(accPath, function(err, files) {
            var zip = new admZip();

            for(let filePath of files) {
                zip.addFile(filePath, fs.readFileSync(path.join(accPath, filePath)));
            }

            // store zip to path
            zip.writeZip(savePath);
        }); 
    }
  }

  importAccounts(accountsFile) { 
    var extName = path.extname(accountsFile).toUpperCase();
    const accPath = this.getKeyStoreLocation();

    if (extName = '.ZIP') {
        var zip = new admZip(accountsFile);
        zip.extractAllTo(accPath, true);  
        return { success: true, text: "Accounts ware successfully imported."};
    } else if (extName = '.JSON') {
        fs.copyFile(accountsFile, path.join(accPath, path.basename(accountsFile)), (err) => {
            if (err) {
                return { success: false, text: err};
            } else {
                return { success: true, text: "Account was successfully imported."};
            }
        });                
    } else {
        return { success: false, text: "This is not a valid account file or arhive!"};
    }
  }
}

ipcMain.on('exportAccounts', (event, arg) => {
    EthoAccounts.exportAccounts();
});
  
ipcMain.on('importAccounts', (event, arg) => {
    var openPath = dialog.showOpenDialog({
        defaultPath: app.getPath('documents'),
        "filters":
        [
            {
                "name": "archive",
                "extensions": ["zip"]
            },
            {
                "name": "json",
                "extensions": ["json"]
            }
        ]
    });

    if (openPath) {
        event.returnValue = EthoAccounts.importAccounts(openPath[0]);
    } else {
        event.returnValue = false; 
    }
});

EthoAccounts = new Accounts();