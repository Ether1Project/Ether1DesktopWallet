const {app, dialog, ipcMain} = require('electron');
const admZip = require('adm-zip');
const path = require('path');
const fs = require('fs');

class Accounts {
  constructor() {
  }
  
  exportAccounts() {
    var savePath = dialog.showSaveDialog({
        defaultPath: path.join(app.getPath('documents'), 'accounts.zip')
    });

    if (savePath) {
        const accPath = path.join(path.join(process.env.APPDATA, 'Ether1'), 'keystore');
        
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
    const accPath = path.join(path.join(process.env.APPDATA, 'Ether1'), 'keystore');

    var openPath = dialog.showOpenDialog({
        defaultPath: app.getPath('documents')
    });

    if (openPath) {
        var zip = new admZip(openPath[0]);
        zip.extractAllTo(accPath, true); 
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