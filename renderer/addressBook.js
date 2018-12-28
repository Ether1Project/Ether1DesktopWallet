const {ipcRenderer} = require('electron');

class AddressBook {
  constructor() {
  }
  
  setAddressName(address, name) {
    var addressBook = EthoDatatabse.getAddresses();

    // set the wallet name from the dialog box
    addressBook.names[address] = name;
    EthoDatatabse.setAddresses(addressBook);
  }

  getAddressName(address) {
    var addressBook = EthoDatatabse.getAddresses();
    // set the wallet name from the dialog box
    return addressBook.names[address] || "";
  }

  getAddressList() {
    var addressBook = EthoDatatabse.getAddresses();
    return addressBook.names;
  }

  deleteAddress(address) {
    var addressBook = EthoDatatabse.getAddresses();
    delete addressBook.names[address];
    EthoDatatabse.setAddresses(addressBook);
  }

  enableButtonTooltips() {
  }
    
  renderAddressBook() {
    var addressObject = EthoAddressBook.getAddressList();
    var renderData = { addressData: [] };

    for (var key in addressObject) {
      if (addressObject.hasOwnProperty(key)) {
        var addressEntry = {};
        addressEntry.name = addressObject[key];
        addressEntry.address = key;
        renderData.addressData.push(addressEntry);
      }
    }

    // render the wallets current state
    EthoMainGUI.renderTemplate("addressBook.html", renderData);          
    $(document).trigger("render_addressBook");
    EthoAddressBook.enableButtonTooltips();
  }
}

// the event to tell us that the wallets are rendered
$(document).on("render_addressBook", function() {
  $("#btnNewAddress").off('click').on('click', function() {
    $("#dlgCreateAddressAndName").iziModal();
    $("#addressName").val("");
    $("#addressHash").val("");
    $('#dlgCreateAddressAndName').iziModal('open');

    function doCreateNewWallet() {
      $('#dlgCreateAddressAndName').iziModal('close');

      if (!EthoBlockchain.isAddress($("#addressHash").val())) {
        EthoMainGUI.showGeneralError("Address must be a valid address!");  
      } else {
        EthoAddressBook.setAddressName($("#addressHash").val(), $("#addressName").val());
        EthoAddressBook.renderAddressBook();
  
        iziToast.success({
          title: 'Created',
          message: 'New address was successfully created',
          position: 'topRight',
          timeout: 5000
        });                                         
  
      }
    }      

    $("#btnCreateAddressConfirm").off('click').on('click', function() {
      doCreateNewWallet();
    });

    $("#dlgCreateAddressAndName").off('keypress').on('keypress', function(e) {
      if(e.which == 13) {
        doCreateNewWallet();
      }
    });                                
  });  
  
  $(".btnChangAddressName").off('click').on('click', function() {
    var walletAddress = $(this).attr('data-address');
    var walletName = $(this).attr('data-name');

    $("#dlgChangeAddressName").iziModal();
    $("#inputAddressName").val(walletName);
    $('#dlgChangeAddressName').iziModal('open');

    function doChangeAddressName() {
      EthoAddressBook.setAddressName(walletAddress, $("#inputAddressName").val());
      $('#dlgChangeAddressName').iziModal('close');
      EthoAddressBook.renderAddressBook();
    }

    $("#btnChangeAddressNameConfirm").off('click').on('click', function() {
      doChangeAddressName();
    });

    $("#dlgChangeAddressName").off('keypress').on('keypress', function(e) {
      if(e.which == 13) {
        doChangeAddressName();
      }
    });                                
  });                
  
  $(".btnDeleteAddress").off('click').on('click', function() {
    var deleteAddress = $(this).attr('data-address');

    $("#dlgDeleteAddressConfirm").iziModal();
    $('#dlgDeleteAddressConfirm').iziModal('open');
    
    $("#btnDeleteAddressCancel").off('click').on('click', function() {
      $('#dlgDeleteAddressConfirm').iziModal('close');
    });

    $("#btnDeleteAddressConfirm").off('click').on('click', function() {
      $('#dlgDeleteAddressConfirm').iziModal('close');
      EthoAddressBook.deleteAddress(deleteAddress);
      EthoAddressBook.renderAddressBook();
    });
  });                
});                
  
EthoAddressBook = new AddressBook();