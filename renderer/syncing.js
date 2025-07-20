// In renderer process (web page).
const {
  ipcRenderer
} = require("electron");
var web3;

// RPC endpoints
const rpcProviders = [
  'https://rpc.ethoprotocol.com',
  'https://rpc4.ethoprotocol.com'
];

// Set the provider you want from Web3.providers
SyncProgress = new ProgressBar.Line("#syncProgress", {
  strokeWidth: 6,
  easing: "easeInOut",
  duration: 1400,
  color: "#25D4DC",
  trailColor: "#eee",
  trailWidth: 1,
  text: {
    style: {
      color: "#000",
      position: "absolute",
      left: "50%",
      top: "-1px",
      transform: "translateX(-50%)",
      fontSize: "0.9em",
      LineHeight: "24px",
      padding: 0,
      zIndex: 1000
    },
    autoStyleContainer: false
  },
  from: {
    color: "#FFEA82"
  },
  to: {
    color: "#ED6A5A"
  }
});

// set initial value for the progress text
SyncProgress.setText("Waiting for blockchain, please wait...");
isFullySynced = false;

var peerCountInterval = setInterval(function() {
  if (web3Local && web3Local.eth && web3Local.eth.net) {
    web3Local.eth.net.getPeerCount(function(error, count) {
      if (!error) {
        $("#peerCount").html(vsprintf("Peer Count: %d", [count || 0]));
      }
    });
  }
}, 5000);

function StartSyncProcess() {
  var connectionMode = ipcRenderer.sendSync("getConnectionMode");
  
  if (connectionMode === 'rpc') {
    // RPC mode - skip sync process, mark as ready
    setTimeout(function() {
      web3Local.eth.getBlock("latest", function(error, localBlock) {
        if (!error && localBlock && localBlock.number > 0) {
          SyncProgress.animate(1);
          SyncProgress.setText("Connected to RPC");
          isFullySynced = true;
          
          // Enable the keep in sync feature
          EthoTransactions.enableKeepInSync();
          
          // In RPC mode, ensure we sync recent transactions more aggressively
          const counters = EthoDatatabse.getCounters();
          const lastSyncedBlock = counters.transactions || 0;
          
          // If we haven't synced in a while, sync from at least the last 50,000 blocks
          // or from the last synced position, whichever is more recent
          const blocksToScan = 50000; // Scan last ~7 days of blocks (assuming ~10 second blocks)
          const startFromBlock = Math.max(lastSyncedBlock, localBlock.number - blocksToScan);
          
          console.log(`RPC Mode: Syncing transactions from block ${startFromBlock} to ${localBlock.number} (${localBlock.number - startFromBlock} blocks)`);
          SyncProgress.setText("Syncing recent transactions...");
          
          // Sync all the transactions to the current block
          EthoTransactions.syncTransactionsForAllAddresses(localBlock.number);
          
          // Signal that the sync is complete
          $(document).trigger("onSyncComplete");
          $(document).trigger("onNewAccountTransaction");
        }
      });
    }, 1000);
    return;
  }
  
  // Local node mode - existing sync logic
  var alreadyCatchedUp = false;
  var nodeSyncInterval = null;

  var subscription = web3Local.eth.subscribe("syncing", function(error, sync) {
    if (!error) {
      if (!sync) {
        if (nodeSyncInterval) {
          clearInterval(nodeSyncInterval);
        }

        nodeSyncInterval = setInterval(function() {
          web3Local.eth.getBlock("latest", function(error, localBlock) {
            if (!error) {
              if (localBlock.number > 0) {
                if (!EthoTransactions.getIsSyncing()) {
                  SyncProgress.animate(1);
                  SyncProgress.setText(vsprintf("%d/%d (100%%)", [localBlock.number, localBlock.number]));
                }

                if (alreadyCatchedUp == false) {
                  // clear the repeat interval and render wallets
                  $(document).trigger("onNewAccountTransaction");
                  alreadyCatchedUp = true;
                  isFullySynced = true;

                  // enable the keep in sync feature
                  EthoTransactions.enableKeepInSync();
                  // sync all the transactions to the current block
                  EthoTransactions.syncTransactionsForAllAddresses(localBlock.number);

                  // signal that the sync is complete
                  $(document).trigger("onSyncComplete");
                }
              }
            } else {
              EthoMainGUI.showGeneralError(error);
            }
          });
        }, 10000);
      }
    } else {
      EthoMainGUI.showGeneralError(error);
    }
  }).on("data", function(sync) {
    if (sync && sync.HighestBlock > 0) {
      SyncProgress.animate(sync.CurrentBlock / sync.HighestBlock);
      SyncProgress.setText(vsprintf("%d/%d (%d%%)", [
        sync.CurrentBlock,
        sync.HighestBlock,
        Math.floor(sync.CurrentBlock / sync.HighestBlock * 100)
      ]));
    }
  }).on("changed", function(isSyncing) {
    if (isSyncing) {

      nodeSyncInterval = setInterval(function() {
        web3Local.eth.isSyncing(function(error, sync) {
          if (!error && sync) {
            SyncProgress.animate(sync.currentBlock / sync.highestBlock);
            SyncProgress.setText(vsprintf("%d/%d (%d%%)", [
              sync.currentBlock,
              sync.highestBlock,
              Math.floor(sync.currentBlock / sync.highestBlock * 100)
            ]));
          } else if (error) {
            EthoMainGUI.showGeneralError(error);
          }
        });
      }, 2000);
    } else {
      if (nodeSyncInterval) {
        clearInterval(nodeSyncInterval);
      }
    }
  });
}

var InitWeb3 = setInterval(function() {
  try {
    var connectionMode = ipcRenderer.sendSync("getConnectionMode");
    console.log("Connection mode:", connectionMode);
    
    if (connectionMode === 'rpc') {
      // Try RPC providers in order
      var providerIndex = 0;
      
      function tryRPCProvider() {
        if (providerIndex >= rpcProviders.length) {
          EthoMainGUI.showGeneralError("All RPC providers failed to connect");
          return;
        }
        
        var provider = rpcProviders[providerIndex];
        console.log("Trying RPC provider:", provider);
        web3Local = new Web3(new Web3.providers.HttpProvider(provider));
        
        // For Web3 1.8.0, use callback style for better compatibility
        web3Local.eth.net.isListening((error, isListening) => {
          if (!error && isListening) {
            console.log("RPC connection successful:", provider);
            console.log("Connection mode:", ipcRenderer.sendSync("getConnectionMode"));
            $(document).trigger("onGethReady");
            clearInterval(InitWeb3);
            StartSyncProcess();
          } else {
            console.log("RPC Provider", provider, "failed:", error);
            providerIndex++;
            setTimeout(tryRPCProvider, 1000); // Wait 1 second before trying next provider
          }
        });
      }
      
      tryRPCProvider();
    } else {
      // Local node mode
      console.log("Trying local node connection");
      web3Local = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:8546"));

      web3Local.eth.net.isListening(function(error, success) {
        if (!error && success) {
          console.log("Local node connection successful");
          console.log("Connection mode:", ipcRenderer.sendSync("getConnectionMode"));
          $(document).trigger("onGethReady");
          clearInterval(InitWeb3);
          StartSyncProcess();
        } else {
          console.log("Local node connection failed:", error);
          // If local node fails, suggest switching to RPC mode
          setTimeout(() => {
            if (confirm("Local node connection failed. Would you like to switch to RPC mode for faster startup?")) {
              ipcRenderer.sendSync("setConnectionMode", "rpc");
              location.reload();
            }
          }, 5000);
        }
      });
    }
  } catch (err) {
    console.error("Web3 initialization error:", err);
    EthoMainGUI.showGeneralError(err);
  }
}, 2000);
