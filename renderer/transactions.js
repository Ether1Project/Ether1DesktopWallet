const {ipcRenderer} = require("electron");
const moment = require("moment");

class Transactions {
  constructor() {
    this.filter = "";
    this.isSyncing = false;
    this.isLoading = false;
  }

  setIsSyncing(value) {
    this.isSyncing = value;
  }

  getIsSyncing() {
    return this.isSyncing;
  }

  setIsLoading(value) {
    this.isLoading = value;
  }

  getIsLoading() {
    return this.isLoading;
  }

  setFilter(text) {
    this.filter = text;
  }

  getFilter() {
    return this.filter;
  }

  clearFilter() {
    this.filter = "";
  }

  syncTransactionsForSingleAddress(addressList, counters, lastBlock, counter) {
    if (counter < addressList.length) {
      SyncProgress.setText(vsprintf("Syncing address transactions %d/%d, please wait...", [counter, addressList.length]));

      var startBlock = parseInt(counters.transactions) || 0;
      
      // Check connection mode to determine sync method
      var connectionMode = 'local';
      try {
        connectionMode = ipcRenderer.sendSync("getConnectionMode");
      } catch (e) {
        console.log("Failed to get connection mode, defaulting to local");
      }

      if (connectionMode === 'rpc') {
        // In RPC mode, use the explorer API for faster and more reliable results
        console.log(`Using explorer API for address: ${addressList[counter].toLowerCase()}`);
        
        $.getJSON("https://explorer.ethoprotocol.com/api?module=account&action=txlist&address=" + addressList[counter].toLowerCase(), function (result) {
          console.log(`API response for ${addressList[counter]}:`, result);
          
          if (result.result && result.result.length > 0) {
            console.log(`Found ${result.result.length} transactions for ${addressList[counter]}`);
            
            result.result.forEach(element => {
              // Store all transactions found by API (don't filter by block range)
              if (element.from && element.to) {
                console.log(`Storing transaction: ${element.hash} from block ${element.blockNumber}`);
                ipcRenderer.send("storeTransaction", {
                  block: element.blockNumber.toString(),
                  txhash: element.hash.toLowerCase(),
                  fromaddr: element.from.toLowerCase(),
                  timestamp: moment.unix(parseInt(element.timeStamp)).format("YYYY-MM-DD HH:mm:ss"),
                  toaddr: element.to.toLowerCase(),
                  value: element.value
                });
              }
            });
          } else {
            console.log(`No transactions found for ${addressList[counter]}`);
          }

          // call the transaction sync for the next address
          EthoTransactions.syncTransactionsForSingleAddress(addressList, counters, lastBlock, counter + 1);
        }).fail(function() {
          console.log("Explorer API failed for", addressList[counter], "falling back to RPC method");
          // Fallback to RPC method if explorer API fails
          EthoTransactions.syncTransactionsForAddressViaRPC(addressList[counter], startBlock, lastBlock, function() {
            EthoTransactions.syncTransactionsForSingleAddress(addressList, counters, lastBlock, counter + 1);
          });
        });
      } else {
        // Use explorer API for local mode (original method)
        var params = vsprintf("?address=%s&fromBlock=%d&toBlock=%d", [
          addressList[counter].toLowerCase(),
          startBlock,
          lastBlock
        ]);

        $.getJSON("https://explorer.ethoprotocol.com/api?module=account&action=txlist&address=" + addressList[counter].toLowerCase(), function (result) {
          if (result.result) {
            result.result.forEach(element => {
              if (element.from && element.to && startBlock <= parseInt(element.blockNumber) && lastBlock >= parseInt(element.blockNumber)) {
                ipcRenderer.send("storeTransaction", {
                  block: element.blockNumber.toString(),
                  txhash: element.hash.toLowerCase(),
                  fromaddr: element.from.toLowerCase(),
                  timestamp: moment.unix(parseInt(element.timeStamp)).format("YYYY-MM-DD HH:mm:ss"),
                  toaddr: element.to.toLowerCase(),
                  value: element.value
                });
              }
            });
          }

          // call the transaction sync for the next address
          EthoTransactions.syncTransactionsForSingleAddress(addressList, counters, lastBlock, counter + 1);
        }).fail(function() {
          console.log("Explorer API failed, falling back to RPC method");
          // Fallback to RPC method if explorer API fails
          EthoTransactions.syncTransactionsForAddressViaRPC(addressList[counter], startBlock, lastBlock, function() {
            EthoTransactions.syncTransactionsForSingleAddress(addressList, counters, lastBlock, counter + 1);
          });
        });
      }
    } else {
      // update the counter and store it back to file system
      counters.transactions = lastBlock;
      EthoDatatabse.setCounters(counters);

      SyncProgress.setText("Syncing transactions is complete.");
      EthoTransactions.setIsSyncing(false);
    }
  }

  // RPC-based transaction sync - scans blocks directly via web3
  syncTransactionsForAddressViaRPC(address, startBlock, endBlock, callback) {
    const addressLower = address.toLowerCase();
    
    // For RPC mode, scan more blocks but limit to prevent overwhelming the system
    const maxBlocksToScan = 10000; // Limit to 10k blocks per address for performance
    let currentBlock = Math.max(startBlock, endBlock - maxBlocksToScan);
    let processedBlocks = 0;
    const totalBlocks = endBlock - currentBlock + 1;

    console.log(`RPC Sync: Scanning blocks ${currentBlock} to ${endBlock} for address ${addressLower} (${totalBlocks} blocks)`);

    if (currentBlock > endBlock) {
      callback();
      return;
    }

    const processBlock = () => {
      if (currentBlock > endBlock) {
        console.log(`RPC Sync: Completed scanning for address ${addressLower}`);
        callback();
        return;
      }

      web3Local.eth.getBlock(currentBlock, true, (error, blockData) => {
        if (!error && blockData && blockData.transactions) {
          let foundTransactions = 0;
          blockData.transactions.forEach(tx => {
            if (tx.from && tx.to && 
                (tx.from.toLowerCase() === addressLower || tx.to.toLowerCase() === addressLower)) {
              
              console.log(`Found transaction ${tx.hash} for address ${addressLower} in block ${currentBlock}`);
              foundTransactions++;
              
              // Check if transaction already exists to avoid duplicates
              const existingTransactions = ipcRenderer.sendSync("getTransactions");
              const exists = existingTransactions.some(existingTx => existingTx[3] === tx.hash.toLowerCase());
              
              if (!exists) {
                console.log(`Storing new transaction: ${tx.hash}`);
                ipcRenderer.send("storeTransaction", {
                  block: tx.blockNumber.toString(),
                  txhash: tx.hash.toLowerCase(),
                  fromaddr: tx.from.toLowerCase(),
                  timestamp: moment.unix(blockData.timestamp).format("YYYY-MM-DD HH:mm:ss"),
                  toaddr: tx.to.toLowerCase(),
                  value: tx.value.toString()
                });
              } else {
                console.log(`Transaction ${tx.hash} already exists, skipping`);
              }
            }
          });
          
          if (foundTransactions > 0) {
            console.log(`Found ${foundTransactions} transactions in block ${currentBlock}`);
          }
        } else if (error) {
          console.log(`Error getting block ${currentBlock}:`, error);
        }

        processedBlocks++;
        
        // Update progress
        const progress = Math.floor((processedBlocks / totalBlocks) * 100);
        if (processedBlocks % 100 === 0 || processedBlocks === totalBlocks) {
          console.log(`RPC Sync progress for ${address}: ${progress}% (${processedBlocks}/${totalBlocks})`);
        }

        currentBlock++;
        
        // Process next block with a small delay to prevent overwhelming the RPC
        setTimeout(processBlock, 5); // Reduced delay for faster scanning
      });
    };

    processBlock();
  }

  syncTransactionsForAllAddresses(lastBlock) {
    var counters = EthoDatatabse.getCounters();
    var counter = 0;

    // Check connection mode to determine how to get addresses
    var connectionMode = 'local';
    try {
      connectionMode = ipcRenderer.sendSync("getConnectionMode");
    } catch (e) {
      console.log("Failed to get connection mode, defaulting to local");
    }

    if (connectionMode === 'rpc') {
      // In RPC mode, get addresses from wallet database instead of web3.eth.getAccounts()
      var wallets = EthoDatatabse.getWallets();
      if (wallets && wallets.names) {
        var addressList = Object.keys(wallets.names);
        console.log("RPC Mode: Syncing transactions for addresses:", addressList);
        
        if (addressList.length > 0) {
          EthoTransactions.setIsSyncing(true);
          EthoTransactions.syncTransactionsForSingleAddress(addressList, counters, lastBlock, counter);
        } else {
          console.log("No wallet addresses found in database");
          SyncProgress.setText("No wallet addresses to sync");
        }
      } else {
        console.log("No wallets found in database");
        SyncProgress.setText("No wallets found");
      }
    } else {
      // Local mode - use original method
      EthoBlockchain.getAccounts(function (error) {
        EthoMainGUI.showGeneralError(error);
      }, function (data) {
        console.log("Local Mode: Syncing transactions for addresses:", data);
        EthoTransactions.setIsSyncing(true);
        EthoTransactions.syncTransactionsForSingleAddress(data, counters, lastBlock, counter);
      });
    }
  }

  renderTransactions() {
    if (!EthoTransactions.getIsLoading()) {
      EthoMainGUI.renderTemplate("transactions.html", {});
      $(document).trigger("render_transactions");
      EthoTransactions.setIsLoading(true);

      // show the loading overlay for transactions
      $("#loadingTransactionsOverlay").css("display", "block");

      setTimeout(() => {
        var dataTransactions = ipcRenderer.sendSync("getTransactions");
        var addressList = EthoWallets.getAddressList();

        dataTransactions.forEach(function (element) {
          var isFromValid = addressList.indexOf(element[2].toLowerCase()) > -1;
          var isToValid = addressList.indexOf(element[3].toLowerCase()) > -1;

          if (isToValid && !isFromValid) {
            element.unshift(0);
          } else if (!isToValid && isFromValid) {
            element.unshift(1);
          } else {
            element.unshift(2);
          }
        });

        EthoTableTransactions.initialize("#tableTransactionsForAll", dataTransactions);
        EthoTransactions.setIsLoading(false);
      }, 200);
    }
  }

  // Manual refresh function for RPC mode and general use
  refreshTransactions() {
    var connectionMode = 'local';
    try {
      connectionMode = ipcRenderer.sendSync("getConnectionMode");
    } catch (e) {
      console.log("Failed to get connection mode, defaulting to local");
    }

    if (connectionMode === 'rpc') {
      // In RPC mode, refresh using the explorer API
      iziToast.info({
        title: "Refreshing",
        message: "Fetching latest transactions from explorer...",
        position: "topRight",
        timeout: 3000
      });

      // Get wallet addresses and refresh each one
      var wallets = EthoDatatabse.getWallets();
      if (wallets && wallets.names) {
        var addressList = Object.keys(wallets.names);
        console.log("Refreshing transactions for addresses:", addressList);
        
        // Force re-sync all transactions for all addresses
        EthoTransactions.syncTransactionsForAllAddresses(999999999); // Use high number to get all transactions
        
        // Refresh the transactions view
        setTimeout(() => {
          EthoTransactions.renderTransactions();
          iziToast.success({
            title: "Refreshed",
            message: "Transaction list updated from explorer",
            position: "topRight",
            timeout: 2000
          });
        }, 3000);
      } else {
        iziToast.error({
          title: "Error",
          message: "No wallet addresses found",
          position: "topRight",
          timeout: 2000
        });
      }
    } else {
      // In local mode, just re-render from stored data
      EthoTransactions.renderTransactions();
      iziToast.success({
        title: "Refreshed",
        message: "Transaction list updated",
        position: "topRight",
        timeout: 2000
      });
    }
  }

  enableKeepInSync() {
    var connectionMode = 'local';
    try {
      connectionMode = ipcRenderer.sendSync("getConnectionMode");
    } catch (e) {
      console.log("Failed to get connection mode, defaulting to local");
    }

    if (connectionMode === 'rpc') {
      // In RPC mode, use polling to check for new transactions
      this.startRPCPolling();
    } else {
      // In local mode, use WebSocket subscriptions
      EthoBlockchain.subsribeNewBlockHeaders(function (error) {
        EthoMainGUI.showGeneralError(error);
      }, function (data) {
        EthoBlockchain.getBlock(data.number, true, function (error) {
          EthoMainGUI.showGeneralError(error);
        }, function (data) {
          if (data.transactions) {
            data.transactions.forEach(element => {
              if (element.from && element.to) {
                if (EthoWallets.getAddressExists(element.from) || EthoWallets.getAddressExists(element.to)) {
                  var Transaction = {
                    block: element.blockNumber.toString(),
                    txhash: element.hash.toLowerCase(),
                    fromaddr: element.from.toLowerCase(),
                    timestamp: moment.unix(data.timestamp).format("YYYY-MM-DD HH:mm:ss"),
                    toaddr: element.to.toLowerCase(),
                    value: Number(element.value).toExponential(5).toString().replace("+", "")
                  };

                  // store transaction and notify about new transactions
                  ipcRenderer.send("storeTransaction", Transaction);
                  $(document).trigger("onNewAccountTransaction");

                  iziToast.info({
                    title: "New Transaction",
                    message: vsprintf("Transaction from address %s to address %s was just processed", [Transaction.fromaddr, Transaction.toaddr]),
                    position: "topRight",
                    timeout: 10000
                  });

                  if (EthoMainGUI.getAppState() == "transactions") {
                    setTimeout(function () {
                      EthoTransactions.renderTransactions();
                    }, 500);
                  }
                }
              }
            });
          }
        });
      });
    }
  }

  // RPC polling mechanism to check for new transactions
  startRPCPolling() {
    const self = this;
    this.rpcPollingInterval = setInterval(function() {
      // Get wallet addresses from database
      var wallets = EthoDatatabse.getWallets();
      if (!wallets || !wallets.names) {
        console.log("No wallet addresses found for RPC polling");
        return;
      }
      
      var walletAddresses = Object.keys(wallets.names);
      if (walletAddresses.length === 0) {
        console.log("No wallet addresses to monitor");
        return;
      }

      // Get latest block
      web3Local.eth.getBlock("latest", function(error, latestBlock) {
        if (!error && latestBlock) {
          const currentCounter = EthoDatatabse.getCounters().transactions || 0;
          
          // If we have new blocks, check for transactions
          if (latestBlock.number > currentCounter) {
            console.log(`RPC Polling: Checking blocks ${currentCounter + 1} to ${latestBlock.number} for addresses:`, walletAddresses);
            
            // Check only the last few blocks to avoid overwhelming the system
            const startBlock = Math.max(currentCounter, latestBlock.number - 5);
            
            for (let blockNum = startBlock + 1; blockNum <= latestBlock.number; blockNum++) {
              web3Local.eth.getBlock(blockNum, true, function(blockError, blockData) {
                if (!blockError && blockData && blockData.transactions) {
                  blockData.transactions.forEach(element => {
                    if (element.from && element.to) {
                      // Check if transaction involves any of our wallet addresses
                      const isFromOurs = walletAddresses.some(addr => addr.toLowerCase() === element.from.toLowerCase());
                      const isToOurs = walletAddresses.some(addr => addr.toLowerCase() === element.to.toLowerCase());
                      
                      if (isFromOurs || isToOurs) {
                        console.log(`Found transaction for our address: ${element.hash}`);
                        
                        var Transaction = {
                          block: element.blockNumber.toString(),
                          txhash: element.hash.toLowerCase(),
                          fromaddr: element.from.toLowerCase(),
                          timestamp: moment.unix(blockData.timestamp).format("YYYY-MM-DD HH:mm:ss"),
                          toaddr: element.to.toLowerCase(),
                          value: Number(element.value).toExponential(5).toString().replace("+", "")
                        };

                        // Check if transaction already exists to avoid duplicates
                        const existingTransactions = ipcRenderer.sendSync("getTransactions");
                        const exists = existingTransactions.some(tx => tx[3] === Transaction.txhash);
                        
                        if (!exists) {
                          // store transaction and notify about new transactions
                          console.log("Storing new transaction:", Transaction.txhash);
                          ipcRenderer.send("storeTransaction", Transaction);
                          $(document).trigger("onNewAccountTransaction");

                          iziToast.info({
                            title: "New Transaction",
                            message: vsprintf("Transaction from address %s to address %s was just processed", [Transaction.fromaddr, Transaction.toaddr]),
                            position: "topRight",
                            timeout: 10000
                          });

                          if (EthoMainGUI.getAppState() == "transactions") {
                            setTimeout(function () {
                              EthoTransactions.renderTransactions();
                            }, 500);
                          }
                        }
                      }
                    }
                  });
                }
              });
            }
            
            // Update counter to latest block
            const counters = EthoDatatabse.getCounters();
            counters.transactions = latestBlock.number;
            EthoDatatabse.setCounters(counters);
          }
        }
      });
    }, 30000); // Check every 30 seconds
  }

  stopRPCPolling() {
    if (this.rpcPollingInterval) {
      clearInterval(this.rpcPollingInterval);
      this.rpcPollingInterval = null;
    }
  }

  disableKeepInSync() {
    var connectionMode = 'local';
    try {
      connectionMode = ipcRenderer.sendSync("getConnectionMode");
    } catch (e) {
      console.log("Failed to get connection mode, defaulting to local");
    }

    if (connectionMode === 'rpc') {
      // Stop RPC polling
      this.stopRPCPolling();
    } else {
      // Unsubscribe from local node block headers
      EthoBlockchain.unsubsribeNewBlockHeaders(function (error) {
        EthoMainGUI.showGeneralError(error);
      }, function (data) {
        // success
      });
    }
  }
}

// create new transactions variable
EthoTransactions = new Transactions();
