const {ipcRenderer} = require('electron');

class Transactions {
    constructor() {
        this.filter = "";
        this.isSyncing = false;
    }

    setIsSyncing(value) {
        this.isSyncing = value;
    }

    getIsSyncing() {
        return this.isSyncing;
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
        if (counter < addressList.length - 1) {
            SyncProgress.setText(vsprintf("Syncing address transactions %d/%d, please wait...", [counter, addressList.length]));

            var startBlock = parseInt(counters.transactions) || 0;
            var params = vsprintf('?address=%s&fromBlock=%d&toBlock=%d', [addressList[counter].toLowerCase(), startBlock, lastBlock]);
            
            $.getJSON("https://richlist.ether1.org/transactions_list.php" + params,  function( result ) {
                result.data.forEach(element => {
                    ipcRenderer.send('storeTransaction', {
                        block: element.block.toString(),
                        txhash: element.txhash.toLowerCase(),
                        fromaddr: element.fromaddr.toLowerCase(),
                        timestamp: element.timestamp,
                        toaddr: element.toaddr.toLowerCase(),
                        value: element.value
                    });
                });
        
                // call the transaction sync for the next address
                EthoTransactions.syncTransactionsForSingleAddress(addressList, counters, lastBlock, counter + 1);
            });  
        } else {
            // update the counter and store it back to file system
            counters.transactions = lastBlock;
            ipcRenderer.sendSync('setJSONFile', 
            { 
                file: 'counters.json',
                data: counters
            });

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
             var dataTransactions = ipcRenderer.sendSync('getTransactions');
             var addressList = EthoWallets.getAddressList();

             dataTransactions.forEach(function(element) {
                var isFromValid = (addressList.indexOf(element[2].toLowerCase()) > -1);
                var isToValid = (addressList.indexOf(element[3].toLowerCase()) > -1);
          
                if ((isToValid) && (!isFromValid)) {
                  element.unshift(0);
                } else if ((!isToValid) && (isFromValid)) { 
                    element.unshift(1);
                } else {
                    element.unshift(2);
                }
            });
             
            // register the sort datetime format
            $.fn.dataTable.moment('MMM Do YYYY HH:mm:ss');

            // render the transactions
            $('#tableTransactionsForAll').DataTable({
                "paging": false,
                "scrollY": "calc(100vh - 115px)",
                "responsive": true,
                "processing": true,
                "order": [[ 1, "desc" ]],
                "data": dataTransactions,
                "oSearch": {"sSearch": EthoTransactions.getFilter() },
                "columnDefs": [
                    {
                        "targets": 0,
                        "render": function ( data, type, row ) {
                            if (data == 0) {
                                return '<i class="fas fa-arrow-left"></i>';
                            } else if (data == 1) {
                                return '<i class="fas fa-arrow-right"></i>';
                            } else {
                                return '<i class="fas fa-arrows-alt-h"></i>';
                            }
                        }
                    },
                    { 
                        "className": "transactionsBlockNum",
                        "targets": 1
                    },
                    {
                        "targets": 2,
                        "render": function ( data, type, row ) {
                            return moment(data, "YYYY-MM-DD HH:mm:ss").format("MMM Do YYYY HH:mm:ss"); 
                        }
                    },
                    {
                        "targets": 5,
                        "render": function ( data, type, row ) {
                            return parseFloat(web3Local.utils.fromWei(EthoUtils.toFixed(parseFloat(data)).toString(), 'ether')).toFixed(2); 
                        }
                    },
                    {
                        "targets": 6,
                        "defaultContent": "",
                        "render": function ( data, type, row ) {
                            if (row[1]) {
                                return '<i class="fas fa-check"></i>';
                            } else if (data == 1) {
                                return '<i class="fas fa-question"></i>';
                            }
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
                                                    txhash: element.hash.toLowerCase(),
                                                    fromaddr: element.from.toLowerCase(),
                                                    timestamp: moment.unix(data.timestamp).format('YYYY-MM-DD HH:mm:ss'),
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