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
        EthoMainGUI.showGeneralConfirmation("Do you really want to resync transactions?", function(result) {
            if (result) {
                if (EthoTransactions.getIsSyncing()) {
                    EthoMainGUI.showGeneralError("Transactions sync is currently in progress");  
                } else {
                    EthoTransactions.disableKeepInSync();
                }
            }
        });
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