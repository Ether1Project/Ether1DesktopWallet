// In renderer process (web page).
const {ipcRenderer} = require('electron');

class SendTransaction {
    constructor() {}

    renderSendState() {
        EthoBlockchain.getAccountsData(
            function(error) {
              EthoMainGUI.showGeneralError(error);
            },
            function(data) {     
                EthoMainGUI.renderTemplate("send.html", data);          
                $(document).trigger("render_send");          
            }
        );
      
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
            $("#sendToAddress").val("");
            $("#sendAmmount").val(0);
        }
    }
}
        
$(document).on("render_send", function() {
    $('select').formSelect( {classes: "fromAddressSelect"});

    $("#sendFromAddress").on("change", function() {
        web3Local.eth.getBalance(this.value, function(error, balance) {
            $("#sendMaxAmmount").html(parseFloat(web3Local.utils.fromWei(balance, 'ether')));
        });
    });        

    $("#btnSendAll").off('click').on('click', function() {
        $("#sendAmmount").focus();
        $("#sendAmmount").val($("#sendMaxAmmount").html());
    });
    
    $("#btnLookForToAddress").off('click').on('click', function() {
        EthoBlockchain.getAddressListData(
            function(error) {
              EthoMainGUI.showGeneralError(error);
            },
            function(data) {
                $("#dlgAddressList").iziModal({ width: "800px" });
                EthoMainGUI.renderTemplate("addresslist.html", data, $("#dlgAddressListBody")); 
                $('#dlgAddressList').iziModal('open');

                $(".btnSelectToAddress").off('click').on('click', function() {
                    $("#sendToAddress").val($(this).attr('data-wallet'));
                    $('#dlgAddressList').iziModal('close');
                });

                $('#addressListFilter').off('input').on('input',function(e){
                    EthoUtils.filterTable($("#addressTable"), $('#addressListFilter').val());
                });

                $("#btnClearSearchField").off('click').on('click', function() {
                    EthoUtils.filterTable($("#addressTable"), "");
                    $('#addressListFilter').val("")
                });                
            }
        );
    });
    
    $("#btnSendTransaction").off('click').on('click', function() {
        if (EthoSend.validateSendForm()) {
            EthoBlockchain.getTranasctionFee($("#sendFromAddress").val(), $("#sendToAddress").val(), $("#sendAmmount").val(),
                function(error) {
                    EthoMainGUI.showGeneralError(error);
                },
                function(data) {
                    $("#dlgSendWalletPassword").iziModal();
                    $("#walletPassword").val("");
                    $("#fromAddressInfo").html($("#sendFromAddress").val());
                    $("#toAddressInfo").html($("#sendToAddress").val());
                    $("#valueToSendInfo").html($("#sendAmmount").val());
                    $("#feeToPayInfo").html(parseFloat(web3Local.utils.fromWei(data.toString(), 'ether')));
                    $('#dlgSendWalletPassword').iziModal('open');
            
                    function doSendTransaction() {
                        $('#dlgSendWalletPassword').iziModal('close');
                        
                        EthoBlockchain.prepareTransaction(
                            $("#walletPassword").val(),
                            $("#sendFromAddress").val(), 
                            $("#sendToAddress").val(), 
                            $("#sendAmmount").val(),
                            function(error) {
                                EthoMainGUI.showGeneralError(error);
                            },
                            function(data) {
                                EthoBlockchain.sendTransaction(data.raw, 
                                    function(error) {
                                        EthoMainGUI.showGeneralError(error);
                                    },
                                    function(data) {
                                        EthoSend.resetSendForm();

                                        iziToast.success({
                                            title: 'Sent',
                                            message: 'Transaction was successfully sent to the chain',
                                            position: 'topRight',
                                            timeout: 5000
                                        });                                         

                                        EthoBlockchain.getTransaction(data,
                                            function(error) {
                                                EthoMainGUI.showGeneralError(error);
                                            },
                                            function(transaction) {
                                                ipcRenderer.send('storeTransaction', {
                                                    block: element.block.toString(),
                                                    txhash: element.hash.toLowerCase(),
                                                    fromaddr: element.fromaddr.toLowerCase(),
                                                    timestamp: element.timestamp,
                                                    toaddr: element.toaddr.toLowerCase(),
                                                    value: element.value
                                                });                    
                                            }        
                                        );
                                    }
                                );
                            }
                        );
                    }

                    $("#btnSendWalletPasswordConfirm").off('click').on('click', function() {
                        doSendTransaction();
                    });
                    
                    $("#dlgSendWalletPassword").off('keypress').on('keypress', function(e) {
                        if(e.which == 13) {
                            doSendTransaction();
                        }
                    });                                
                }
            );
        }         
    });
});
  
// create new account variable
EthoSend = new SendTransaction();  