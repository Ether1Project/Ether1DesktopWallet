// In renderer process (web page).
const {ipcRenderer} = require('electron');

class Transactions {
    constructor() {
        this.isSyncing = false;
    }

    setIsSyncing(value) {
        this.isSyncing = value;
    }

    getIsSyncing() {
        return this.isSyncing;
    }

    syncTransactionsForSingleAddress(addressList, counters, lastBlock, counter) { 
        if (counter < addressList.length - 1) {
            SyncProgress.setText(vsprintf("Syncing address transactions %d/%d, please wait...", [counter, addressList.length]));

            var startBlock = parseInt(counters.transactions) || 0;
            var params = vsprintf('?address=%s&fromBlock=%d&toBlock=%d', [addressList[counter], startBlock, lastBlock]);
            
            $.getJSON("https://richlist.ether1.org/transactions_list.php" + params,  function( result ) {
                result.data.forEach(element => {
                    var Transaction = {
                        block: element.block,
                        fromaddr: element.fromaddr,
                        timestamp: element.timestamp,
                        toaddr: element.toaddr,
                        value: element.value
                    }
                    ipcRenderer.send('storeTransaction', Transaction);
                });
        
                // update the counter and store it back to file system
                counters.transactions = lastBlock;
                ipcRenderer.sendSync('setJSONFile', 
                { 
                    file: 'counters.json',
                    data: counters
                });

                // call the transaction sync for the next address
                EthoTransactions.syncTransactionsForSingleAddress(addressList, counters, lastBlock, counter + 1);
            });  
        } else {
            SyncProgress.setText("Syncing transactions is complete.");
            EthoTransactions.setIsSyncing(false);
        }
    }

    syncTransactionsForAllAddresses(lastBlock) {
        var counters = ipcRenderer.sendSync('getJSONFile', 'counters.json');
        var counter = 0;

        if (counters == null) {
            counters = {};    
        }

        EthoBlockchain.getAccounts(
            function(error) {
                EthoMainGUI.showGeneralError(error);
            },
            function(data) {
                EthoTransactions.setIsSyncing(true);
                EthoTransactions.syncTransactionsForSingleAddress(data, counters, lastBlock, counter);
            }
        );
    }

    renderTransactions() {
        EthoMainGUI.renderTemplate("transactions.html", {});          
        $(document).trigger("render_transactions");
        
        // show the loading overlay for transactions
        $("#loadingTransactionsOverlay").css("display", "block");
    
        setTimeout(() => {
            // render the transactions
            $('#tableTransactionsForAll').DataTable({
                "paging": false,
                "scrollY": "calc(100vh - 115px)",
                "responsive": true,
                "processing": true,
                "order": [[ 0, "desc" ]],
                "data": ipcRenderer.sendSync('getTransactions'),
                "columnDefs": [
                    { 
                        "className": "transactionsBlockNum",
                        "targets": 0
                    },
                    {
                        "targets": 1,
                        "render": function ( data, type, row ) {
                            return moment(data).format("MMM Do YYYY"); 
                        }
                    },
                    {
                        "targets": 4,
                        "render": function ( data, type, row ) {
                            return parseFloat(web3Local.utils.fromWei(EthoUtils.toFixed(parseFloat(data)).toString(), 'ether')).toFixed(2); 
                        }
                    }
                ],
                "drawCallback": function( settings ) {
                    $("#loadingTransactionsOverlay").css("display", "none");  
                }
            });                
        }, 200);
    }

}

// event that tells us that geth is ready and up
$(document).on("onSyncInterval", function() {
    var counters = ipcRenderer.sendSync('getJSONFile', 'counters.json');

    if (counters == null) {
        counters = {};    
    }

    function doSyncRemainingBlocks() {
        EthoBlockchain.getBlock("latest", false,
            function(error) {
                EthoMainGUI.showGeneralError(error);
            },
            function(block) {
                var lastBlock = counters.transactions || 0;

                if (lastBlock < block.number) {
                    function getNextBlockTransactions(blockNumber, maxBlock) {
                        EthoBlockchain.getBlock(blockNumber, true,
                            function(error) {
                                EthoMainGUI.showGeneralError(error);
                            },
                            function(data) {
                                if (blockNumber < maxBlock) {
                                    if (data.transactions) {                                    
                                        data.transactions.forEach(element => {
                                            if ((EthoWallets.getAddressExists(element.from)) || (EthoWallets.getAddressExists(element.to))) {
                                                var Transaction = {
                                                    block: element.blockNumber.toString(),
                                                    fromaddr: element.from.toLowerCase(),
                                                    timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
                                                    toaddr: element.to.toLowerCase(),
                                                    value: Number(element.value).toExponential(5).toString().replace('+','')
                                                }
                                                
                                                // store transaction and notify about new transactions
                                                ipcRenderer.send('storeTransaction', Transaction);
                                                $(document).trigger("onNewAccountTransaction");
                                            }
                                        });                    
                                    }

                                    // call the next iteration for the next block 
                                    getNextBlockTransactions(blockNumber + 1 , maxBlock)    
                                } else {
                                    setTimeout(function() { 
                                        doSyncRemainingBlocks();
                                    }, 10000);                                    
                                }
                                
                            }
                        );
                    }

                    // call initial call of function
                    getNextBlockTransactions(lastBlock, block.number);
                } else {                    
                    counters.transactions = block.number;
                    ipcRenderer.sendSync('setJSONFile', 
                    { 
                        file: 'counters.json',
                        data: counters
                    });

                    setTimeout(function() { 
                        doSyncRemainingBlocks();
                    }, 10000);                    
                }
            }
        );        
    }

    // do the initial sync
    doSyncRemainingBlocks();
});
  
        
// create new transactions variable
EthoTransactions = new Transactions();  