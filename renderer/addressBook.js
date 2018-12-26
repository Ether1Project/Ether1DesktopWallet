const {ipcRenderer} = require('electron');

class AddressBook {
  constructor() {
  }
  
  setAddressName(address, name) {
    console.log(address);
    console.log(name);
    var addressBook = ipcRenderer.sendSync('getJSONFile', 'addresses.json');

    if (!addressBook) {
      addressBook = { names: {} };
    }

    // set the wallet name from the dialog box
    addressBook.names[address] = name;
    ipcRenderer.sendSync('setJSONFile', 
    { 
        file: 'addresses.json',
        data: addressBook
    });
  }

  getAddressName(address) {
    var addressBook = ipcRenderer.sendSync('getJSONFile', 'addresses.json');

    if (!addressBook) {
      addressBook = { names: {} };
    }

    // set the wallet name from the dialog box
    return addressBook.names[address] || "";
  }

  getAddressList() {
    var addressBook = ipcRenderer.sendSync('getJSONFile', 'addresses.json');

    if (!addressBook) {
      addressBook = { names: {} };
    }

    return addressBook.names;
  }

  deleteAddress(address) {
    var addressBook = ipcRenderer.sendSync('getJSONFile', 'addresses.json');

    if (!addressBook) {
      addressBook = { names: {} };
    } else {
      delete addressBook.names[address];
    }

    ipcRenderer.sendSync('setJSONFile', 
    { 
        file: 'addresses.json',
        data: addressBook
    });
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

      EthoAddressBook.setAddressName($("#addressHash").val(), $("#addressName").val());
      EthoAddressBook.renderAddressBook();

      iziToast.success({
        title: 'Created',
        message: 'New address was successfully created',
        position: 'topRight',
        timeout: 5000
      });                                         
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
    $("#dlgDeleteAddressConfirm").iziModal();
    $('#dlgDeleteAddressConfirm').iziModal('open');
    
    $("#btnDeleteAddressCancel").off('click').on('click', function() {
      $('#dlgDeleteAddressConfirm').iziModal('close');
    });

    $("#btnDeleteAddressConfirm").off('click').on('click', function() {
      EthoAddressBook.deleteAddress($(this).attr('data-address'));
      $('#dlgDeleteAddressConfirm').iziModal('close');
      EthoAddressBook.renderAddressBook();
    });
  });                
});                
  
EthoAddressBook = new AddressBook();