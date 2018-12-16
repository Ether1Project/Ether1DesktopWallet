// In renderer process (web page).
const {ipcRenderer} = require('electron');

// Set the provider you want from Web3.providers
SyncProgress = new ProgressBar.Line('#syncProgress', 
{
  strokeWidth: 6,
  easing: 'easeInOut',
  duration: 1400,
  color: "#7A1336",
  trailColor: '#eee',
  trailWidth: 1,
  text: {
    style: {
      color: '#bbb',
      position: "absolute",
      left: "50%",
      top: "-1px",
      transform: "translateX(-50%)",
      fontSize: "0.9em",
      LineHeight: "24px",
      padding: 0
    },
    autoStyleContainer: false
  },
  from: {color: '#FFEA82'},
  to: {color: '#ED6A5A'}
});

// set initial value for the progress text
SyncProgress.setText("initializing, please wait...");

var peerCountInterval = setInterval(function()
{   
  web3Local.eth.net.getPeerCount(function(error, count) {
    $("#peerCount").html(vsprintf("Peer Count: %d", [count]));
  });
}, 5000);  

function StartSyncProcess() {
  var alreadyCatchedUp = false;

  function keepTheNodeInSync(interval) {
    var nodeSyncInterval = setInterval(function()
    {   
      web3Local.eth.isSyncing(function(error, sync)
      {
        if(!error) {
          if(sync == true) {
            console.log("start the sync");
          } else if(sync) {
            SyncProgress.animate(sync.currentBlock / sync.highestBlock);
            SyncProgress.setText(vsprintf('%d/%d (%d%%)', [sync.currentBlock, sync.highestBlock, Math.round(sync.currentBlock / sync.highestBlock * 100)]));
          } else {    
            web3Local.eth.getBlock("latest", function(error, localBlock) {
              if (localBlock.number > 0) {
                web3Remote.eth.getBlock("latest", function(error, remoteBlock) {
                  if (!EthoTransactions.getIsSyncing()) {
                    SyncProgress.animate(localBlock.number / remoteBlock.number);    
                    SyncProgress.setText(vsprintf('%d/%d (%d%%)', [localBlock.number, remoteBlock.number, Math.round(localBlock.number / remoteBlock.number * 100)]));
                  }
  
                  if (remoteBlock.number == localBlock.number) {
                    if (alreadyCatchedUp == false) 
                    {
                      // clear the repeat interval and render wallets
                      $(document).trigger("onNewAccountTransaction");
                      clearInterval(nodeSyncInterval);
                      alreadyCatchedUp = true;

                      // sync all the transactions to the current block
                      EthoTransactions.syncTransactionsForAllAddresses(localBlock.number);
                      $(document).trigger("onSyncInterval");
        
                      // restart with less intensity
                      keepTheNodeInSync(10000);
                    }      
                  }
                });
              }
            });            
          }              
        }
      });  
    }, interval);  
  }

  // initial fast syncing
  keepTheNodeInSync(2000);
}

var InitWeb3 = setInterval(function()
{     
  try {
    web3Local = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8546'));
    web3Remote = new Web3(new Web3.providers.HttpProvider("https://rpc.ether1.org"));

    web3Local.eth.net.isListening(function(error, success) {
      if (!error) {
        $(document).trigger("onGethReady");
        clearInterval(InitWeb3);
        StartSyncProcess();  
      }
    });
  }
  catch(err) {
    console.log(err);
  }
}, 2000);  