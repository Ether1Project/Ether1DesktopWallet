// In renderer process (web page).
const {ipcRenderer} = require('electron');

class Settings {
    constructor() {}

    renderSettingsState() {
        EthoMainGUI.renderTemplate("settings.html", {});          
        $(document).trigger("render_settings");                
    }
}
        
$(document).on("render_settings", function() {
    $("#btnSettingsCleanTransactions").off('click').on('click', function() {
        if (isFullySynced) {
            EthoMainGUI.showGeneralConfirmation("Do you really want to resync transactions?", function(result) {
                if (result) {
                    if (EthoTransactions.getIsSyncing()) {
                        EthoMainGUI.showGeneralError("Transactions sync is currently in progress");  
                    } else {
                        // first disable keepInSync
                        EthoTransactions.disableKeepInSync();
                        // then delete the transactions data    
                        var counters = EthoDatatabse.getCounters();
                        counters.transactions = 0;
                        EthoDatatabse.setCounters(counters);
                        ipcRenderer.sendSync('deleteTransactions', null);
                        // sync all the transactions to the current block
                        web3Local.eth.getBlock("latest", function(error, localBlock) {
                            if (error) {
                                EthoMainGUI.showGeneralError(error);
                            } else {
                                EthoTransactions.enableKeepInSync();
                                EthoTransactions.syncTransactionsForAllAddresses(localBlock.number);
        
                                iziToast.success({
                                    title: 'Success',
                                    message: 'Transactions are being resynced',
                                    position: 'topRight',
                                    timeout: 5000
                                });             
                            }                    
                        });
                    }
                }
            });    
        } else {
            iziToast.info({
                title: 'Wait...',
                message: 'You need to be fully sync before cleaning transactions',
                position: 'topRight',
                timeout: 5000
            });             
        }
    });

    $("#btnSettingsCleanWallets").off('click').on('click', function() {
        EthoMainGUI.showGeneralError("Not implemented yet!");
    });

    $("#btnSettingsCleanBlockchain").off('click').on('click', function() {
        EthoMainGUI.showGeneralError("Not implemented yet!");
    });
});
  
// create new account variable
EthoSettings = new Settings();  