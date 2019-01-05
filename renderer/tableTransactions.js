class tableTransactions {
    constructor() {
        this.appState = "account";
    }

    initialize(id, data) {
        // register the sort datetime format
        $.fn.dataTable.moment('MMM Do YYYY HH:mm:ss');

        var namesType = $.fn.dataTable.absoluteOrderNumber(
        [
            { value: null, position: 'top' }
        ]);
                        // render the transactions
        $(id).DataTable({
            "dom": 'Bfrtip',
            "paging": false,
            "scrollY": "calc(100vh - 115px)",
            "responsive": true,
            "processing": true,
            "order": [[ 1, "desc" ]],
            "data": data,
            "oSearch": {"sSearch": EthoTransactions.getFilter() },
            "buttons": 
            [
                {
                    text: '<i class="fas fa-sync-alt"></i>',
                    action: function ( e, dt, node, config ) {
                        EthoTransactions.renderTransactions();    
                    }
                }
            ],
            "columnDefs": [
                {
                    "targets": 0,
                    "render": function ( data, type, row ) {
                        if (data == 0) {
                            return '<i class="fas fa-arrow-left"></i>';
                        } else if (data == 1) {
                            return '<i class="fas fa-arrow-right"></i>';
                        } else {
                            return '<i class="fas fa-arrows-alt-h"></i>';
                        }
                    }
                },
                { 
                    "className": "transactionsBlockNum",
                    "type": namesType,
                    "targets": 1
                },
                {
                    "targets": 2,
                    "render": function ( data, type, row ) {
                        return moment(data, "YYYY-MM-DD HH:mm:ss").format("MMM Do YYYY HH:mm:ss"); 
                    }
                },
                {
                    "targets": 5,
                    "render": function ( data, type, row ) {
                        return parseFloat(web3Local.utils.fromWei(EthoUtils.toFixed(parseFloat(data)).toString(), 'ether')).toFixed(2); 
                    }
                },
                {
                    "targets": 6,
                    "defaultContent": "",
                    "render": function ( data, type, row ) {
                        if (row[1]) {
                            return '<i class="fas fa-check"></i>';
                        } else {
                            return '<i class="fas fa-question"></i>';
                        }
                    }
                }
            ],
            "drawCallback": function( settings ) {
                $("#loadingTransactionsOverlay").css("display", "none");  
            }
        });                
    }
}

// create new tables variable
EthoTableTransactions = new tableTransactions();  
