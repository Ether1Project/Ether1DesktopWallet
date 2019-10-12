/*SET CONTRACTS UP HERE*/
var GlobalChannelString = "ethoFSPinningChannel_alpha11";
var GlobalControllerContractAddress = "0xc38B47169950D8A28bC77a6Fa7467464f25ADAFc";
var GlobalControllerABI = JSON.parse('[ { "constant": true, "inputs": [], "name": "last_completed_migration", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "name": "", "type": "address", "value": "0x" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "constant": false, "inputs": [ { "name": "completed", "type": "uint256" } ], "name": "setCompleted", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "new_address", "type": "address" } ], "name": "upgrade", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "pinToAdd", "type": "string" }, { "name": "pinSize", "type": "uint32" } ], "name": "PinAdd", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "pin", "type": "string" } ], "name": "PinRemove", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "constant": false, "inputs": [], "name": "deleteContract", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "set", "type": "address" } ], "name": "SetAccountCollectionAddress", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "hostingCost", "type": "uint256" } ], "name": "SetHostingCost", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "pinStorageAddress", "type": "address" } ], "name": "SetPinStorageAddress", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "ethoFSDashboardAddress", "type": "address" } ], "name": "SetEthoFSDashboardAddress", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "ethoFSHostingContractsAddress", "type": "address" } ], "name": "SetEthoFSHostingContractsAddress", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" }, { "name": "AccountName", "type": "string" } ], "name": "AddNewUserOwner", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "AccountName", "type": "string" } ], "name": "AddNewUserPublic", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "RemoveUserOwner", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "RemoveUserPublic", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "MainContentHash", "type": "string" }, { "name": "HostingContractName", "type": "string" }, { "name": "HostingContractDuration", "type": "uint32" }, { "name": "TotalContractSize", "type": "uint32" }, { "name": "pinSize", "type": "uint32" }, { "name": "ContentHashString", "type": "string" }, { "name": "ContentPathString", "type": "string" } ], "name": "AddNewContract", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" }, { "name": "MainContentHash", "type": "string" } ], "name": "RemoveHostingContract", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" }, { "name": "HostingContractExtensionDuration", "type": "uint32" } ], "name": "ExtendContract", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [], "name": "ScrubHostingContracts", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "GetUserAccountName", "outputs": [ { "name": "value", "type": "string", "value": "" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "GetUserAccountActiveContractCount", "outputs": [ { "name": "value", "type": "uint32", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "GetUserAccountTotalContractCount", "outputs": [ { "name": "value", "type": "uint32", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "UserAddress", "type": "address" }, { "name": "ArrayKey", "type": "uint256" } ], "name": "GetHostingContractAddress", "outputs": [ { "name": "value", "type": "address", "value": "0x" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "CheckAccountExistence", "outputs": [ { "name": "", "type": "bool", "value": false } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetMainContentHash", "outputs": [ { "name": "MainContentHash", "type": "string", "value": "" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetContentHashString", "outputs": [ { "name": "ContentHashString", "type": "string", "value": "" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetContentPathString", "outputs": [ { "name": "ContentPathString", "type": "string", "value": "" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetHostingContractDeployedBlockHeight", "outputs": [ { "name": "value", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetHostingContractExpirationBlockHeight", "outputs": [ { "name": "value", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetHostingContractStorageUsed", "outputs": [ { "name": "value", "type": "uint32", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetHostingContractName", "outputs": [ { "name": "value", "type": "string", "value": "" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "newOperator", "type": "address" } ], "name": "changeOperator", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "set", "type": "address" } ], "name": "SetAccountCollectionAddress", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" }, { "name": "AccountName", "type": "string" } ], "name": "AddNewUser", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "RemoveUser", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "newContractAddress", "type": "address" }, { "name": "UserAddress", "type": "address" }, { "name": "HostingContractName", "type": "string" }, { "name": "HostingContractDuration", "type": "uint32" }, { "name": "TotalContractSize", "type": "uint32" } ], "name": "AddHostingContract", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" }, { "name": "HostingContractAddress", "type": "address" } ], "name": "RemoveHostingContract1", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "GetUserAccountAddress", "outputs": [ { "name": "value", "type": "address" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "GetUserAccountName", "outputs": [ { "name": "value", "type": "string" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "GetUserAccountActiveContractCount", "outputs": [ { "name": "value", "type": "uint32" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "GetUserAccountTotalContractCount", "outputs": [ { "name": "value", "type": "uint32" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" }, { "name": "ArrayKey", "type": "uint256" } ], "name": "GetHostingContractAddress", "outputs": [ { "name": "value", "type": "address" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "CheckAccountExistence", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "ScrubContractList", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "set", "type": "uint256" } ], "name": "SetHostingContractCost", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" }, { "name": "HostingContractExtensionDuration", "type": "uint32" } ], "name": "ExtendHostingContract", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetMainContentHash", "outputs": [ { "name": "MainContentHash", "type": "string" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetContentHashString", "outputs": [ { "name": "ContentHashString", "type": "string" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetContentPathString", "outputs": [ { "name": "ContentPathString", "type": "string" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetHostingContractDeployedBlockHeight", "outputs": [ { "name": "value", "type": "uint256" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetHostingContractExpirationBlockHeight", "outputs": [ { "name": "value", "type": "uint256" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetHostingContractStorageUsed", "outputs": [ { "name": "value", "type": "uint32" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetHostingContractName", "outputs": [ { "name": "value", "type": "string" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "MainContentHash", "type": "string" }, { "name": "HostingContractName", "type": "string" }, { "name": "HostingContractDuration", "type": "uint32" }, { "name": "TotalContractSize", "type": "uint32" }, { "name": "ContentHashString", "type": "string" }, { "name": "ContentPathString", "type": "string" } ], "name": "AddHostingContract", "outputs": [ { "name": "value", "type": "address" } ], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [ { "name": "CustomerAddress", "type": "address" }, { "name": "HostingContractAddress", "type": "address" }, { "name": "AccountCollectionAddress", "type": "address" } ], "name": "RemoveHostingContract2", "outputs": [ { "name": "value", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "AccountCollectionAddress", "type": "address" } ], "name": "SetAccountCollectionAddress", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" } ]');
/*END OF CONTRACT SETUP*/
const $miningMessage = document.querySelector('.mining-message')

/*START OF MISC GLOBAL VARIABLES*/
var privateKeyLogin = false;
var GlobalPrivateKey;
var minimumContractCost = 10000000000000000;

var GlobalUploadName = "";
var GlobalUserAddress = "";
var GlobalHostingCost = 1.0;
var GlobalHostingCostWei = GlobalHostingCost * 1000000000000000000;
var GlobalUploadSize = 0;
var GlobalHashArray = new Array();
var GlobalSizeArray = new Array();
var GlobalPathArray = new Array();
var GlobalMainHashArray = new Array();
var GlobalMainPathArray = new Array();
var GlobalMainContentHash = "";
var GlobalUploadHash = "";
var GlobalUploadPath = "";
var GlobalContractDuration = "";
var GlobalHostingContractArray = new Array();
var GlobalTotalContractCount = 0;
var GlobalHostingContractDetailArray = new Array();
var GlobalExtensionDuration;
/*END OF MISC GLOBAL VARIABLES*/


fetch('https://api.coinmarketcap.com/v2/ticker/3452/').then(response => {
    return response.json();
}).then(data => {
    var ethoPriceUSD = data.data.quotes.USD.price;
    document.getElementById("ethoprice").textContent = round(ethoPriceUSD, 4);
}).catch(err => {});

if (typeof web3 == 'undefined') {
    var web3 = new Web3()
    web3.setProvider(new Web3.providers.HttpProvider('https://rpc.ether1.org'))
    $('#ethofsLoginModal').modal('show');
} else {
    ethofsLogin("");
}


function ethofsLogin(privateKey) {
    $('#ethofsLoginModal').modal('hide');
    $('#ethofsRegistrationModal').modal('hide');
    //CREATE ETHER-1 CHAIN CONNECTION AND LOOK FOR EXISTING USER ACCOUNT
    if (privateKey != "") {
        GlobalPrivateKey = privateKey;
        privateKeyLogin = true;
        web3.eth.net.isListening()
            .then(function() {
                console.log('ethoFS is connected')
                let account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
                console.log(account);
                web3.eth.accounts.wallet.add(account)
                web3.eth.defaultAccount = account.address;
                startEthofs()
            })
    } else {
        privateKeyLogin = false;
        window.web3 = new Web3(window.web3.currentProvider);
        web3.eth.getAccounts(function(err, accounts) {
            if (err != null) {
                console.error("An error occurred: " + err);
                outputNoAddressContractTable();
            } else if (accounts.length == 0) {
                $('#ethofsLoginModal').modal('show');
                console.log("User is not logged in");
                document.getElementById("welcome-name").textContent = "Access to Ether-1 Blockchain Not Found - Make Sure You Are Using Metamask or The Ether-1 Browser Extension";
                document.getElementById("accountaddress").textContent = "Address Not Found";
                outputNoAddressContractTable();
            } else {
                console.log("User is logged in");
                web3.eth.defaultAccount = accounts[0];
                startEthofs();
            }
        });
    }
}

function startEthofs() {
    console.log("Starting ethoFS");
    GlobalUserAddress = web3.eth.defaultAccount;
    var ethoFSAccounts = new web3.eth.Contract(GlobalControllerABI, GlobalControllerContractAddress);
    ethoFSAccounts.methods.CheckAccountExistence(GlobalUserAddress).call(function(error, result) {
        if (!error) {
            if (result) {
                document.getElementById("accountaddress").textContent = web3.eth.defaultAccount;
                ethoFSAccounts.methods.GetUserAccountName(GlobalUserAddress).call(function(error, result) {
                    if (!error) {
                        if (result) {
                            getBlockHeight(web3);
                            getBalance(web3);
                            document.getElementById("welcome-name").textContent = "Welcome Back " + result;
                            updateContractTable();
                            window.startApplication();
                        }
                    } else {
                        console.log("Error getting user account name");
                    }
                });
            } else {
                document.getElementById("welcome-name").textContent = "User Not Found";
                document.getElementById("accountaddress").textContent = "Address Not Found";
                console.log("User Not Found");
                $('#ethofsRegistrationModal').modal('show');
            }
        } else {
            document.getElementById("welcome-name").textContent = "Access to Ether-1 Blockchain Not Found - Make Sure You Are Using Metamask or The Ether-1 Browser Extension";
            document.getElementById("accountaddress").textContent = "Address Not Found";
            console.log("Blockchain Access Error");
        }
    });
}

/*************************************************************************************************************/
function AddNewUser(userName) {
    console.log("Initiating New User Addition... " + userName);
    var controller = new web3.eth.Contract(GlobalControllerABI, GlobalControllerContractAddress);

    if (privateKeyLogin == true) {
        const tx = {
            to: GlobalControllerContractAddress,
            from: GlobalUserAddress,
            gas: 4000000,
            data: controller.methods.AddNewUserPublic(userName).encodeABI()
        };
        var privateKey = '0x' + GlobalPrivateKey;
        web3.eth.accounts.signTransaction(tx, privateKey)
            .then(function(signedTransactionData) {
                web3.eth.sendSignedTransaction(signedTransactionData.rawTransaction, function(error, result) {
                    if (!error) {
                        if (result) {
                            $('#minedBlockTrackerModal').modal('show');
                            waitForReceipt(result, function(receipt) {
                                console.log("Transaction Has Been Mined: " + receipt);
                                $('#minedBlockTrackerModal').modal('hide');
                                ethofsLogin(GlobalPrivateKey);
                            });
                        } else {
                            console.log("There was a problem adding new contract");
                        }
                    } else {
                        console.error(error);
                    }
                });
            });
    } else {
        controller.methods.AddNewUserPublic(userName).send(function(error, result) {
            if (!error) {
                if (result) {
                    document.getElementById("wait").innerHTML = 'Waiting For Add User Confirmation.';
                    $('#minedBlockTrackerModal').modal('show');
                    waitForReceipt(result, function(receipt) {
                        console.log("Transaction Has Been Mined: " + receipt);
                        $('#minedBlockTrackerModal').modal('hide');
                        ethofsLogin("");
                    });
                } else {
                    console.log("There was a problem adding new user");
                    $('#ethofsLoginModal').modal('show');
                }
            } else {
                console.error(error);
                $('#ethofsLoginModal').modal('show');
            }
        });
    }
}
/*************************************************************************************************************/
function getBlockHeight(web3) {
    console.log("Starting Block Height Detection..");
    web3.eth.getBlockNumber(function(err, data) {
        document.getElementById("blocknumber").textContent = data;
        console.log("ETHO Block Number: " + data);
    });
}
/*************************************************************************************************************/
function getBalance(web3) {
    console.log("Starting Balance Detection..");
    web3.eth.getBalance(web3.eth.defaultAccount, function(err, data) {
        var balance = "ETHO Balance: " + Number(web3.utils.fromWei(data, "ether")).toFixed(2);
        document.getElementById("ethobalance").textContent = balance;
        console.log("ETHO Balance: " + data);
    });
}
/*************************************************************************************************************/
//CALCULATE AMOUNT TO BE SENT
function calculateCost(contractSize, contractDuration, hostingCost) {
    var cost = ((((contractSize / 1048576) * hostingCost) * (contractDuration / 46522)));
    if (cost < minimumContractCost) {
        cost = minimumContractCost;
    }
    return cost;
}
/*************************************************************************************************************/
//CHECK FOR TX - BLOCK TO BE MINED
function waitForReceipt(hash, cb) {
    web3.eth.getTransactionReceipt(hash, function(err, receipt) {
        document.getElementById("mining-status-message").textContent = "In Progress";
        $miningMessage.innerText = "Waiting For Transaction Confirmation";
        web3.eth.getBlock('latest', function(e, res) {
            if (!e) {
                document.getElementById("block-height").textContent = res.number;
            }
        });
        if (err) {
            error(err);
            $miningMessage.innerText = "Error Conneting To Ether-1 Network";
        }
        if (receipt !== null) {
            $miningMessage.innerText = "Transaction Confirmed";
            document.getElementById("mining-status-message").textContent = "Complete";
            if (cb) {
                cb(receipt);
            }
        } else {
            window.setTimeout(function() {
                waitForReceipt(hash, cb);
            }, 10000);
        }
    });
}
/*************************************************************************************************************/
//CREATE ETHER-1 CHAIN CONNECTION AND REMOVE CONTRACT
function RemoveContract(hostingAddress, contentHash) {
    var pinRemoving = new web3.eth.Contract(GlobalControllerABI, GlobalControllerContractAddress);
    if (privateKeyLogin == true) {
        const tx = {
            to: GlobalControllerContractAddress,
            from: GlobalUserAddress,
            gas: 4000000,
            data: pinRemoving.methods.RemoveHostingContract(hostingAddress, contentHash).encodeABI()
        };
        var privateKey = '0x' + GlobalPrivateKey;
        console.log("Private Key: " + privateKey);
        web3.eth.accounts.signTransaction(tx, privateKey)
            .then(function(signedTransactionData) {
                console.log("Signed TX Data: " + signedTransactionData.rawTransaction);
                web3.eth.sendSignedTransaction(signedTransactionData.rawTransaction, function(error, result) {
                    if (!error) {
                        if (result) {
                            $('#minedBlockTrackerModal').modal('show');
                            waitForReceipt(result, function(receipt) {
                                console.log("Transaction Has Been Mined: " + receipt);
                                $('#minedBlockTrackerModal').modal('hide');
                                updateContractTable();
                            });
                        } else {
                            console.log("There was a problem adding new contract");
                        }
                    } else {
                        console.error(error);
                    }
                });
            });
    } else {
        const tx = {
            to: GlobalControllerContractAddress,
            from: GlobalUserAddress,
        };
        pinRemoving.methods.RemoveHostingContract(hostingAddress, contentHash).send(tx, function(error, result) {
            if (!error) {
                if (result) {
                    $('#minedBlockTrackerModal').modal('show');
                    waitForReceipt(result, function(receipt) {
                        console.log("Transaction Has Been Mined: " + receipt);
                        $('#minedBlockTrackerModal').modal('hide');
                        updateContractTable();
                    });
                } else {
                    console.log("There was a problem removing contract");
                }
            } else {
                console.error(error);
            }
        });
    }
}

function updateContractTable() {
    /*************************************************************************************************************/
    //CREATE ETHER-1 CHAIN CONNECTION AND GET USER ACCOUNT & CONTRACTS
    var ethoFSHostingContracts = new Array();
    var hostingContracts = "";
    var TotalContractCount = 0;
    var blockHeight = 0;
    web3.eth.getBlockNumber(function(error, result) {
        if (!error) {
            blockHeight = result;
        } else
            console.error(error);
    });
    var ethoFSAccounts = new web3.eth.Contract(GlobalControllerABI, GlobalControllerContractAddress);
    ethoFSAccounts.methods.GetUserAccountTotalContractCount(web3.eth.defaultAccount).call(function(error, result) {
        TotalContractCount = result;
        GlobalTotalContractCount = result;
        const getContractData = async (ethoFSAccounts, account, TotalContractCount) => {
            if (TotalContractCount == 0) {
                outputNoAddressContractTableWithButton();
            }
            for (i = 0; i < TotalContractCount; i++) {
                const promisify = (inner) =>
                    new Promise((resolve, reject) =>
                        inner((err, res) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(res);
                            }
                        })
                    );
                counter = i;
                GlobalHostingContractArray[counter] = new Array();
                ethoFSHostingContractAddress = promisify(cb => ethoFSAccounts.methods.GetHostingContractAddress(account, counter).call(cb));
                await Promise.all([getAdditionalContractData(await ethoFSHostingContractAddress, counter, ethoFSAccounts)]);

                async function getAdditionalContractData(ethoFSHostingContractAddress, counter, ethoFSAccounts) {
                    const promisify = (inner) =>
                        new Promise((resolve, reject) =>
                            inner((err, res) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(res);
                                }
                            })
                        );
                    ethoFSHostingContractCost = counter;
                    ethoFSHostingContractName = promisify(cb => ethoFSAccounts.methods.GetHostingContractName(ethoFSHostingContractAddress).call(cb));
                    ethoFSHostingContractMainHash = promisify(cb => ethoFSAccounts.methods.GetMainContentHash(ethoFSHostingContractAddress).call(cb));
                    ethoFSHostingContractHashString = promisify(cb => ethoFSAccounts.methods.GetContentHashString(ethoFSHostingContractAddress).call(cb));
                    ethoFSHostingContractPathString = promisify(cb => ethoFSAccounts.methods.GetContentPathString(ethoFSHostingContractAddress).call(cb));

                    ethoFSHostingContractStorage = promisify(cb => ethoFSAccounts.methods.GetHostingContractStorageUsed(ethoFSHostingContractAddress).call(cb));
                    ethoFSHostingContractStartBlock = promisify(cb => ethoFSAccounts.methods.GetHostingContractDeployedBlockHeight(ethoFSHostingContractAddress).call(cb));
                    ethoFSHostingContractEndBlock = promisify(cb => ethoFSAccounts.methods.GetHostingContractExpirationBlockHeight(ethoFSHostingContractAddress).call(cb));

                    GlobalHostingContractArray[counter]['address'] = await ethoFSHostingContractAddress;
                    GlobalHostingContractArray[counter]['name'] = await ethoFSHostingContractName;
                    GlobalHostingContractArray[counter]['mainhash'] = await ethoFSHostingContractMainHash;
                    GlobalHostingContractArray[counter]['hashstring'] = await ethoFSHostingContractHashString;
                    GlobalHostingContractArray[counter]['pathstring'] = await ethoFSHostingContractPathString;
                    GlobalHostingContractArray[counter]['storage'] = await ethoFSHostingContractStorage;
                    GlobalHostingContractArray[counter]['startblock'] = await ethoFSHostingContractStartBlock;
                    GlobalHostingContractArray[counter]['endblock'] = await ethoFSHostingContractEndBlock;

                    GlobalHostingContractArray[counter]['hash'] = new Array();
                    GlobalHostingContractArray[counter]['path'] = new Array();

                    ContractHashArray = new Array();
                    ContractPathArray = new Array();
                    var splitHashArray = await Promise.all([splitString(await ethoFSHostingContractHashString, ":")]);
                    var splitPathArray = await Promise.all([splitString(await ethoFSHostingContractPathString, ":")]);

                    function splitString(stringToSplit, splitDelimeter) {
                        return stringToSplit.split(splitDelimeter);
                    }
                    await Promise.all([loopSplitStrings(await splitHashArray[0], await splitPathArray[0], counter)]);

                    function loopSplitStrings(splitHashArray, splitPathArray, counter) {
                        for (j = 1; j < splitHashArray.length; j++) {
                            GlobalHostingContractArray[counter]['hash'][j] = splitHashArray[j];
                            GlobalHostingContractArray[counter]['path'][j] = splitPathArray[j];
                        }
                    }

                    await Promise.all([addNewTableEntry(await ethoFSHostingContractAddress, await ethoFSHostingContractMainHash, await ethoFSHostingContractName, await ethoFSHostingContractAddress, await ethoFSHostingContractStorage, await ethoFSHostingContractStartBlock, await ethoFSHostingContractEndBlock, await ethoFSHostingContractCost, await counter, await blockHeight)]);
                }
            }
            //END GET ADDITIONAL CONTACT DATA
        };
        getContractData(ethoFSAccounts, web3.eth.defaultAccount, TotalContractCount);

        function addNewTableEntry(ethoFSHostingContractAddress, ethoFSHostingContractMainHash, ethoFSHostingContractName, ethoFSHostingContractHash, ethoFSHostingContractStorage, ethoFSHostingContractStartBlock, ethoFSHostingContractEndBlock, ethoFSHostingContractCost, counter, blockHeight) {
            if (blockHeight > ethoFSHostingContractEndBlock) {
                ethoFSHostingContractStatus = "Expired";
                hostingContracts += '<tr class="tr-shadow" style="display: none;"><td>' + ethoFSHostingContractName + '</td><td><span class="block-email"><a href="#" onclick="showHostingContractDetails(' + counter + ');">' + ethoFSHostingContractHash + '</a></span></td><td class="desc">' + ethoFSHostingContractStartBlock + '</td><td>' + ethoFSHostingContractEndBlock + '</td><td><span class="status--process"><font color="red">' + ethoFSHostingContractStatus + '</font></span></td><td><div class="table-data-feature"><button class="item" data-toggle="tooltip" data-placement="top" title="Delete" onclick="RemoveContract(\'' + ethoFSHostingContractAddress + '\',\'' + ethoFSHostingContractMainHash + '\');"><i class="zmdi zmdi-delete"></i></button><button class="item" data-toggle="tooltip" data-placement="top" title="More" onclick="showHostingContractDetails(' + counter + ');"><i class="zmdi zmdi-more"></i></button></div></td></tr>';
            } else {
                ethoFSHostingContractStatus = "Active";
                hostingContracts += '<tr class="tr-shadow"><td>' + ethoFSHostingContractName + '</td><td><span class="block-email"><a href="#" onclick="showHostingContractDetails(' + counter + ');">' + ethoFSHostingContractHash + '</a></span></td><td class="desc">' + ethoFSHostingContractStartBlock + '</td><td>' + ethoFSHostingContractEndBlock + '</td><td><span class="status--process">' + ethoFSHostingContractStatus + '</span></td><td><div class="table-data-feature"><button class="item" data-toggle="tooltip" data-placement="top" title="Delete" onclick="RemoveContract(\'' + ethoFSHostingContractAddress + '\',\'' + ethoFSHostingContractMainHash + '\');"><i class="zmdi zmdi-delete"></i></button><button class="item" data-toggle="tooltip" data-placement="top" title="More" onclick="showHostingContractDetails(' + counter + ');"><i class="zmdi zmdi-more"></i></button></div></td></tr>';
            }
            GlobalHostingContractArray[counter]['status'] = ethoFSHostingContractStatus;
            document.getElementById("hostingcontractstablebody").innerHTML = hostingContracts;
        }
    });
}
/*************************************************************************************************************/
//UPDATE CONTRACT DURATION AND CONTRACT COST
function contractDurationChange(selectObj) {
    var duration = document.getElementById('contract-duration').value;
    GlobalContractDuration = duration;
    var ContractCost = (((GlobalUploadSize / 1048576) * GlobalHostingCost) * (duration / 46522));
    document.getElementById("contract-cost").innerHTML = round(ContractCost, 2);
    return false;
}
/*************************************************************************************************************/
//MISC ROUNDING FUNCTION
function round(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}
/*************************************************************************************************************/
function finishUploadModal() {
    $('#uploadTrackerModal').modal('hide');
    window.stopApplication();
    resetUploadSystem();
    updateContractTable();
    return false;
}

function resetUploadModal() {
    window.stopApplication();
    resetUploadSystem();
    updateContractTable();
    return false;
}
/*************************************************************************************************************/
//CHECK FOR PROPAGATED & AVAILABLE DATA ON NETWORK - FINAL VERIFICATION FOR UPLOADED CONTENT
function checkForUploadedContentAvailability(HostingContractName) {
    document.getElementById("upload-check-button").style.visibility = "hidden";
    $('#uploadTrackerModal').modal('show');
    document.getElementById("upload-hash").innerHTML = HostingContractName;
    return false;
}
/*************************************************************************************************************/
/*************************************************************************************************************/
function resetUploadSystem() {
    GlobalMainHashArray = new Array();
    GlobalMainPathArray = new Array();
    GlobalHashArray = new Array();
    GlobalPathArray = new Array();
    GlobalUploadHash = "";
    GlobalUploadPath = "";
    GlobalUploadSize = 0;
    var TableBody = document.getElementById("file-history-body");
    TableBody.innerHTML = '<tr class="empty-row"><td colspan="4">There are no files awaiting upload</td></tr>';
    var duration = document.getElementById('contract-duration').value;
    GlobalContractDuration = duration;
    var ContractCost = ((GlobalUploadSize / 1048576) * GlobalHostingCost) * (duration / 46522);
    document.getElementById("contract-cost").innerHTML = round(ContractCost, 2);
    document.getElementById("upload-hash").innerHTML = "";
    document.getElementById("upload-size").innerHTML = 0;
    return false;
}
/*************************************************************************************************************/
/*************************************************************************************************************/
//CHECK FOR PROPAGATED & AVAILABLE DATA ON NETWORK - FINAL VERIFICATION FOR UPLOADED CONTENT
function sortContractTable() {
    var hostingContracts = "";
    var i;
    var localContractArray = GlobalHostingContractArray;
    var tableSortDirection = "";
    var sortSelection = document.getElementById('sort-contracts');
    var tableSorter = sortSelection.value;
    var filterSelection = document.getElementById('filter-contracts');
    var tableFilterer = filterSelection.value;

    if (tableSorter == "Ascending") {
        tableSortDirection = "asc";
    } else {
        tableSortDirection = "desc";
    }
    localContractArray = multiSort(localContractArray, {
        startblock: tableSortDirection
    });
    var filterCounter = 0;
    for (i = 0; i < GlobalTotalContractCount; i++) {
        if ((localContractArray[i]['status'] != "Expired" && tableFilterer == "Active Contracts") || (localContractArray[i]['status'] != "Active" && tableFilterer == "Expired Contracts") || tableFilterer == "All Contracts") {
            addNewTableEntry(localContractArray[i]['address'], localContractArray[i]['name'], localContractArray[i]['hash'], localContractArray[i]['storage'], localContractArray[i]['startblock'], localContractArray[i]['endblock'], localContractArray[i]['status'], localContractArray[i]['cost'], i);
            filterCounter++;
        } else {
            document.getElementById("hostingcontractstablebody").innerHTML = hostingContracts;
        }
    }
    if (GlobalTotalContractCount == 0 || filterCounter == 0) {
        hostingContracts = '<tr class="tr-shadow"><td>No Hosting Contracts Found</td><td><span class="block-email"></span></td><td class="desc"></td><td></td><td><span class="status--process"></span></td><td><div class="table-data-feature"></div></td></tr>';
        document.getElementById("hostingcontractstablebody").innerHTML = hostingContracts;

    }

    function addNewTableEntry(ethoFSHostingContractAddress, ethoFSHostingContractName, ethoFSHostingContractHash, ethoFSHostingContractStorage, ethoFSHostingContractStartBlock, ethoFSHostingContractEndBlock, ethoFSHostingContractStatus, ethoFSHostingContractCost, counter) {
        if (ethoFSHostingContractStatus == "Active") {
            hostingContracts += '<tr class="tr-shadow"><td>' + ethoFSHostingContractName + '</td><td><span class="block-email"><a href="#" onclick="showHostingContractDetails(' + counter + ');">' + ethoFSHostingContractHash + '</a></span></td><td class="desc">' + ethoFSHostingContractStartBlock + '</td><td>' + ethoFSHostingContractEndBlock + '</td><td><span class="status--process">' + ethoFSHostingContractStatus + '</span></td><td><div class="table-data-feature"><button class="item" data-toggle="tooltip" data-placement="top" title="Delete" onclick="RemoveContract(\'' + ethoFSHostingContractAddress + '\',\'' + ethoFSHostingContractHash + '\');"><i class="zmdi zmdi-delete"></i></button><button class="item" data-toggle="tooltip" data-placement="top" title="More" onclick="showHostingContractDetails(' + counter + ');"><i class="zmdi zmdi-more"></i></button></div></td></tr>';
        } else {
            hostingContracts += '<tr class="tr-shadow"><td>' + ethoFSHostingContractName + '</td><td><span class="block-email"><a href="#" onclick="showHostingContractDetails(' + counter + ');">' + ethoFSHostingContractHash + '</a></span></td><td class="desc">' + ethoFSHostingContractStartBlock + '</td><td>' + ethoFSHostingContractEndBlock + '</td><td><span class="status--process"><font color="red">' + ethoFSHostingContractStatus + '</font></span></td><td><div class="table-data-feature"><button class="item" data-toggle="tooltip" data-placement="top" title="Delete" onclick="RemoveContract(\'' + ethoFSHostingContractAddress + '\',\'' + ethoFSHostingContractHash + '\');"><i class="zmdi zmdi-delete"></i></button><button class="item" data-toggle="tooltip" data-placement="top" title="More" onclick="showHostingContractDetails(' + counter + ');"><i class="zmdi zmdi-more"></i></button></div></td></tr>';
        }
        document.getElementById("hostingcontractstablebody").innerHTML = hostingContracts;
    }

    function multiSort(array, sortObject = {}) {
        const sortKeys = Object.keys(sortObject);
        // Return array if no sort object is supplied.
        if (!sortKeys.length) {
            return array;
        }
        // Change the values of the sortObject keys to -1, 0, or 1.
        for (let key in sortObject) {
            sortObject[key] = sortObject[key] === 'desc' || sortObject[key] === -1 ? -1 :
                (sortObject[key] === 'skip' || sortObject[key] === 0 ? 0 : 1);
        }
        const keySort = (a, b, direction) => {
            direction = direction !== null ? direction : 1;
            if (a === b) { // If the values are the same, do not switch positions.
                return 0;
            }
            // If b > a, multiply by -1 to get the reverse direction.
            return a > b ? direction : -1 * direction;
        };
        return array.sort((a, b) => {
            let sorted = 0;
            let index = 0;
            // Loop until sorted (-1 or 1) or until the sort keys have been processed.
            while (sorted === 0 && index < sortKeys.length) {
                const key = sortKeys[index];
                if (key) {
                    const direction = sortObject[key];
                    sorted = keySort(a[key], b[key], direction);
                    index++;
                }
            }
            return sorted;
        });
    }
}
/*************************************************************************************************************/
//SHOW MODAL WITH HOSTING CONTRACT DETAILS
function showHostingContractDetails(counter) {
    resetContractExtensionChange();

    GlobalHostingContractDetailArray = GlobalHostingContractArray[counter];
    $('#contractDetailModal').modal('show');
    document.getElementById("contract-detail-name").innerHTML = GlobalHostingContractDetailArray['name'];
    var hashOutputString = "";
    var hostingContractEntry = "";
    for (i = 1; GlobalHostingContractDetailArray['hash'].length > i; i++) {
        addNewTableEntry(GlobalHostingContractDetailArray['hash'][i], GlobalHostingContractDetailArray['path'][i], i);
    }
    document.getElementById("contract-detail-startblock").innerHTML = GlobalHostingContractDetailArray['startblock'];
    document.getElementById("contract-detail-endblock").innerHTML = GlobalHostingContractDetailArray['endblock'];
    document.getElementById("contract-detail-status").innerHTML = GlobalHostingContractDetailArray['status'];
    document.getElementById("contract-detail-size").innerHTML = (GlobalHostingContractDetailArray['storage'] / 1048576);

    function addNewTableEntry(ethoFSHostingContractHash, ethoFSHostingContractPath, count) {
        var table = document.getElementById("contract-detail-table");
        var row = table.insertRow(count + 10);
        var cell1 = row.insertCell(0);
        //var cell2 = row.insertCell(1);
        //cell1.innerHTML = ethoFSHostingContractPath;
        cell1.innerHTML = '<a  href="http://data.ethofs.com/ipfs/' + ethoFSHostingContractHash + '" target="_blank" style="word-break: break-word">' + ethoFSHostingContractHash + '</a>';
    }

}

function resetContractDetailTableRows() {
    var x = document.getElementById("contract-detail-table").rows.length;
    for (var y = (x - 1); y > 10; y--) {
        document.getElementById("contract-detail-table").deleteRow(y);
    }
}
/*************************************************************************************************************/
//LOCK CONTRACT TABLE DOWN - NO USER ACCOUNT
function outputNoAddressContractTable() {
    hostingContracts = '<tr class="tr-shadow"><td>No Hosting Contracts Found</td><td><span class="block-email"></span></td><td class="desc"></td><td></td><td><span class="status--process"></span></td><td><div class="table-data-feature"></div></td></tr>';
    document.getElementById("hostingcontractstablebody").innerHTML = hostingContracts;
}
//LOCK CONTRACT TABLE DOWN - NO USER ACCOUNT
function outputNoAddressContractTableWithButton() {
    hostingContracts = '<tr class="tr-shadow"><td>No Hosting Contracts Found</td><td><span class="block-email"></span></td><td class="desc"></td><td></td><td><span class="status--process"></span></td><td><div class="table-data-feature"></div></td></tr>';
    document.getElementById("hostingcontractstablebody").innerHTML = hostingContracts;
}
/*************************************************************************************************************/
function resetContractExtensionChange() {
    GlobalExtensionDuration = 0;
    document.getElementById("contract-extension-cost").innerHTML = 0;
    document.getElementById("extend-contract").selectedIndex = "0";
}
/*************************************************************************************************************/
//CONTRACT EXTENSION VALUE CHANGE
function contractExtensionChange(selectObj) {
    var index = selectObj.selectedIndex;
    var extensionDuration = selectObj.options[index].value;
    GlobalExtensionDuration = extensionDuration;
    document.getElementById("contract-extension-button").style.visibility = "visible";
    var extensionCost = ((GlobalHostingContractDetailArray['storage'] / 1048576) * GlobalHostingCost) * (extensionDuration / 46522);
    document.getElementById("contract-extension-cost").innerHTML = round(extensionCost, 2);
}
/*************************************************************************************************************/
//CONTRACT EXTENSION CONFIRM
function contractExtensionConfirmation() {
    if (GlobalExtensionDuration > 0) {
        var extensionDuration = GlobalExtensionDuration;
        var ethoFSController = new web3.eth.Contract(GlobalControllerABI, GlobalControllerContractAddress);

        var extensionCost = calculateCost(GlobalHostingContractDetailArray['storage'], extensionDuration, GlobalHostingCostWei);
        const transactionObject = {
            from: GlobalUserAddress,
            value: extensionCost
        };
        if (privateKeyLogin == true) {
            const tx = {
                to: GlobalControllerContractAddress,
                from: GlobalUserAddress,
                value: extensionCost,
                gas: 4000000,
                data: ethoFSController.methods.ExtendContract(GlobalHostingContractDetailArray['address'], extensionDuration).encodeABI()
            };
            var privateKey = '0x' + GlobalPrivateKey;
            console.log("Private Key: " + privateKey);
            web3.eth.accounts.signTransaction(tx, privateKey)
                .then(function(signedTransactionData) {
                    console.log("Signed TX Data: " + signedTransactionData.rawTransaction);
                    web3.eth.sendSignedTransaction(signedTransactionData.rawTransaction, function(error, result) {
                        if (!error) {
                            if (result) {
                                $('#contractDetailModal').modal('hide');
                                $('#minedBlockTrackerModal').modal('show');
                                waitForReceipt(result, function(receipt) {
                                    console.log("Transaction Has Been Mined: " + receipt);
                                    $('#minedBlockTrackerModal').modal('hide');
                                    updateContractTable();
                                });
                            } else {
                                console.log("There was a problem adding new contract");
                            }
                        } else {
                            console.error(error);
                        }
                    });
                });
        } else {

            ethoFSController.methods.ExtendContract(GlobalHostingContractDetailArray['address'], extensionDuration).send(transactionObject, function(error, result) {
                if (!error) {
                    if (result) {
                        $('#contractDetailModal').modal('hide');
                        $('#minedBlockTrackerModal').modal('show');
                        waitForReceipt(result, function(receipt) {
                            console.log("Transaction Has Been Mined: " + receipt);
                            $('#minedBlockTrackerModal').modal('hide');
                            updateContractTable();
                        });
                    }
                } else {
                    console.log(error);
                }
            });
        }
    }
}
/*************************************************************************************************************/
