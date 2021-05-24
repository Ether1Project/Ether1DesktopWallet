const {ipcRenderer} = require("electron");

class tableTransactions {
  constructor() {
    this.appState = "account";
  }

  initialize(id, data) {
    // register the sort datetime format
    $.fn.dataTable.moment("MMM Do YYYY HH:mm:ss");

    var namesType = $.fn.dataTable.absoluteOrderNumber([
      {
        value: null,
        position: "top"
      }
    ]);
    // render the transactions
    $(id).DataTable({
      dom: "Bfrtip",
      paging: false,
      scrollY: "calc(100vh - 115px)",
      responsive: true,
      processing: true,
      order: [
        [1, "desc"]
      ],
      data: data,
      oSearch: {
        sSearch: EthoTransactions.getFilter()
      },
      buttons: [
        {
          text: '<i class="fas fa-sync-alt"></i>',
          action: function (e, dt, node, config) {
            EthoTransactions.renderTransactions();
          }
        }
      ],
      columnDefs: [
        {
          targets: 0,
          render: function (data, type, row) {
            if (data == 0) {
              return '<i class="fas fa-arrow-left"></i>';
            } else if (data == 1) {
              return '<i class="fas fa-arrow-right"></i>';
            } else {
              return '<i class="fas fa-arrows-alt-h"></i>';
            }
          }
        }, {
          className: "transactionsBlockNum",
          type: namesType,
          targets: 1
        }, {
          targets: 2,
          render: function (data, type, row) {
            return moment(data, "YYYY-MM-DD HH:mm:ss").format("MMM Do YYYY HH:mm:ss");
          }
        }, {
          targets: 3,
          visible: false
        }, {
          targets: 6,
          render: function (data, type, row) {
            return parseFloat(web3Local.utils.fromWei(EthoUtils.toFixed(parseFloat(data)).toString(), "ether")).toFixed(2);
          }
        }, {
          targets: 7,
          defaultContent: "",
          render: function (data, type, row) {
            if (row[1]) {
              return '<i class="fas fa-check"></i>';
            } else {
              return '<i class="fas fa-question"></i>';
            }
          }
        }
      ],
      drawCallback: function (settings) {
        $("#loadingTransactionsOverlay").css("display", "none");
      }
    });

    $(id + " tbody").off("click").on("click", "td", function () {
      if ($(id).DataTable().cell(this).index().column == 1) {
        var rowIdx = $(id).DataTable().cell(this).index().row;
        var rowData = $(id).DataTable().rows(rowIdx).data()[0];

        $("#dlgTransactionInfo").iziModal();
        $("#txBlockHeight").html(rowData[1]);
        $("#txTimestamp").html(rowData[2]);
        $("#txHash").html(rowData[3]);
        $("#txHash").attr("href", vsprintf("http://explorer-x.mine2.live/tx/%s", [rowData[3]]));
        $("#txFromAddress").html(rowData[4]);
        $("#txFromAddress").attr("href", vsprintf("http://explorer-x.mine2.live/address/%s", [rowData[4]]));
        $("#txToAddress").html(rowData[5]);
        $("#txToAddress").attr("href", vsprintf("http://explorer-x.mine2.live/address/%s", [rowData[5]]));
        $("#txValue").html(web3Local.utils.fromWei(EthoUtils.toFixed(parseFloat(rowData[6])).toString(), "ether"));

        $("#dlgTransactionInfo a").off("click").on("click", function (even) {
          event.preventDefault();
          ipcRenderer.send("openURL", $(this).attr("href"));
        });

        $("#btnTxInfoClose").off("click").on("click", function () {
          $("#dlgTransactionInfo").iziModal("close");
        });

        $("#dlgTransactionInfo").iziModal("open");
      }
    });
  }
}

// create new tables variable
EthoTableTransactions = new tableTransactions();
