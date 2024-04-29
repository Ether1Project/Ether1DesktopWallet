// In renderer process (web page).
const {ipcRenderer} = require("electron");

class SendTransaction {
  constructor() {}

  renderSendState() {
    EthoBlockchain.getAccountsData(function (error) {
      EthoMainGUI.showGeneralError(error);
    }, function (data) {
      EthoMainGUI.renderTemplate("send.html", data);
      $(document).trigger("render_send");
    });
  }

  validateSendForm() {
    if (EthoMainGUI.getAppState() == "send") {
      if (!$("#sendFromAddress").val()) {
        EthoMainGUI.showGeneralError("Sender address must be specified!");
        return false;
      }

      if (!EthoBlockchain.isAddress($("#sendFromAddress").val())) {
        EthoMainGUI.showGeneralError("Sender address must be a valid address!");
        return false;
      }

      if (!$("#sendToAddress").val()) {
        EthoMainGUI.showGeneralError("Recipient address must be specified!");
        return false;
      }

      if (!EthoBlockchain.isAddress($("#sendToAddress").val())) {
        EthoMainGUI.showGeneralError("Recipient address must be a valid address!");
        return false;
      }

      if (Number($("#sendAmmount").val()) <= 0) {
        EthoMainGUI.showGeneralError("Send ammount must be greater then zero!");
        return false;
      }

      return true;
    } else {
      return false;
    }
  }

  resetSendForm() {
    if (EthoMainGUI.getAppState() == "send") {
      $("#sendToAddressName").html("");
      $("#sendToAddress").val("");
      $("#sendAmmount").val(0);
    }
  }
}

$(document).on("render_send", function () {
  //$("select").formSelect({classes: "fromAddressSelect"});
	setTimeout(() => {
	    var optionText = $("#sendFromAddress").find("option:selected").text();
	    var selectedAddressBalance = optionText.substr(0, optionText.indexOf("|"));
	    
	    console.log("selectedAddressBalance", selectedAddressBalance);
	    $("#sendMaxAmmount").html(parseFloat(selectedAddressBalance));
	    //$("#sendAmmount").val(selectedAddressBalance);
	}, 500);



  $("#sendFromAddress").on("change", function () {
    var optionText = $(this).find("option:selected").text();

    var addrBalance = optionText.substr(0, optionText.indexOf("|"));
    var addrName = optionText.substr(optionText.indexOf("|")+1);
    var addrValue = addrName.substr(addrName.indexOf("|")+1);
    

    $(".fromAddressSelect input").val(addrValue.trim());

    $("#sendMaxAmmount").html(parseFloat(addrBalance));
	
  });

  $("#btnSendAll").off("click").on("click", function () {
    $("#sendAmmount").focus();
    $("#sendAmmount").val($("#sendMaxAmmount").html());
  });

  $("#sendToAddress").off("input").on("input", function () {
    var addressName = null;
    $("#sendToAddressName").html("");
    addressName = EthoAddressBook.getAddressName($("#sendToAddress").val());

    if (!addressName) {
      var wallets = EthoDatatabse.getWallets();
      addressName = wallets.names[$("#sendToAddress").val()];
    }
    $("#sendToAddressName").html(addressName);
  });

  $("#btnLookForToAddress").off("click").on("click", function () {
    EthoBlockchain.getAddressListData(function (error) {
      EthoMainGUI.showGeneralError(error);
    }, function (addressList) {
      var addressBook = EthoAddressBook.getAddressList();

      for (var key in addressBook) {
        if (addressBook.hasOwnProperty(key)) {
          var adddressObject = {};
          adddressObject.address = key;
          adddressObject.name = addressBook[key];
          adddressObject.balance = 0;

          addressList.addressData.push(adddressObject);
          
	       web3Local.eth.getBalance(key, function (error, balance) {
		    if (error) {
			console.error("Error fetching balance:", error);
			return;
		    }

		    // Update the balance display
		    var etherBalance = web3Local.utils.fromWei(balance, "ether");
		    //$("#sendFromAddressBalance").text("Balance: " + etherBalance + " ETHO");
		    adddressObject.balance = parseFloat(etherBalance)
	
		    
		});  
          
        }
      }
      

      $("#dlgAddressList").iziModal({width: "800px"});
      EthoMainGUI.renderTemplate("addresslist.html", addressList, $("#dlgAddressListBody"));
      $("#dlgAddressList").iziModal("open");

      $(".btnSelectToAddress").off("click").on("click", function () {
        $("#sendToAddressName").html($(this).attr("data-name"));
        $("#sendToAddress").val($(this).attr("data-wallet"));
        $("#dlgAddressList").iziModal("close");
      });

      $("#addressListFilter").off("input").on("input", function (e) {
        EthoUtils.filterTable($("#addressTable"), $("#addressListFilter").val());
      });

      $("#btnClearSearchField").off("click").on("click", function () {
        EthoUtils.filterTable($("#addressTable"), "");
        $("#addressListFilter").val("");
      });
    });
  });

  $("#btnAddToAddressBook").off("click").on("click", function () {
    if (EthoBlockchain.isAddress($("#sendToAddress").val())) {
      $("#dlgAddAddressToBook").iziModal();
      $("#inputAddressName").val("");
      $("#dlgAddAddressToBook").iziModal("open");

      function doAddAddressToAddressBook() {
        EthoAddressBook.setAddressName($("#sendToAddress").val(), $("#inputAddressName").val());
        $("#dlgAddAddressToBook").iziModal("close");

        iziToast.success({title: "Success", message: "Address was added to address book", position: "topRight", timeout: 2000});
      }
    } else {
      EthoMainGUI.showGeneralError("Recipient address is not valid!");
    }

    $("#btnAddAddressToBookConfirm").off("click").on("click", function () {
      doAddAddressToAddressBook();
    });

    $("#dlgAddAddressToBook").off("keypress").on("keypress", function (e) {
      if (e.which == 13) {
        doAddAddressToAddressBook();
      }
    });
  });

  $("#btnSendTransaction").off("click").on("click", function () {
    if (EthoSend.validateSendForm()) {
      EthoBlockchain.getTranasctionFee($("#sendFromAddress").val(), $("#sendToAddress").val(), $("#sendAmmount").val(), function (error) {
        EthoMainGUI.showGeneralError(error);
      }, function (data) {
        $("#dlgSendWalletPassword").iziModal();
        $("#walletPassword").val("");
        $("#fromAddressInfo").html($("#sendFromAddress").val());
        $("#toAddressInfo").html($("#sendToAddress").val());
        $("#valueToSendInfo").html($("#sendAmmount").val());
        $("#feeToPayInfo").html(parseFloat(web3Local.utils.fromWei(data.toString(), "ether")));
        $("#dlgSendWalletPassword").iziModal("open");

        function doSendTransaction() {
          $("#dlgSendWalletPassword").iziModal("close");

          EthoBlockchain.prepareTransaction($("#walletPassword").val(), $("#sendFromAddress").val(), $("#sendToAddress").val(), $("#sendAmmount").val(), function (error) {
            EthoMainGUI.showGeneralError(error);
          }, function (data) {
            EthoBlockchain.sendTransaction(data.raw, function (error) {
              EthoMainGUI.showGeneralError(error);
            }, function (data) {
              EthoSend.resetSendForm();

              iziToast.success({title: "Sent", message: "Transaction was successfully sent to the chain", position: "topRight", timeout: 5000});

              EthoBlockchain.getTransaction(data, function (error) {
                EthoMainGUI.showGeneralError(error);
              }, function (transaction) {
                ipcRenderer.send("storeTransaction", {
                  block: transaction.blockNumber,
                  txhash: transaction.hash.toLowerCase(),
                  fromaddr: transaction.from.toLowerCase(),
                  timestamp: moment().format("YYYY-MM-DD HH:mm:ss"),
                  toaddr: transaction.to.toLowerCase(),
                  value: transaction.value
                });
              });
            });
          });
        }

        $("#btnSendWalletPasswordConfirm").off("click").on("click", function () {
          doSendTransaction();
        });

        $("#dlgSendWalletPassword").off("keypress").on("keypress", function (e) {
          if (e.which == 13) {
            doSendTransaction();
          }
        });
      });
    }
  });
});

// create new account variable
EthoSend = new SendTransaction();
