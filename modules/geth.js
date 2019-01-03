const child_process = require('child_process');
const {app, dialog} = require('electron');
const appRoot = require('app-root-path');
const path = require('path');
const fs = require('fs');
const os = require('os');


class Geth {
  constructor() {
    this.gethProcess = null;
    // create the user data dir (needed for MacOS)
    if (!fs.existsSync(app.getPath('userData'))) {
      fs.mkdirSync(app.getPath('userData')); 
    }   
    this.logStream = fs.createWriteStream(path.join(app.getPath('userData'), 'gethlog.txt'));

    if (appRoot.path.indexOf('app.asar') > -1) {
      this.rootPath = path.dirname(appRoot.path);
    } else {
      this.rootPath = appRoot.path;
    }

    switch(os.type()) {
      case "Linux":
        this.binaries = path.join(this.rootPath, 'bin', 'linux');
        break;
      case "Darwin":
        this.binaries = path.join(this.rootPath, 'bin', 'macos');
        break;
      case "Windows_NT":
        this.binaries = path.join(this.rootPath, 'bin', 'win');
        break;
      default:
        this.binaries = path.join(this.rootPath, 'bin', 'win');        
    } 

    
  }
  
  _writeLog(text) {
    this.logStream.write(text);
  }

  startGeth() {
    // get the path of get and execute the child process
    try {
      const gethPath = path.join(this.binaries, 'geth');
      this.gethProcess = child_process.spawn(gethPath, ['--ws', '--wsorigins', '*', '--wsaddr', '127.0.0.1', '--wsport', '8546', '--wsapi', 'admin,db,eth,net,miner,personal,web3']);

      if (!this.gethProcess) {
        dialog.showErrorBox("Error starting application", "Geth failed to start!");
        app.quit();
      } else {
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
      }
    } catch (err) {
      dialog.showErrorBox("Error starting application", err.message);
      app.quit();
    }
  }

  stopGeth() { 
    if (os.type() == "Windows_NT") {
      const gethWrapePath = path.join(this.binaries, 'WrapGeth.exe');
      child_process.spawnSync(gethWrapePath, [this.gethProcess.pid]);  
    } else {
      this.gethProcess.kill('SIGTERM');
    }
  }
}

EthoGeth = new Geth();