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
              return path.join(process.env.HOMEPATH, 'Documents/ethereum-wallet/ethereum-wallet/Classes/Business layer/Core/Services', 'keystore');
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

  importAccounts() { 
    const accPath = this.getKeyStoreLocation();

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
        var extName = path.extname(openPath[0]).toUpperCase();

        if (extName = '.ZIP') {
            var zip = new admZip(openPath[0]);
            zip.extractAllTo(accPath, true);  

            iziToast.success({
                title: 'Imported',
                message: 'Accounts ware successfully imported.',
                position: 'topRight',
                timeout: 2000
            });                   
        } else if (extName = '.JSON') {
            fs.copyFile(openPath[0], path.join(accPath, path.basename(openPath[0])), (err) => {
                if (err) {
                    EthoMainGUI.showGeneralError(err);
                } else {
                    iziToast.success({
                        title: 'Imported',
                        message: 'Account was successfully imported.',
                        position: 'topRight',
                        timeout: 2000
                    });                   
                }
            });                
        } else {
            EthoMainGUI.showGeneralError("This is not a valid account file or arhive!");
        }
    }
  }
}

ipcMain.on('exportAccounts', (event, arg) => {
    EthoAccounts.exportAccounts();
});
  
ipcMain.on('importAccounts', (event, arg) => {
    EthoAccounts.importAccounts();
    event.returnValue = true;
});

EthoAccounts = new Accounts();