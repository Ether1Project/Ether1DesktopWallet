// In renderer process (web page).
const {ipcRenderer} = require('electron');

class Wallets {
  constructor() {
    this.addressList = []; 
  }
  
  getAddressList() {
    return this.addressList;
  }

  clearAddressList() {
    this.addressList = []; 
  }

  getAddressExists(address) {
    return this.addressList.indexOf(address.toLowerCase()) > -1;
  }

  addAddressToList(address) {
    this.addressList.push(address.toLowerCase());
  }

  validateNewAccountForm() {
    if (EthoMainGUI.getAppState() == "account") {
        if (!$("#walletPasswordFirst").val()) {
            EthoMainGUI.showGeneralError("Password cannot be empty!");  
            return false;
        }
        
        if (!$("#walletPasswordSecond").val()) {
          EthoMainGUI.showGeneralError("Password cannot be empty!");  
          return false;
        }

        if ($("#walletPasswordFirst").val() !== $("#walletPasswordSecond").val()) {
            EthoMainGUI.showGeneralError("Passwords do not match!");  
            return false;
        }

        return true;
    } else {
        return false;
    }
}

renderWalletsState() {
    // clear the list of addresses
    EthoWallets.clearAddressList();

    EthoBlockchain.getAccountsData(
      function(error) {
        EthoMainGUI.showGeneralError(error);
      },
      function(data) {
        data.addressData.forEach(element => {
          EthoWallets.addAddressToList(element.address);
        });

        // render the wallets current state
        EthoMainGUI.renderTemplate("wallets.html", data);          
        $(document).trigger("render_wallets");
      }
  );
}
}

// the event to tell us that the wallets are rendered
$(document).on("render_wallets", function() {
  $('#addressTable').floatThead();

  $("#btnNewAddress").off('click').on('click', function() {
    $("#dlgCreateWalletPassword").iziModal();
    $("#walletPasswordFirst").val("");
    $("#walletPasswordSecond").val("");
    $('#dlgCreateWalletPassword').iziModal('open');

    function doCreateNewWallet() {
      $('#dlgCreateWalletPassword').iziModal('close');

      if (EthoWallets.validateNewAccountForm()) {
        EthoBlockchain.createNewAccount($("#walletPasswordFirst").val(),
          function(error) {
            EthoMainGUI.showGeneralError(error);
          },
          function(account) {      
            EthoWallets.addAddressToList(account);
            EthoWallets.renderWalletsState();
          }
        );
      }      
    }

    $("#btnCreateWalletConfirm").off('click').on('click', function() {
      doCreateNewWallet();
    });

    $("dlgCreateWalletPassword").off('keypress').on('keypress', function(e) {
      if(e.which == 13) {
        doCreateNewWallet();
      }
    });                                

  });                

  $(".btnChangWalletName").off('click').on('click', function() {
    var walletAddress = $(this).attr('data-wallet');
    var walletName = $(this).attr('data-name');

    $("#dlgChangeWalletName").iziModal();
    $("#inputWalletName").val(walletName);
    $('#dlgChangeWalletName').iziModal('open');

    function doChangeWalletName() {
      var wallets = ipcRenderer.sendSync('getJSONFile', 'wallets.json');

      if (!wallets) {
        wallets = { names: {} };
      }

      // set the wallet name from the dialog box
      wallets.names[walletAddress] = $("#inputWalletName").val();
      ipcRenderer.sendSync('setJSONFile', 
      { 
          file: 'wallets.json',
          data: wallets
      });

      $('#dlgChangeWalletName').iziModal('close');
      EthoWallets.renderWalletsState();
    }

    $("#btnChangeWalletNameConfirm").off('click').on('click', function() {
      doChangeWalletName();
    });

    $("#dlgChangeWalletName").off('keypress').on('keypress', function(e) {
      if(e.which == 13) {
        doChangeWalletName();
      }
    });                                
  });                

  $(".btnCopyWalletAddress").off('click').on('click', function() {
    EthoMainGUI.copyToClipboard($(this).attr('data-wallet'));

    iziToast.success({
      title: 'Copied',
      message: 'Address was copied to clipboard',
      position: 'topRight',
      timeout: 2000
    }); 
  });
});

// event that tells us that geth is ready and up
$(document).on("onGethReady", function() {
  EthoMainGUI.changeAppState("account");
  EthoWallets.renderWalletsState();
});

$(document).on("onNewAccountTransaction", function() {
  if (EthoMainGUI.getAppState() == "account") {
    EthoWallets.renderWalletsState();
  }
});
  
EthoWallets = new Wallets();