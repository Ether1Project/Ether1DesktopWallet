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
            $("#sendFromAddress").val("");
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

        /*
        // list all transactions for this address
        if (this.value) {
            $("#cardTransactionsForAddress").css("display", "block");

            setTimeout(() =>    {
                // render the transactions
                $('#tableTransactionsForAddress').DataTable({
                    "paging": false,
                    "scrollY": "calc(100vh - 115px)",
                    "responsive": true,
                    "processing": true,
                    "order": [[ 0, "desc" ]],
                    "data": ipcRenderer.sendSync('getTransactions', this.value),
                    "columnDefs": [
                        { 
                            "className": "transactionsBlockNum",
                            "targets": 0
                        },
                        {
                            "targets": 1,
                            "render": function ( data, type, row ) {
                                return moment(data).format("MMM Do YYYY"); 
                            }
                        },
                        {
                            "targets": 4,
                            "render": function ( data, type, row ) {
                                return parseFloat(web3Local.utils.fromWei(EthoUtils.toFixed(parseFloat(data)).toString(), 'ether')).toFixed(2); 
                            }
                        }
                    ],
                    "drawCallback": function( settings ) {
                        $("#loadingTransactionsOverlay").css("display", "none");  
                    }
                });                
            }, 200);
        } else {
            $("#cardTransactionsForAddress").css("display", "none");
        }
        */
    });        

    $("#btnSendAll").off('click').on('click', function() {
        $("#sendAmmount").focus();
        $("#sendAmmount").val($("#sendMaxAmmount").html());
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
                                        // use the transaction hash
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