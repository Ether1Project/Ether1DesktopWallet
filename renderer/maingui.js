// In renderer process (web page).
const {ipcRenderer} = require('electron');

class MainGUI {
    constructor() {
        this.appState = "account";
    }

    changeAppState(newState) {
        this.appState = newState;
        $(".sidebarIconWrapper").removeClass("iconSelected");

        switch(this.appState) {
            case "account":
              $("#mainNavBtnWalletsWrapper").addClass("iconSelected"); 
              break;
              case "send":
              $("#mainNavBtnSendWrapper").addClass("iconSelected"); 
              break;
            case "transactions":
              $("#mainNavBtnTransactionsWrapper").addClass("iconSelected"); 
              break;
            case "settings":
              $("#mainNavBtnSettingsWrapper").addClass("iconSelected"); 
              break;
            default: // do nothing for now
          } 
    }

    getAppState() {
        return this.appState;
    }

    showGeneralError(errorText) {
        $("#txtGeneralError").html(errorText);

        // create and open the dialog
        $("#dlgGeneralError").iziModal();
        $('#dlgGeneralError').iziModal('open'); 
        
        $("#btnGeneralErrorOK").click(function() {
            $('#dlgGeneralError').iziModal('close');     
        });
    }

    renderTemplate(template, data, container) {
        var template = Handlebars.compile(ipcRenderer.sendSync('getTemplateContent', template)); 
        
        if (!container) {
            container = $("#mainContent") 
        }

        container.empty();
        container.html(template(data));
    }

    copyToClipboard(text) {
        var $temp = $("<input>");
        $("body").append($temp);
        $temp.val(text).select();
        document.execCommand("copy");
        $temp.remove();
    }
}

$("#mainNavBtnTransactions").click(function() {
    EthoMainGUI.changeAppState("transactions");
    EthoTransactions.renderTransactions();
});                

$("#mainNavBtnSend").click(function() {
    EthoMainGUI.changeAppState("send");
    EthoSend.renderSendState();
});                

$("#mainNavBtnWallets").click(function() {
    EthoMainGUI.changeAppState("account");
    EthoWallets.renderWalletsState();
});                

$("#mainNavBtnSettings").click(function() {
    EthoMainGUI.changeAppState("settings");
    EthoSettings.renderSettingsState();
});                

EthoMainGUI = new MainGUI();