// In renderer process (web page).
const {
  ipcRenderer
} = require("electron");

class Blockchain {
  constructor() {
    this.txSubscribe = null;
    this.bhSubscribe = null;
  }

  migrateAccountsFromLocalNode(localAccounts, wallets, callback) {
    console.log("Attempting to import keystores from local node for full RPC compatibility...");
    
    // First, debug keystore paths - but do it asynchronously
    setTimeout(function() {
      try {
        var keystorePaths = ipcRenderer.sendSync("findKeystorePaths");
        console.log("=== KEYSTORE PATH DEBUG ===");
        for (var i = 0; i < keystorePaths.length; i++) {
          var pathInfo = keystorePaths[i];
          if (pathInfo.exists) {
            console.log("✓ Found:", pathInfo.path, "- Files:", pathInfo.fileCount);
            if (pathInfo.files && pathInfo.files.length > 0) {
              console.log("  Sample files:", pathInfo.files);
            }
          } else {
            console.log("✗ Missing:", pathInfo.path);
          }
        }
        console.log("=== END DEBUG ===");
      } catch (debugError) {
        console.error("Debug error:", debugError);
      }
    }, 50);
    
    // Get keystores from local node
    try {
      var localKeystores = ipcRenderer.sendSync("getLocalKeystores");
      console.log("Found", localKeystores.length, "keystore files");
      
      if (!wallets) wallets = { names: {}, keys: {} };
      if (!wallets.names) wallets.names = {};
      if (!wallets.keys) wallets.keys = {};
      
      var migratedCount = 0;
      var viewOnlyCount = 0;
      
      // Process each account
      for (var i = 0; i < localAccounts.length; i++) {
        var accountAddress = localAccounts[i].toLowerCase();
        var accountName = "Account " + (i + 1);
        
        // Try to find corresponding keystore
        var foundKeystore = false;
        for (var j = 0; j < localKeystores.length; j++) {
          if (localKeystores[j].address === accountAddress) {
            // Found matching keystore - import with full functionality
            wallets.names[localAccounts[i]] = accountName;
            wallets.keys[localAccounts[i]] = localKeystores[j].keystore;
            foundKeystore = true;
            migratedCount++;
            console.log("Migrated account with keystore:", localAccounts[i]);
            break;
          }
        }
        
        if (!foundKeystore) {
          // No keystore found - add as view-only
          wallets.names[localAccounts[i]] = accountName + " (View Only)";
          viewOnlyCount++;
          console.log("Added view-only account:", localAccounts[i]);
        }
      }
      
      // Save to database
      EthoDatatabse.setWallets(wallets);
      
      if (migratedCount > 0) {
        console.log("Successfully migrated", migratedCount, "accounts with full functionality");
      }
      if (viewOnlyCount > 0) {
        console.log("Added", viewOnlyCount, "view-only accounts (no keystore found)");
        console.warn("View-only accounts cannot send transactions in RPC mode");
      }
      
      // Call callback asynchronously to not block UI
      setTimeout(callback, 50);
      
    } catch (keystoreError) {
      console.error("Error accessing keystores:", keystoreError);
      console.log("Falling back to view-only migration");
      
      // Fallback to view-only migration
      if (!wallets) wallets = { names: {}, keys: {} };
      if (!wallets.names) wallets.names = {};
      if (!wallets.keys) wallets.keys = {};
      
      for (var i = 0; i < localAccounts.length; i++) {
        var accountName = "Account " + (i + 1) + " (View Only)";
        wallets.names[localAccounts[i]] = accountName;
      }
      
      EthoDatatabse.setWallets(wallets);
      console.log("Accounts synced as view-only due to keystore access error");
      
      // Call callback asynchronously
      setTimeout(callback, 50);
    }
  }

  getBlock(blockToGet, includeData, clbError, clbSuccess) {
    web3Local.eth.getBlock(blockToGet, includeData, function(error, block) {
      if (error) {
        clbError(error);
      } else {
        clbSuccess(block);
      }
    });
  }

  getAccounts(clbError, clbSuccess) {
    web3Local.eth.getAccounts(function(err, res) {
      if (err) {
        clbError(err);
      } else {
        clbSuccess(res);
      }
    });
  }

  isAddress(address) {
    return web3Local.utils.isAddress(address);
  }

  getTransaction(thxid, clbError, clbSuccess) {
    web3Local.eth.getTransaction(thxid, function(error, result) {
      if (error) {
        clbError(error);
      } else {
        clbSuccess(result);
      }
    });
  }

  getTranasctionFee(fromAddress, toAddress, value, clbError, clbSuccess) {
    // For now, use original logic for both modes
    web3Local.eth.getTransactionCount(fromAddress, function(error, result) {
      if (error) {
        clbError(error);
      } else {
        var amountToSend = web3Local.utils.toWei(value, "ether"); //convert to wei value
        var RawTransaction = {
          from: fromAddress,
          to: toAddress,
          value: amountToSend,
          nonce: result
        };

        web3Local.eth.estimateGas(RawTransaction, function(error, result) {
          if (error) {
            clbError(error);
          } else {
            var usedGas = result + 1;
            web3Local.eth.getGasPrice(function(error, result) {
              if (error) {
                clbError(error);
              } else {
                clbSuccess(result * usedGas);
              }
            });
          }
        });
      }
    });
  }

  prepareTransaction(password, fromAddress, toAddress, value, clbError, clbSuccess) {
    // Check connection mode
    var connectionMode = 'local';
    try {
      connectionMode = ipcRenderer.sendSync("getConnectionMode");
    } catch (e) {
      console.log("Failed to get connection mode, defaulting to local");
    }

    if (connectionMode === 'rpc') {
      // In RPC mode, use keystore-based signing
      var wallets = EthoDatatabse.getWallets();
      if (!wallets || !wallets.keys || !wallets.keys[fromAddress]) {
        var isViewOnly = wallets && wallets.names && wallets.names[fromAddress] && wallets.names[fromAddress].includes("(View Only)");
        if (isViewOnly) {
          clbError("This is a view-only account migrated from local node. To send transactions in RPC mode, please:\n\n1. Export the private key from your local node\n2. Use 'Import Wallet' to import it with the private key\n3. Then you can send transactions\n\nAlternatively, switch back to local node mode to use this account.");
        } else {
          clbError("No keystore found for address " + fromAddress + ". Please import this wallet first using 'Import Wallet' with the private key.");
        }
        return;
      }

      // Decrypt the keystore
      try {
        var keystore = wallets.keys[fromAddress];
        var privateKey = web3Local.eth.accounts.decrypt(keystore, password);
        console.log("Successfully decrypted keystore for address:", fromAddress);

        // Get transaction parameters
        web3Local.eth.getTransactionCount(fromAddress, "pending", function(error, nonce) {
          if (error) {
            clbError(error);
            return;
          }

          var amountToSend = web3Local.utils.toWei(value, "ether");
          var transactionObject = {
            from: fromAddress,
            to: toAddress,
            value: amountToSend,
            nonce: nonce
          };

          // Estimate gas
          web3Local.eth.estimateGas(transactionObject, function(error, gasEstimate) {
            if (error) {
              clbError(error);
              return;
            }

            // Get gas price
            web3Local.eth.getGasPrice(function(error, gasPrice) {
              if (error) {
                clbError(error);
                return;
              }

              // Prepare final transaction object
              transactionObject.gas = gasEstimate;
              transactionObject.gasPrice = gasPrice;

              // Sign transaction with private key
              web3Local.eth.accounts.signTransaction(transactionObject, privateKey.privateKey, function(error, signedTx) {
                if (error) {
                  clbError(error);
                } else {
                  console.log("Transaction signed successfully");
                  clbSuccess({ raw: signedTx.rawTransaction });
                }
              });
            });
          });
        });
      } catch (error) {
        clbError("Failed to decrypt wallet. Please check your password.");
      }
    } else {
      // Local node mode - use Personal API
      web3Local.eth.personal.unlockAccount(fromAddress, password, function(error, result) {
        if (error) {
          clbError("Wrong password for the selected address!");
        } else {
          web3Local.eth.getTransactionCount(fromAddress, "pending", function(error, result) {
            if (error) {
              clbError(error);
            } else {
              var amountToSend = web3Local.utils.toWei(value, "ether");
              var RawTransaction = {
                from: fromAddress,
                to: toAddress,
                value: amountToSend,
                nonce: result
              };

              web3Local.eth.estimateGas(RawTransaction, function(error, result) {
                if (error) {
                  clbError(error);
                } else {
                  RawTransaction.gas = result + 1;
                  web3Local.eth.getGasPrice(function(error, result) {
                    if (error) {
                      clbError(error);
                    } else {
                      RawTransaction.gasPrice = result;
                      web3Local.eth.signTransaction(RawTransaction, fromAddress, function(error, result) {
                        if (error) {
                          clbError(error);
                        } else {
                          clbSuccess(result);
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  }

  sendTransaction(rawTransaction, clbError, clbSuccess) {
    web3Local.eth.sendSignedTransaction(rawTransaction, function(error, result) {
      if (error) {
        clbError(error);
      } else {
        clbSuccess(result);
      }
    });
  }

  getAccountsData(clbError, clbSuccess) {
    var rendererData = {};
    rendererData.sumBalance = 0;
    rendererData.addressData = [];

    var wallets = EthoDatatabse.getWallets();
    var counter = 0;
    var connectionMode = 'local'; // default
    
    try {
      connectionMode = ipcRenderer.sendSync("getConnectionMode");
    } catch (e) {
      console.log("Failed to get connection mode, defaulting to local");
    }

    if (connectionMode === 'rpc') {
      // In RPC mode, first try to sync accounts from local node to database if database is empty
      if (!wallets || !wallets.names || Object.keys(wallets.names).length === 0) {
        console.log("No accounts found in database for RPC mode, attempting to sync from local keystores...");
        
        // Try to get accounts directly from keystore files instead of WebSocket
        var self = this;
        
        // Use setTimeout to make this asynchronous and not block UI
        setTimeout(function() {
          try {
            var localKeystores = ipcRenderer.sendSync("getLocalKeystores");
            console.log("Found", localKeystores.length, "keystore files for migration");
            
            if (localKeystores && localKeystores.length > 0) {
              // Extract addresses from keystores for migration
              var localAccounts = localKeystores.map(function(keystore) {
                return keystore.address;
              });
              
              console.log("Migrating", localAccounts.length, "accounts from keystores to database...");
              self.migrateAccountsFromLocalNode(localAccounts, wallets, continueWithRPCMode);
            } else {
              console.log("No local keystores found for migration");
              continueWithRPCMode();
            }
          } catch (keystoreError) {
            console.error("Error accessing local keystores:", keystoreError);
            console.log("Continuing with RPC mode without migration");
            continueWithRPCMode();
          }
        }, 100); // Small delay to let UI load first
        
        // Return immediately to not block UI loading, migration will happen in background
        clbSuccess(rendererData);
        return;
      } else {
        continueWithRPCMode();
      }
      
      function continueWithRPCMode() {
        // Get accounts from local database
        wallets = EthoDatatabse.getWallets(); // Refresh wallets data
        if (wallets && wallets.names) {
          var addresses = Object.keys(wallets.names);
          for (var i = 0; i < addresses.length; i++) {
            var addressInfo = {};
            addressInfo.balance = 0;
            addressInfo.address = addresses[i];
            addressInfo.name = wallets.names[addresses[i]] || ("Account " + (i + 1));
            rendererData.addressData.push(addressInfo);
          }
        }

        if (rendererData.addressData.length > 0) {
          updateBalance(counter);
        } else {
          clbSuccess(rendererData);
        }
      }
    } else {
      // Local node mode - use original web3.eth.getAccounts
      web3Local.eth.getAccounts(function(err, res) {
        if (err) {
          clbError(err);
        } else {
          for (var i = 0; i < res.length; i++) {
            var walletName = vsprintf("Account %d", [i + 1]);
            if (wallets) {
              walletName = wallets.names[res[i]] || walletName;
            }

            var addressInfo = {};
            addressInfo.balance = 0;
            addressInfo.address = res[i];
            addressInfo.name = walletName;
            rendererData.addressData.push(addressInfo);
          }

          if (rendererData.addressData.length > 0) {
            updateBalance(counter);
          } else {
            clbSuccess(rendererData);
          }
        }
      });
    }

    function updateBalance(index) {
      web3Local.eth.getBalance(rendererData.addressData[index].address, function(error, balance) {
        if (!error) {
          rendererData.addressData[index].balance = parseFloat(web3Local.utils.fromWei(balance, "ether")).toFixed(2);
          rendererData.sumBalance = rendererData.sumBalance + parseFloat(web3Local.utils.fromWei(balance, "ether"));
        } else {
          console.log("Error getting balance for", rendererData.addressData[index].address, error);
          rendererData.addressData[index].balance = "0.00";
        }

        if (counter < rendererData.addressData.length - 1) {
          counter++;
          updateBalance(counter);
        } else {
          rendererData.sumBalance = parseFloat(rendererData.sumBalance).toFixed(2);
          clbSuccess(rendererData);
        }
      });
    }
  }

  getAddressListData(clbError, clbSuccess) {
    var rendererData = {};
    rendererData.addressData = [];

    var wallets = EthoDatatabse.getWallets();
    var counter = 0;

    // Check connection mode
    var connectionMode = 'local';
    try {
      connectionMode = ipcRenderer.sendSync("getConnectionMode");
    } catch (e) {
      console.log("Failed to get connection mode, defaulting to local");
    }

    if (connectionMode === 'rpc') {
      // In RPC mode, first try to sync accounts from local node to database if database is empty
      if (!wallets || !wallets.names || Object.keys(wallets.names).length === 0) {
        console.log("No accounts found in database for RPC mode, attempting to sync from local keystores...");
        
        // Try to get accounts directly from keystore files instead of WebSocket  
        var self = this;
        
        // Use setTimeout to make this asynchronous and not block UI
        setTimeout(function() {
          try {
            var localKeystores = ipcRenderer.sendSync("getLocalKeystores");
            console.log("Found", localKeystores.length, "keystore files for migration");
            
            if (localKeystores && localKeystores.length > 0) {
              // Extract addresses from keystores for migration
              var localAccounts = localKeystores.map(function(keystore) {
                return keystore.address;
              });
              
              console.log("Migrating", localAccounts.length, "accounts from keystores to database...");
              self.migrateAccountsFromLocalNode(localAccounts, wallets, continueWithRPCMode);
            } else {
              console.log("No local keystores found for migration");
              continueWithRPCMode();
            }
          } catch (keystoreError) {
            console.error("Error accessing local keystores:", keystoreError);
            console.log("Continuing with RPC mode without migration");
            continueWithRPCMode();
          }
        }, 100); // Small delay to let UI load first
        
        // Return immediately to not block UI loading, migration will happen in background
        clbSuccess(rendererData);
        return;
      } else {
        continueWithRPCMode();
      }
      
      function continueWithRPCMode() {
        // Get accounts from local database
        wallets = EthoDatatabse.getWallets(); // Refresh wallets data
        if (wallets && wallets.names) {
          var addresses = Object.keys(wallets.names);
          for (var i = 0; i < addresses.length; i++) {
            var addressInfo = {};
            addressInfo.address = addresses[i];
            addressInfo.name = wallets.names[addresses[i]] || ("Account " + (i + 1));
            rendererData.addressData.push(addressInfo);
          }
        }
        clbSuccess(rendererData);
      }
    } else {
      // Local node mode - use original web3.eth.getAccounts
      web3Local.eth.getAccounts(function(err, res) {
        if (err) {
          clbError(err);
        } else {
          for (var i = 0; i < res.length; i++) {
            var walletName = vsprintf("Account %d", [i + 1]);
            if (wallets) {
              walletName = wallets.names[res[i]] || walletName;
            }

            var addressInfo = {};
            addressInfo.address = res[i];
            addressInfo.name = walletName;
            rendererData.addressData.push(addressInfo);
          }

          clbSuccess(rendererData);
        }
      });
    }
  }

  createNewAccount(password, clbError, clbSuccess) {
    // Check connection mode
    var connectionMode = 'local';
    try {
      connectionMode = ipcRenderer.sendSync("getConnectionMode");
    } catch (e) {
      console.log("Failed to get connection mode, defaulting to local");
    }

    if (connectionMode === 'rpc') {
      // In RPC mode, create account using web3.eth.accounts and store keystore
      try {
        var account = web3Local.eth.accounts.create();
        var keystore = web3Local.eth.accounts.encrypt(account.privateKey, password);
        
        // Store in database
        var wallets = EthoDatatabse.getWallets();
        if (!wallets) wallets = { names: {}, keys: {} };
        if (!wallets.names) wallets.names = {};
        if (!wallets.keys) wallets.keys = {};
        
        var accountIndex = Object.keys(wallets.names).length + 1;
        var accountName = "Account " + accountIndex;
        
        wallets.names[account.address] = accountName;
        wallets.keys[account.address] = keystore;
        
        EthoDatatabse.setWallets(wallets);
        console.log("New account created and stored in database for RPC mode:", account.address);
        
        clbSuccess(account.address);
      } catch (error) {
        clbError("Failed to create new account: " + error.message);
      }
    } else {
      // Local node mode - use Personal API
      web3Local.eth.personal.newAccount(password, function(error, account) {
        if (error) {
          clbError(error);
        } else {
          clbSuccess(account);
        }
      });
    }
  }

  importFromPrivateKey(privateKey, keyPassword, clbError, clbSuccess) {
    // Check connection mode
    var connectionMode = 'local';
    try {
      connectionMode = ipcRenderer.sendSync("getConnectionMode");
    } catch (e) {
      console.log("Failed to get connection mode, defaulting to local");
    }

    if (connectionMode === 'rpc') {
      // In RPC mode, import account using web3.eth.accounts and store keystore
      try {
        // Ensure private key has 0x prefix
        if (!privateKey.startsWith('0x')) {
          privateKey = '0x' + privateKey;
        }
        
        var account = web3Local.eth.accounts.privateKeyToAccount(privateKey);
        var keystore = web3Local.eth.accounts.encrypt(privateKey, keyPassword);
        
        // Store in database
        var wallets = EthoDatatabse.getWallets();
        if (!wallets) wallets = { names: {}, keys: {} };
        if (!wallets.names) wallets.names = {};
        if (!wallets.keys) wallets.keys = {};
        
        var accountIndex = Object.keys(wallets.names).length + 1;
        var accountName = "Imported Account " + accountIndex;
        
        wallets.names[account.address] = accountName;
        wallets.keys[account.address] = keystore;
        
        EthoDatatabse.setWallets(wallets);
        console.log("Account imported and stored in database for RPC mode:", account.address);
        
        clbSuccess(account.address);
      } catch (error) {
        clbError("Failed to import account: " + error.message);
      }
    } else {
      // Local node mode - use Personal API
      web3Local.eth.personal.importRawKey(privateKey, keyPassword, function(error, account) {
        if (error) {
          clbError(error);
        } else {
          clbSuccess(account);
        }
      });
    }
  }

  subsribePendingTransactions(clbError, clbSuccess, clbData) {
    var connectionMode = ipcRenderer.sendSync("getConnectionMode");
    if (connectionMode === 'rpc') {
      // RPC mode doesn't support subscriptions, call success immediately
      clbSuccess(null);
      return;
    }
    
    this.txSubscribe = web3Local.eth.subscribe("pendingTransactions", function(error, result) {
      if (error) {
        clbError(error);
      } else {
        clbSuccess(result);
      }
    }).on("data", function(transaction) {
      if (clbData) {
        clbData(transaction);
      }
    });
  }

  unsubsribePendingTransactions(clbError, clbSuccess) {
    if (this.txSubscribe) {
      this.txSubscribe.unsubscribe(function(error, success) {
        if (error) {
          clbError(error);
        } else {
          clbSuccess(success);
        }
      });
    }
  }

  subsribeNewBlockHeaders(clbError, clbSuccess, clbData) {
    var connectionMode = ipcRenderer.sendSync("getConnectionMode");
    if (connectionMode === 'rpc') {
      // RPC mode doesn't support subscriptions, call success immediately
      clbSuccess(null);
      return;
    }
    
    this.bhSubscribe = web3Local.eth.subscribe("newBlockHeaders", function(error, result) {
      if (error) {
        clbError(error);
      } else {
        clbSuccess(result);
      }
    }).on("data", function(blockHeader) {
      if (clbData) {
        clbData(blockHeader);
      }
    });
  }

  unsubsribeNewBlockHeaders(clbError, clbSuccess) {
    if (this.bhSubscribe) {
      this.bhSubscribe.unsubscribe(function(error, success) {
        if (error) {
          clbError(error);
        } else {
          clbSuccess(success);
        }
      });
    }
  }

  closeConnection() {
    var connectionMode = ipcRenderer.sendSync("getConnectionMode");
    if (connectionMode === 'local' && web3Local.currentProvider && web3Local.currentProvider.connection) {
      web3Local.currentProvider.connection.close();
    }
  }
}

// create new blockchain variable
EthoBlockchain = new Blockchain();
