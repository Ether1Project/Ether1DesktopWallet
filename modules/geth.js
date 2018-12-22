const child_process = require('child_process');
const {app, dialog} = require('electron');
const path = require('path');
const fs = require('fs');

class Geth {
  constructor() {
    this.gethProcess = null;
    this.logStream = fs.createWriteStream(path.join(app.getPath('userData'), 'gethlog.txt'));
  }
  
  _writeLog(text) {
    this.logStream.write(text);
  }

  startGeth() {
    // get the path of get and execute the child process
    try {
      const gethPath = path.join(app.getPath('userData'), 'geth');
      this.gethProcess = child_process.spawn(gethPath, ['--ws', '--wsorigins', '*', '--wsaddr', '127.0.0.1', '--wsport', '8546', '--wsapi', 'admin,db,eth,net,miner,personal,web3']);
      this.gethProcess.on('error', function(err) {
        dialog.showErrorBox("Error starting application", "Geth failed to start!");
        app.quit();
      });
      this.gethProcess.stderr.on('data', function(data) {
        EthoGeth._writeLog(data.toString() + '\n');
      });
      this.gethProcess.stdout.on('data', function(data) {
        EthoGeth._writeLog(data.toString() + '\n');
      });      
    } catch (e) {
      dialog.showErrorBox("Error starting application", e);
      app.quit();
    }
  }

  stopGeth() { 
    const gethWrapePath = path.join(app.getPath('userData'), 'WrapGeth.exe');
    child_process.spawnSync(gethWrapePath,  [this.gethProcess.pid]);
  }
}

EthoGeth = new Geth();