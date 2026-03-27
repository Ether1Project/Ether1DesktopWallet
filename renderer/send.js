// In renderer process (web page).
const {ipcRenderer} = require("electron");

class SendTransaction {
  constructor() {}

  normalizeAmountValue(value) {
    var normalized = String(value || "").replace(/,/g, ".").replace(/[^0-9.]/g, "");
    var firstDot = normalized.indexOf(".");

    if (firstDot > -1) {
      normalized = normalized.slice(0, firstDot + 1) + normalized.slice(firstDot + 1).replace(/\./g, "");
    }

    if (normalized.startsWith(".")) {
      normalized = "0" + normalized;
    }

    return normalized;
  }

  getNormalizedAmount() {
    return this.normalizeAmountValue($("#sendAmmount").val());
  }

  getSelectedFromOption() {
    return $("#sendFromAddress").find("option:selected");
  }

  getSelectedBalanceWei() {
    var option = this.getSelectedFromOption();
    var balanceWei = option.attr("data-balance-wei") || "0";

    return web3Local.utils.toBN(balanceWei);
  }

  getSelectedBalanceEth() {
    return this.normalizeAmountValue(this.getSelectedFromOption().attr("data-balance-eth") || "0");
  }

  formatAmountForDisplay(value, maxDecimals) {
    var normalized = this.normalizeAmountValue(value);

    if (!normalized) {
      return "0";
    }

    if (normalized.indexOf(".") === -1) {
      return normalized;
    }

    var parts = normalized.split(".");
    var whole = parts[0] || "0";
    var fraction = (parts[1] || "").slice(0, maxDecimals).replace(/0+$/, "");

    return fraction ? `${whole}.${fraction}` : whole;
  }

  updateSelectedMaxAmount() {
    $("#sendMaxAmmount").html(this.formatAmountForDisplay(this.getSelectedBalanceEth(), 8));
  }

  syncAmountInput() {
    var normalized = this.getNormalizedAmount();

    if ($("#sendAmmount").val() !== normalized) {
      $("#sendAmmount").val(normalized);
    }
  }

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
      var amount = this.getNormalizedAmount();

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

      if (!amount || Number(amount) <= 0) {
        EthoMainGUI.showGeneralError("Send ammount must be greater then zero!");
        return false;
      }

      $("#sendAmmount").val(amount);

      var amountWei = web3Local.utils.toBN(web3Local.utils.toWei(amount, "ether"));

      if (amountWei.gt(this.getSelectedBalanceWei())) {
        EthoMainGUI.showGeneralError("Send ammount exceeds the selected wallet balance!");
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
      $("#sendAmmount").val("0");
    }
  }

  fillMaxAmount() {
    if (!$("#sendFromAddress").val()) {
      EthoMainGUI.showGeneralError("Sender address must be specified!");
      return;
    }

    if (!$("#sendToAddress").val() || !EthoBlockchain.isAddress($("#sendToAddress").val())) {
      EthoMainGUI.showGeneralError("Recipient address must be a valid address before using ALL.");
      return;
    }

    var balanceWei = this.getSelectedBalanceWei();

    if (balanceWei.lte(web3Local.utils.toBN("0"))) {
      EthoMainGUI.showGeneralError("Selected wallet has no spendable balance.");
      return;
    }

    EthoBlockchain.getTranasctionFee($("#sendFromAddress").val(), $("#sendToAddress").val(), "0", function (error) {
      EthoMainGUI.showGeneralError(error);
    }, function (feeWei) {
      var fee = web3Local.utils.toBN(feeWei.toString());

      if (balanceWei.lte(fee)) {
        EthoMainGUI.showGeneralError("Selected wallet balance is not enough to cover the transaction fee.");
        return;
      }

      var maxSpendableWei = balanceWei.sub(fee);
      var maxSpendableEth = web3Local.utils.fromWei(maxSpendableWei, "ether");

      $("#sendAmmount").focus();
      $("#sendAmmount").val(EthoSend.formatAmountForDisplay(maxSpendableEth, 18));
    });
  }
}

$(document).on("render_send", function () {
  setTimeout(() => {
    EthoSend.updateSelectedMaxAmount();
  }, 500);



  $("#sendFromAddress").on("change", function () {
    var optionText = $(this).find("option:selected").text();

    var addrName = optionText.substr(optionText.indexOf("|")+1);
    var addrValue = addrName.substr(addrName.indexOf("|")+1);
    

    $(".fromAddressSelect input").val(addrValue.trim());
    EthoSend.updateSelectedMaxAmount();
	
  });

  $("#btnSendAll").off("click").on("click", function () {
    EthoSend.fillMaxAmount();
  });

  $("#sendAmmount").off("input").on("input", function () {
    EthoSend.syncAmountInput();
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
        $("#valueToSendInfo").html(EthoSend.getNormalizedAmount());
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
