const {
  ipcRenderer
} = require("electron");
const privateKeyToAddress = require('ethereum-private-key-to-address');
const os = require("os");
const path = require("path");
const Buf = require('buffer').Buffer;
const Common = require('ethereumjs-common');
const fetch = require("node-fetch");
const fs = require("fs");
const fileReaderPullStream = require('pull-file-reader')
const request = require('request');
const keythereum = require("keythereum");

// Node
var $ethomessage;
var $nodeId;
var $uploadMessage;
var $logs;
// Files
var $fetchButton;
var $dragContainer;
var $progressBar;
var $fileHistory;
// Misc
var $allDisabledButtons;
var $allDisabledInputs;
var $allDisabledElements;

var web3;
let MainFileArray = [];
const FILES = []
var usedStorageArray = new Array();
var availableStorageArray = new Array();
var nodeCountArray = new Array();
var PeersForChannel = new Array();
let uploadCount = 0;
let fileSize = 0
let addr
let messageFlag = 0;
let messageString = "";
let healthMessage = "";
let averageAvailableStorageTotal = 0;
var switchFlag = null;

/*SET CONTRACTS UP HERE*/
var GlobalChannelString = "ethoFSPinningChannel_alpha11";
var GlobalControllerContractAddress = "0xc38B47169950D8A28bC77a6Fa7467464f25ADAFc";
var GlobalControllerABI = JSON.parse('[ { "constant": true, "inputs": [], "name": "last_completed_migration", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "name": "", "type": "address", "value": "0x" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "constant": false, "inputs": [ { "name": "completed", "type": "uint256" } ], "name": "setCompleted", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "new_address", "type": "address" } ], "name": "upgrade", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "pinToAdd", "type": "string" }, { "name": "pinSize", "type": "uint32" } ], "name": "PinAdd", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "pin", "type": "string" } ], "name": "PinRemove", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "constant": false, "inputs": [], "name": "deleteContract", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "set", "type": "address" } ], "name": "SetAccountCollectionAddress", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "hostingCost", "type": "uint256" } ], "name": "SetHostingCost", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "pinStorageAddress", "type": "address" } ], "name": "SetPinStorageAddress", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "ethoFSDashboardAddress", "type": "address" } ], "name": "SetEthoFSDashboardAddress", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "ethoFSHostingContractsAddress", "type": "address" } ], "name": "SetEthoFSHostingContractsAddress", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" }, { "name": "AccountName", "type": "string" } ], "name": "AddNewUserOwner", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "AccountName", "type": "string" } ], "name": "AddNewUserPublic", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "RemoveUserOwner", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "RemoveUserPublic", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "MainContentHash", "type": "string" }, { "name": "HostingContractName", "type": "string" }, { "name": "HostingContractDuration", "type": "uint32" }, { "name": "TotalContractSize", "type": "uint32" }, { "name": "pinSize", "type": "uint32" }, { "name": "ContentHashString", "type": "string" }, { "name": "ContentPathString", "type": "string" } ], "name": "AddNewContract", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" }, { "name": "MainContentHash", "type": "string" } ], "name": "RemoveHostingContract", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" }, { "name": "HostingContractExtensionDuration", "type": "uint32" } ], "name": "ExtendContract", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [], "name": "ScrubHostingContracts", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "GetUserAccountName", "outputs": [ { "name": "value", "type": "string", "value": "" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "GetUserAccountActiveContractCount", "outputs": [ { "name": "value", "type": "uint32", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "GetUserAccountTotalContractCount", "outputs": [ { "name": "value", "type": "uint32", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "UserAddress", "type": "address" }, { "name": "ArrayKey", "type": "uint256" } ], "name": "GetHostingContractAddress", "outputs": [ { "name": "value", "type": "address", "value": "0x" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "CheckAccountExistence", "outputs": [ { "name": "", "type": "bool", "value": false } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetMainContentHash", "outputs": [ { "name": "MainContentHash", "type": "string", "value": "" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetContentHashString", "outputs": [ { "name": "ContentHashString", "type": "string", "value": "" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetContentPathString", "outputs": [ { "name": "ContentPathString", "type": "string", "value": "" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetHostingContractDeployedBlockHeight", "outputs": [ { "name": "value", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetHostingContractExpirationBlockHeight", "outputs": [ { "name": "value", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetHostingContractStorageUsed", "outputs": [ { "name": "value", "type": "uint32", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetHostingContractName", "outputs": [ { "name": "value", "type": "string", "value": "" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "newOperator", "type": "address" } ], "name": "changeOperator", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "set", "type": "address" } ], "name": "SetAccountCollectionAddress", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" }, { "name": "AccountName", "type": "string" } ], "name": "AddNewUser", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "RemoveUser", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "newContractAddress", "type": "address" }, { "name": "UserAddress", "type": "address" }, { "name": "HostingContractName", "type": "string" }, { "name": "HostingContractDuration", "type": "uint32" }, { "name": "TotalContractSize", "type": "uint32" } ], "name": "AddHostingContract", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" }, { "name": "HostingContractAddress", "type": "address" } ], "name": "RemoveHostingContract1", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "GetUserAccountAddress", "outputs": [ { "name": "value", "type": "address" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "GetUserAccountName", "outputs": [ { "name": "value", "type": "string" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "GetUserAccountActiveContractCount", "outputs": [ { "name": "value", "type": "uint32" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "GetUserAccountTotalContractCount", "outputs": [ { "name": "value", "type": "uint32" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" }, { "name": "ArrayKey", "type": "uint256" } ], "name": "GetHostingContractAddress", "outputs": [ { "name": "value", "type": "address" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "CheckAccountExistence", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "ScrubContractList", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "set", "type": "uint256" } ], "name": "SetHostingContractCost", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" }, { "name": "HostingContractExtensionDuration", "type": "uint32" } ], "name": "ExtendHostingContract", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetMainContentHash", "outputs": [ { "name": "MainContentHash", "type": "string" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetContentHashString", "outputs": [ { "name": "ContentHashString", "type": "string" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetContentPathString", "outputs": [ { "name": "ContentPathString", "type": "string" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetHostingContractDeployedBlockHeight", "outputs": [ { "name": "value", "type": "uint256" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetHostingContractExpirationBlockHeight", "outputs": [ { "name": "value", "type": "uint256" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetHostingContractStorageUsed", "outputs": [ { "name": "value", "type": "uint32" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetHostingContractName", "outputs": [ { "name": "value", "type": "string" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "MainContentHash", "type": "string" }, { "name": "HostingContractName", "type": "string" }, { "name": "HostingContractDuration", "type": "uint32" }, { "name": "TotalContractSize", "type": "uint32" }, { "name": "ContentHashString", "type": "string" }, { "name": "ContentPathString", "type": "string" } ], "name": "AddHostingContract", "outputs": [ { "name": "value", "type": "address" } ], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [ { "name": "CustomerAddress", "type": "address" }, { "name": "HostingContractAddress", "type": "address" }, { "name": "AccountCollectionAddress", "type": "address" } ], "name": "RemoveHostingContract2", "outputs": [ { "name": "value", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "AccountCollectionAddress", "type": "address" } ], "name": "SetAccountCollectionAddress", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" } ]');
/*END OF CONTRACT SETUP*/
var GlobalHostingCostContractAddress = "0xaECE24f03Ce97D04ed04a2C295e80eCB9Dafb841";
var GlobalHostingCostABI = JSON.parse('[ { "constant": false, "inputs": [ { "name": "newOperator", "type": "address" } ], "name": "changeOperator", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "hostingCost", "type": "uint256" } ], "name": "SetHostingCost", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "deleteContract", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "HostingCost", "outputs": [ { "name": "", "type": "uint256", "value": "10000000000000000000" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "GetHostingCost", "outputs": [ { "name": "", "type": "uint256", "value": "10000000000000000000" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" } ]')
//var GlobalControllerABI = JSON.parse('[ { "constant": true, "inputs": [], "name": "last_completed_migration", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "name": "", "type": "address", "value": "0x" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "constant": false, "inputs": [ { "name": "completed", "type": "uint256" } ], "name": "setCompleted", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "new_address", "type": "address" } ], "name": "upgrade", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "pinToAdd", "type": "string" }, { "name": "pinSize", "type": "uint32" } ], "name": "PinAdd", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "pin", "type": "string" } ], "name": "PinRemove", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "constant": false, "inputs": [], "name": "deleteContract", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "set", "type": "address" } ], "name": "SetAccountCollectionAddress", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "hostingCost", "type": "uint256" } ], "name": "SetHostingCost", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "pinStorageAddress", "type": "address" } ], "name": "SetPinStorageAddress", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "ethoFSDashboardAddress", "type": "address" } ], "name": "SetEthoFSDashboardAddress", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "ethoFSHostingContractsAddress", "type": "address" } ], "name": "SetEthoFSHostingContractsAddress", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" }, { "name": "AccountName", "type": "string" } ], "name": "AddNewUserOwner", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "AccountName", "type": "string" } ], "name": "AddNewUserPublic", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "RemoveUserOwner", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "RemoveUserPublic", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "MainContentHash", "type": "string" }, { "name": "HostingContractName", "type": "string" }, { "name": "HostingContractDuration", "type": "uint32" }, { "name": "TotalContractSize", "type": "uint32" }, { "name": "pinSize", "type": "uint32" }, { "name": "ContentHashString", "type": "string" }, { "name": "ContentPathString", "type": "string" } ], "name": "AddNewContract", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" }, { "name": "MainContentHash", "type": "string" } ], "name": "RemoveHostingContract", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" }, { "name": "HostingContractExtensionDuration", "type": "uint32" } ], "name": "ExtendContract", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [], "name": "ScrubHostingContracts", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "GetUserAccountName", "outputs": [ { "name": "value", "type": "string", "value": "" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "GetUserAccountActiveContractCount", "outputs": [ { "name": "value", "type": "uint32", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "GetUserAccountTotalContractCount", "outputs": [ { "name": "value", "type": "uint32", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "UserAddress", "type": "address" }, { "name": "ArrayKey", "type": "uint256" } ], "name": "GetHostingContractAddress", "outputs": [ { "name": "value", "type": "address", "value": "0x" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "CheckAccountExistence", "outputs": [ { "name": "", "type": "bool", "value": false } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetMainContentHash", "outputs": [ { "name": "MainContentHash", "type": "string", "value": "" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetContentHashString", "outputs": [ { "name": "ContentHashString", "type": "string", "value": "" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetContentPathString", "outputs": [ { "name": "ContentPathString", "type": "string", "value": "" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetHostingContractDeployedBlockHeight", "outputs": [ { "name": "value", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetHostingContractExpirationBlockHeight", "outputs": [ { "name": "value", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetHostingContractStorageUsed", "outputs": [ { "name": "value", "type": "uint32", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetHostingContractName", "outputs": [ { "name": "value", "type": "string", "value": "" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "newOperator", "type": "address" } ], "name": "changeOperator", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "set", "type": "address" } ], "name": "SetAccountCollectionAddress", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" }, { "name": "AccountName", "type": "string" } ], "name": "AddNewUser", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "RemoveUser", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "newContractAddress", "type": "address" }, { "name": "UserAddress", "type": "address" }, { "name": "HostingContractName", "type": "string" }, { "name": "HostingContractDuration", "type": "uint32" }, { "name": "TotalContractSize", "type": "uint32" } ], "name": "AddHostingContract", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" }, { "name": "HostingContractAddress", "type": "address" } ], "name": "RemoveHostingContract1", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "GetUserAccountAddress", "outputs": [ { "name": "value", "type": "address" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "GetUserAccountName", "outputs": [ { "name": "value", "type": "string" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "GetUserAccountActiveContractCount", "outputs": [ { "name": "value", "type": "uint32" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "GetUserAccountTotalContractCount", "outputs": [ { "name": "value", "type": "uint32" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" }, { "name": "ArrayKey", "type": "uint256" } ], "name": "GetHostingContractAddress", "outputs": [ { "name": "value", "type": "address" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "UserAddress", "type": "address" } ], "name": "CheckAccountExistence", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "ScrubContractList", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "set", "type": "uint256" } ], "name": "SetHostingContractCost", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" }, { "name": "HostingContractExtensionDuration", "type": "uint32" } ], "name": "ExtendHostingContract", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetMainContentHash", "outputs": [ { "name": "MainContentHash", "type": "string" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetContentHashString", "outputs": [ { "name": "ContentHashString", "type": "string" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetContentPathString", "outputs": [ { "name": "ContentPathString", "type": "string" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetHostingContractDeployedBlockHeight", "outputs": [ { "name": "value", "type": "uint256" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetHostingContractExpirationBlockHeight", "outputs": [ { "name": "value", "type": "uint256" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetHostingContractStorageUsed", "outputs": [ { "name": "value", "type": "uint32" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "HostingContractAddress", "type": "address" } ], "name": "GetHostingContractName", "outputs": [ { "name": "value", "type": "string" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "MainContentHash", "type": "string" }, { "name": "HostingContractName", "type": "string" }, { "name": "HostingContractDuration", "type": "uint32" }, { "name": "TotalContractSize", "type": "uint32" }, { "name": "ContentHashString", "type": "string" }, { "name": "ContentPathString", "type": "string" } ], "name": "AddHostingContract", "outputs": [ { "name": "value", "type": "address" } ], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [ { "name": "CustomerAddress", "type": "address" }, { "name": "HostingContractAddress", "type": "address" }, { "name": "AccountCollectionAddress", "type": "address" } ], "name": "RemoveHostingContract2", "outputs": [ { "name": "value", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "AccountCollectionAddress", "type": "address" } ], "name": "SetAccountCollectionAddress", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" } ]');
/*END OF CONTRACT SETUP*/
var $miningMessage;

/*START OF MISC GLOBAL VARIABLES*/

var loginAddress;
var privateKeyLogin = false;
var GlobalPrivateKey;
var minimumContractCost = 10000000000000000;

var GlobalUploadName = "";
var GlobalUserAddress = "";
//var GlobalHostingCost = 1.0;
//var GlobalHostingCostWei = GlobalHostingCost * 1000000000000000000;
var GlobalHostingCost;
var GlobalHostingCostWei;
var GlobalUploadSize = 0;
var GlobalUploadSizeMB = 0;
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
var GlobalContractCost = 0;

states = {
  ready: () => {
    const addressesHtml = window.info.addresses.map((address) => {
      return `<li><pre>${address}</pre></li>`
    }).join('')
    $nodeId.innerText = window.info.id
    $allDisabledButtons.forEach(b => {
      b.disabled = false
    })
    $allDisabledInputs.forEach(b => {
      b.disabled = false
    })
    $allDisabledElements.forEach(el => {
      el.classList.remove('disabled')
    })
  }
}
var pathSymbol = "/";
if (navigator.platform.indexOf('Win') > -1) {
  pathSymbol = "\\";
}

class Uploads {

  constructor() {}

  checkExistingLogin() {
    if (GlobalPrivateKey != null) {
      EthoUploads.checkLogin();
    }
  }

  beforeLoginState() {
    var statsRow = document.getElementById("stats-row");
    //statsRow.style.display = "none";
    var uploadButton = document.getElementById("main-upload-button");
    uploadButton.style.display = "none";
  }

  afterLoginState() {
    var statsRow = document.getElementById("stats-row");
    statsRow.style.display = "block";
    var uploadButton = document.getElementById("main-upload-button");
    uploadButton.style.display = "block";
    document.getElementById("ethofs-login-button-text").innerHTML = "Switch User";
    switchFlag = "SWITCH";
    //var loginButton = document.getElementById("main-login-button");
    //loginButton.style.display = "none";
  }

  checkLogin() {
    if (GlobalPrivateKey == null || GlobalPrivateKey == "SWITCH") {
      if (GlobalPrivateKey == null) {
        EthoUploads.beforeLoginState();
      }
      web3 = new Web3()
      web3.setProvider(new Web3.providers.WebsocketProvider("ws://localhost:8546"));
    } else {
      EthoUploads.ethofsLogin(GlobalPrivateKey);
    }
  }

  ethofsLogin(privateKey) {
    EthoUploads.getHostingCostFromContract();
    EthoUploads.afterLoginState();
    $('#ethofsLoginModal').iziModal();
    $('#ethofsLoginModal').iziModal('close');
    $('#ethofsRegistrationModal').iziModal('close');
    EthoUploads.resetUploadSystem();
    EthoUploads.resetUploadProcess();
    EthoUploads.resetUploadModal();
    if (privateKey != "") {
      GlobalPrivateKey = privateKey;
      privateKeyLogin = true;
      web3.eth.net.isListening()
        .then(function () {
          console.log('ethoFS is connected')
          var account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
          console.log(account);
          web3.eth.accounts.wallet.add(account)
          web3.eth.defaultAccount = account.address;
          EthoUploads.startEthofs()
        })
    } else {
      privateKeyLogin = false;
      web3 = new Web3(web3.currentProvider);
      web3.eth.getAccounts(function (err, accounts) {
        if (err != null) {
          console.error("An error occurred: " + err);
          EthoUploads.outputNoAddressContractTable();
        } else if (accounts.length == 0) {
          $('#ethofsLoginModal').iziModal();
          $('#ethofsLoginModal').iziModal('open');
          console.log("User is not logged in");
          document.getElementById("welcome-name").textContent = "Access to Etho Protocol Blockchain Not Found - Make Sure You Are Using Metamask or The Etho Protocol Browser Extension";
          document.getElementById("accountaddress").textContent = "Address Not Found";
          EthoUploads.outputNoAddressContractTable();
        } else {
          console.log("User is logged in");
          web3.eth.defaultAccount = accounts[0];
          EthoUploads.startEthofs();
        }
      });
    }
  }

  getHostingCostFromContract() {
    console.log("Retrieving Hosting Cost...");
    var ethoFSHostingCost = new web3.eth.Contract(GlobalHostingCostABI, GlobalHostingCostContractAddress);
    ethoFSHostingCost.methods.GetHostingCost().call(function (error, result) {
      if (!error) {
        if (result) {
          GlobalHostingCostWei = result;
          GlobalHostingCost = GlobalHostingCostWei / 1000000000000000000;
          document.getElementById("hostingprice").textContent = EthoUploads.round(GlobalHostingCost, 2) + " ETHO";
          console.log("Hosting Cost Retrieved From Contract:    WEI: " + GlobalHostingCostWei + "    ETHO: " + GlobalHostingCost);
        } else {
          console.log("Error Retrieving Hosting Cost From Contract");
        }
      } else {
        console.log("Error Retrieving Hosting Cost From Contract");
      }
    });
  }

  startEthofs() {
    console.log("Starting ethoFS");
    GlobalUserAddress = web3.eth.defaultAccount;
    var ethoFSAccounts = new web3.eth.Contract(GlobalControllerABI, GlobalControllerContractAddress);
    ethoFSAccounts.methods.CheckAccountExistence(GlobalUserAddress).call(function (error, result) {
      if (!error) {
        if (result) {
          document.getElementById("accountaddress").textContent = web3.eth.defaultAccount;
          ethoFSAccounts.methods.GetUserAccountName(GlobalUserAddress).call(function (error, result) {
            if (!error) {
              if (result) {
                EthoUploads.getBlockHeight(web3);
                EthoUploads.getBalance(web3);
                document.getElementById("welcome-name").textContent = "Welcome Back " + result;
                EthoUploads.updateContractTable();
                EthoUploads.startApplication();
              }
            } else {
              console.log("Error getting user account name");
            }
          });
        } else {
          document.getElementById("welcome-name").textContent = "User Not Found";
          document.getElementById("accountaddress").textContent = "Address Not Found";
          console.log("User Not Found");
          $('#ethofsRegistrationModal').iziModal();
          $('#ethofsRegistrationModal').iziModal('open');
        }
      } else {
        document.getElementById("welcome-name").textContent = "Access to Etho Protocol Blockchain Not Found - Make Sure You Are Using Metamask or The Etho Protocol Browser Extension";
        document.getElementById("accountaddress").textContent = "Address Not Found";
        console.log("Blockchain Access Error");
      }
    });
  }

  AddNewUser(userName) {
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
        .then(function (signedTransactionData) {
          web3.eth.sendSignedTransaction(signedTransactionData.rawTransaction, function (error, result) {
            if (!error) {
              if (result) {
                $('#minedBlockTrackerModal').iziModal();
                $('#minedBlockTrackerModal').iziModal('open');
                $miningMessage = document.querySelector('.mining-message')
                EthoUploads.waitForReceipt(result, function (receipt) {
                  console.log("Transaction Has Been Mined: " + receipt);
                  $('#minedBlockTrackerModal').iziModal('close');
                  EthoUploads.ethofsLogin(GlobalPrivateKey);
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
      controller.methods.AddNewUserPublic(userName).send(function (error, result) {
        if (!error) {
          if (result) {
            document.getElementById("wait").innerHTML = 'Waiting For Add User Confirmation.';
            $('#minedBlockTrackerModal').iziModal();
            $('#minedBlockTrackerModal').iziModal('open');
            $miningMessage = document.querySelector('.mining-message')
            EthoUploads.waitForReceipt(result, function (receipt) {
              console.log("Transaction Has Been Mined: " + receipt);
              $('#minedBlockTrackerModal').iziModal('close');
              ethofsLogin("");
            });
          } else {
            console.log("There was a problem adding new user");
            $('#ethofsLoginModal').iziModal();
            $('#ethofsLoginModal').iziModal('open');
          }
        } else {
          console.error(error);
          $('#ethofsLoginModal').iziModal();
          $('#ethofsLoginModal').iziModal('open');
        }
      });
    }
  }
  getBlockHeight(web3) {
    console.log("Starting Block Height Detection..");
    web3.eth.getBlockNumber(function (err, data) {
      document.getElementById("blocknumber").textContent = data;
      console.log("ETHO Block Number: " + data);
    });
  }
  getBalance(web3) {
    console.log("Starting Balance Detection..");
    web3.eth.getBalance(web3.eth.defaultAccount, function (err, data) {
      var balance = "ETHO Balance: " + Number(web3.utils.fromWei(data, "ether")).toFixed(2);
      document.getElementById("ethobalance").textContent = balance;
      console.log("ETHO Balance: " + data);
    });
  }
  //CALCULATE AMOUNT TO BE SENT
  calculateCost(contractSize, contractDuration, hostingCost) {
    var cost = ((((contractSize / 1048576) * hostingCost) * (contractDuration / 46522)));
    if (cost < minimumContractCost) {
      cost = minimumContractCost;
    }
    return cost;
  }
  //CHECK FOR TX - BLOCK TO BE MINED
  waitForReceipt(hash, cb) {
    web3.eth.getTransactionReceipt(hash, function (err, receipt) {
      //document.getElementById("mining-status-message").textContent = "In Progress";
      $miningMessage.innerText = "Waiting For Transaction Confirmation";
      web3.eth.getBlock('latest', function (e, res) {
        if (!e) {
          document.getElementById("block-height").textContent = res.number;
        }
      });
      if (err) {
        error(err);
        $miningMessage.innerText = "Error Conneting To Etho Protocol Network";
      }
      if (receipt !== null) {
        $miningMessage.innerText = "Transaction Confirmed";
        //document.getElementById("mining-status-message").textContent = "Complete";
        if (cb) {
          cb(receipt);
        }
      } else {
        setTimeout(function () {
          EthoUploads.waitForReceipt(hash, cb);
        }, 10000);
      }
    });
  }
  //CREATE ETHER-1 CHAIN CONNECTION AND REMOVE CONTRACT
  RemoveContract(hostingAddress, contentHash) {
    var pinRemoving = new web3.eth.Contract(GlobalControllerABI, GlobalControllerContractAddress);
    if (privateKeyLogin == true) {
      const tx = {
        to: GlobalControllerContractAddress,
        from: GlobalUserAddress,
        gas: 8000000,
        data: pinRemoving.methods.RemoveHostingContract(hostingAddress, contentHash).encodeABI()
      };
      var privateKey = '0x' + GlobalPrivateKey;
      console.log("Contract Removal Started");
      console.log("Private Key: " + privateKey);
      console.log("Hosting Address: " + hostingAddress + "   Removal Hash: " + contentHash);
      web3.eth.accounts.signTransaction(tx, privateKey)
        .then(function (signedTransactionData) {
          console.log("Signed TX Data: " + signedTransactionData.rawTransaction);
          web3.eth.sendSignedTransaction(signedTransactionData.rawTransaction, function (error, result) {
            if (!error) {
              if (result) {
                $('#minedBlockTrackerModal').iziModal();
                $('#minedBlockTrackerModal').iziModal('open');
                $miningMessage = document.querySelector('.mining-message')
                EthoUploads.waitForReceipt(result, function (receipt) {
                  console.log("Transaction Has Been Mined: " + receipt);
                  $('#minedBlockTrackerModal').iziModal('close');
                  EthoUploads.updateContractTable();
                });
              } else {
                console.log("There was a problem removing contract");
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
      pinRemoving.methods.RemoveHostingContract(hostingAddress, contentHash).send(tx, function (error, result) {
        if (!error) {
          if (result) {
            EthoUploads.waitForReceipt(result, function (receipt) {
              console.log("Transaction Has Been Mined: " + receipt);
              $('#minedBlockTrackerModal').iziModal('close');
              EthoUploads.updateContractTable();
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

  updateContractTable() {
    //CREATE ETHER-1 CHAIN CONNECTION AND GET USER ACCOUNT & CONTRACTS
    var ethoFSHostingContracts = new Array();
    var hostingContracts = "";
    var TotalContractCount = 0;
    var blockHeight = 0;
    web3.eth.getBlockNumber(function (error, result) {
      if (!error) {
        blockHeight = result;
      } else
        console.error(error);
    });
    var ethoFSAccounts = new web3.eth.Contract(GlobalControllerABI, GlobalControllerContractAddress);
    ethoFSAccounts.methods.GetUserAccountTotalContractCount(web3.eth.defaultAccount).call(function (error, result) {
      TotalContractCount = result;
      GlobalTotalContractCount = result;
      const getContractData = async (ethoFSAccounts, account, TotalContractCount) => {
        if (TotalContractCount == 0) {
          EthoUploads.outputNoAddressContractTableWithButton();
        }
        for (var i = 0; i < TotalContractCount; i++) {
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
          var counter = i;
          GlobalHostingContractArray[counter] = new Array();
          var ethoFSHostingContractAddress = promisify(cb => ethoFSAccounts.methods.GetHostingContractAddress(account, counter).call(cb));
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
            var ethoFSHostingContractCost = counter;
            var ethoFSHostingContractName = promisify(cb => ethoFSAccounts.methods.GetHostingContractName(ethoFSHostingContractAddress).call(cb));
            var ethoFSHostingContractMainHash = promisify(cb => ethoFSAccounts.methods.GetMainContentHash(ethoFSHostingContractAddress).call(cb));
            var ethoFSHostingContractHashString = promisify(cb => ethoFSAccounts.methods.GetContentHashString(ethoFSHostingContractAddress).call(cb));
            var ethoFSHostingContractPathString = promisify(cb => ethoFSAccounts.methods.GetContentPathString(ethoFSHostingContractAddress).call(cb));

            var ethoFSHostingContractStorage = promisify(cb => ethoFSAccounts.methods.GetHostingContractStorageUsed(ethoFSHostingContractAddress).call(cb));
            var ethoFSHostingContractStartBlock = promisify(cb => ethoFSAccounts.methods.GetHostingContractDeployedBlockHeight(ethoFSHostingContractAddress).call(cb));
            var ethoFSHostingContractEndBlock = promisify(cb => ethoFSAccounts.methods.GetHostingContractExpirationBlockHeight(ethoFSHostingContractAddress).call(cb));

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

            var ContractHashArray = new Array();
            var ContractPathArray = new Array();
            var splitHashArray = await Promise.all([splitString(await ethoFSHostingContractHashString, ":")]);
            var splitPathArray = await Promise.all([splitString(await ethoFSHostingContractPathString, ":")]);

            function splitString(stringToSplit, splitDelimeter) {
              return stringToSplit.split(splitDelimeter);
            }
            await Promise.all([loopSplitStrings(await splitHashArray[0], await splitPathArray[0], counter)]);

            function loopSplitStrings(splitHashArray, splitPathArray, counter) {
              for (var j = 1; j < splitHashArray.length; j++) {
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
          var ethoFSHostingContractStatus = "Expired";
          hostingContracts += '<tr class="tr-shadow" style="display: none;"><td>' + ethoFSHostingContractName + '</td><td><span class="block-email"><a href="#" onclick="EthoUploads.showHostingContractDetails(' + counter + ');">' + ethoFSHostingContractHash + '</a></span></td><td class="desc">' + ethoFSHostingContractStartBlock + '</td><td>' + ethoFSHostingContractEndBlock + '</td><td><span class="status--process"><font color="red">' + ethoFSHostingContractStatus + '</font></span></td><td><div class="table-data-feature"><button class="item" data-toggle="modal" data-target="#minedBlockTrackerModal" data-placement="top" title="Delete" onclick="EthoUploads.RemoveContract(\'' + ethoFSHostingContractAddress + '\',\'' + ethoFSHostingContractMainHash + '\');"><i class="zmdi zmdi-delete"></i></button><button class="item" data-toggle="tooltip" data-placement="top" title="More" onclick="showHostingContractDetails(' + counter + ');"><i class="zmdi zmdi-more"></i></button></div></td></tr>';
        } else {
          var ethoFSHostingContractStatus = "Active";
          hostingContracts += '<tr class="tr-shadow"><td style="color:white">' + ethoFSHostingContractName + '</td><td><span class="block-email"><a href="#" style="color: #d8477e" onclick="EthoUploads.showHostingContractDetails(' + counter + ');">' + ethoFSHostingContractHash + '</a></span></td><td class="desc" style="color: yellow">' + ethoFSHostingContractStartBlock + '</td><td style="color: red">' + ethoFSHostingContractEndBlock + '</td><td><span class="status--process" style="color: #43d043">' + ethoFSHostingContractStatus + '</span></td><td><div class="table-data-feature"><button class="item" data-toggle="modal" data-target="#minedBlockTrackerModal" data-placement="top" title="Delete" onclick="EthoUploads.RemoveContract(\'' + ethoFSHostingContractAddress + '\',\'' + ethoFSHostingContractMainHash + '\');"><i class="zmdi zmdi-delete"></i></button><button class="item" data-toggle="tooltip" data-placement="top" title="More" onclick="EthoUploads.showHostingContractDetails(' + counter + ');"><i class="zmdi zmdi-more"></i></button></div></td></tr>';
        }
        GlobalHostingContractArray[counter]['status'] = ethoFSHostingContractStatus;
        document.getElementById("hostingcontractstablebody").innerHTML = hostingContracts;
      }
    });
  }
  //UPDATE CONTRACT DURATION AND CONTRACT COST
  contractDurationChange(selectObj) {
    var duration = document.getElementById('contract-duration').value;
    GlobalContractDuration = duration;
    GlobalContractCost = (((GlobalUploadSize / 1048576) * GlobalHostingCost) * (duration / 46522));
    document.getElementById("contract-cost").innerHTML = EthoUploads.round(GlobalContractCost, 2);
    return false;
  }

  contractModalSetup() {
    var duration = document.getElementById('contract-duration').value;
    GlobalContractDuration = duration;
    var ContractCost = (((GlobalUploadSize / 1048576) * GlobalHostingCost) * (duration / 46522));
    document.getElementById("contract-cost").innerHTML = EthoUploads.round(ContractCost, 2);
    return false;
  }
  //MISC ROUNDING FUNCTION
  round(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
  }
  finishUploadModal() {
    $('#uploadTrackerModal').iziModal('close');
    EthoUploads.stopApplication();
    EthoUploads.resetUploadSystem();
    return;
  }

  resetUploadModal() {
    var duration = document.getElementById('contract-duration').value;
    GlobalContractDuration = duration;
    GlobalContractCost = ((GlobalUploadSize / 1048576) * GlobalHostingCost) * (duration / 46522);
    document.getElementById("contract-cost").innerHTML = EthoUploads.round(GlobalContractCost, 2);
    document.getElementById("upload-hash").innerHTML = GlobalUploadHash;
    document.getElementById("upload-size").innerHTML = GlobalUploadSizeMB;
    return;
  }
  //CHECK FOR PROPAGATED & AVAILABLE DATA ON NETWORK - FINAL VERIFICATION FOR UPLOADED CONTENT
  checkForUploadedContentAvailability(HostingContractName) {
    document.getElementById("upload-check-button").style.visibility = "hidden";
    $('#uploadTrackerModal').iziModal();
    $('#uploadTrackerModal').iziModal('open');
    document.getElementById("upload-hash").innerHTML = HostingContractName;
    $uploadMessage = document.querySelector('.upload-message')
    return false;
  }

  resetUploadSystem() {
    MainFileArray = new Array();
    GlobalUploadSize = 0;
    GlobalUploadSizeMB = 0;
    GlobalMainHashArray = new Array();
    GlobalMainPathArray = new Array();
    GlobalHashArray = new Array();
    GlobalPathArray = new Array();
    GlobalUploadHash = "";
    GlobalUploadPath = "";
    GlobalContractCost = 0;
    var duration = document.getElementById('contract-duration').value;
    GlobalContractDuration = duration;
    GlobalContractCost = ((GlobalUploadSize / 1048576) * GlobalHostingCost) * (duration / 46522);
    document.getElementById("contract-cost").innerHTML = EthoUploads.round(GlobalContractCost, 2);
    document.getElementById("upload-hash").innerHTML = "";
    document.getElementById("upload-size").innerHTML = 0;
    GlobalContractCost = 0;
    return false;
  }
  //CHECK FOR PROPAGATED & AVAILABLE DATA ON NETWORK - FINAL VERIFICATION FOR UPLOADED CONTENT
  sortContractTable() {
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
    for (var i = 0; i < GlobalTotalContractCount; i++) {
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
        hostingContracts += '<tr class="tr-shadow"><td>' + ethoFSHostingContractName + '</td><td><span class="block-email"><a href="#" onclick="EthoUploads.showHostingContractDetails(' + counter + ');">' + ethoFSHostingContractHash + '</a></span></td><td class="desc">' + ethoFSHostingContractStartBlock + '</td><td>' + ethoFSHostingContractEndBlock + '</td><td><span class="status--process">' + ethoFSHostingContractStatus + '</span></td><td><div class="table-data-feature"><button class="item" data-toggle="modal" data-placement="top" data-target="#minedBlockTrackerModal" title="Delete" onclick="EthoUploads.RemoveContract(\'' + ethoFSHostingContractAddress + '\',\'' + ethoFSHostingContractHash + '\');"><i class="zmdi zmdi-delete"></i></button><button class="item" data-toggle="tooltip" data-placement="top" title="More" onclick="EthoUploads.showHostingContractDetails(' + counter + ');"><i class="zmdi zmdi-more"></i></button></div></td></tr>';
      } else {
        hostingContracts += '<tr class="tr-shadow"><td>' + ethoFSHostingContractName + '</td><td><span class="block-email"><a href="#" onclick="EthoUploads.showHostingContractDetails(' + counter + ');">' + ethoFSHostingContractHash + '</a></span></td><td class="desc">' + ethoFSHostingContractStartBlock + '</td><td>' + ethoFSHostingContractEndBlock + '</td><td><span class="status--process"><font color="red">' + ethoFSHostingContractStatus + '</font></span></td><td><div class="table-data-feature"><button class="item" data-toggle="modal" data-placement="top" data-target="#minedBlockTrackerModal" title="Delete" onclick="EthoUploads.RemoveContract(\'' + ethoFSHostingContractAddress + '\',\'' + ethoFSHostingContractHash + '\');"><i class="zmdi zmdi-delete"></i></button><button class="item" data-toggle="tooltip" data-placement="top" title="More" onclick="EthoUploads.showHostingContractDetails(' + counter + ');"><i class="zmdi zmdi-more"></i></button></div></td></tr>';
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

  //SHOW MODAL WITH HOSTING CONTRACT DETAILS
  showHostingContractDetails(counter) {
    EthoUploads.resetContractExtensionChange();

    GlobalHostingContractDetailArray = GlobalHostingContractArray[counter];
    $("#contractDetailModal").iziModal();
    $("#contractDetailModal").iziModal("open");
    document.getElementById("contract-detail-name").innerHTML = GlobalHostingContractDetailArray['name'];
    var hashOutputString = "";
    var hostingContractEntry = "";
    for (var i = 1; GlobalHostingContractDetailArray['hash'].length > i; i++) {
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
      cell1.innerHTML = '<a  href="http://data.ethofs.com/ipfs/' + ethoFSHostingContractHash + '" target="_blank" style="word-break: break-word">' + "http://data.ethofs.com/ipfs/" + ethoFSHostingContractHash + '</a>';
    }

  }

  resetContractDetailTableRows() {
    var x = document.getElementById("contract-detail-table").rows.length;
    for (var y = (x - 1); y > 10; y--) {
      document.getElementById("contract-detail-table").deleteRow(y);
    }
  }

  //LOCK CONTRACT TABLE DOWN - NO USER ACCOUNT
  outputNoAddressContractTable() {
    hostingContracts = '<tr class="tr-shadow"><td>No Hosting Contracts Found</td><td><span class="block-email"></span></td><td class="desc"></td><td></td><td><span class="status--process"></span></td><td><div class="table-data-feature"></div></td></tr>';
    document.getElementById("hostingcontractstablebody").innerHTML = hostingContracts;
  }
  //LOCK CONTRACT TABLE DOWN - NO USER ACCOUNT
  outputNoAddressContractTableWithButton() {
    hostingContracts = '<tr class="tr-shadow"><td>No Hosting Contracts Found</td><td><span class="block-email"></span></td><td class="desc"></td><td></td><td><span class="status--process"></span></td><td><div class="table-data-feature"></div></td></tr>';
    document.getElementById("hostingcontractstablebody").innerHTML = hostingContracts;
  }

  resetContractExtensionChange() {
    GlobalExtensionDuration = 0;
    document.getElementById("contract-extension-cost").innerHTML = 0;
    document.getElementById("extend-contract").selectedIndex = "0";
  }

  //CONTRACT EXTENSION VALUE CHANGE
  contractExtensionChange(selectObj) {
    var index = selectObj.selectedIndex;
    var extensionDuration = selectObj.options[index].value;
    console.log("Extenstion Duration: " + extensionDuration);
    GlobalExtensionDuration = extensionDuration;
    document.getElementById("contract-extension-button").style.visibility = "visible";
    var extensionCost = ((GlobalHostingContractDetailArray['storage'] / 1048576) * GlobalHostingCost) * (extensionDuration / 46522);
    document.getElementById("contract-extension-cost").innerHTML = EthoUploads.round(extensionCost, 2);
  }

  //CONTRACT EXTENSION CONFIRM
  contractExtensionConfirmation() {
    if (GlobalExtensionDuration > 0) {
      var extensionDuration = GlobalExtensionDuration;
      var ethoFSController = new web3.eth.Contract(GlobalControllerABI, GlobalControllerContractAddress);

      var extensionCost = EthoUploads.calculateCost(GlobalHostingContractDetailArray['storage'], extensionDuration, GlobalHostingCostWei);
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
          .then(function (signedTransactionData) {
            console.log("Signed TX Data: " + signedTransactionData.rawTransaction);
            web3.eth.sendSignedTransaction(signedTransactionData.rawTransaction, function (error, result) {
              if (!error) {
                if (result) {
                  $("#contractDetailModal").iziModal("close");
                  $("#minedBlockTrackerModal").iziModal();
                  $("#minedBlockTrackerModal").iziModal("open");
                  EthoUploads.waitForReceipt(result, function (receipt) {
                    console.log("Transaction Has Been Mined: " + receipt);
                    $("#minedBlockTrackerModal").iziModal("close");
                    EthoUploads.updateContractTable();
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

        ethoFSController.methods.ExtendContract(GlobalHostingContractDetailArray['address'], extensionDuration).send(transactionObject, function (error, result) {
          if (!error) {
            if (result) {
              $('#contractDetailModal').iziModal('close');
              $("#minedBlockTrackerModal").iziModal();
              $('#minedBlockTrackerModal').iziodal('open');
              EthoUploads.waitForReceipt(result, function (receipt) {
                console.log("Transaction Has Been Mined: " + receipt);
                $('#minedBlockTrackerModal').iziModal('close');
                EthoUploads.updateContractTable();
              });
            }
          } else {
            console.log(error);
          }
        });
      }
    }
  }

  subscribeToHealthChannel() {
    window.node.pubsub.subscribe(info.id + "_alpha11", EthoUploads.healthMessageHandler)
      .catch(() => EthoUploads.onError('An error occurred when subscribing to the health check workspace.'))
  }
  healthMessageHandler(message) {
    healthMessage = message.data.toString();
    EthoUploads.UpdateHealthCheckInfo(healthMessage);
  }

  UpdateHealthCheckInfo(healthMessage) {
    var mainMessage = healthMessage.split(";")[1];
    var splitMessage = mainMessage.split(",");
    var activeHistory = 0;
    var nodeCounter = 0;
    splitMessage.forEach(function (nodeMessage, index) {
      var nodeSplitMessage = nodeMessage.split(":");
      activeHistory = Number(nodeSplitMessage[5]);
      if (activeHistory >= 5) {
        nodeCounter++;
        document.getElementById("nodecount").textContent = nodeCounter;
      }
    });
  }


  messageHandler(message) {
    messageString = message.data.toString();
  }
  receiveExitMsg(msg) {
    console.log("Content Upload Successful")
  }
  exitMessageHandler(message) {
    const cancelMessageString = message.data.toString()
  }

  subscribeToMessaging() {
    for (var i = 4; i < PeersForChannel.length; i++) {
      window.node.pubsub.subscribe(PeersForChannel[i] + "PinningChannel_alpha11", messageHandler)
        .catch(() => EthoUploads.onError('An error occurred when subscribing to the workspace.'))
    }
  }
  unsubscribeToMessaging() {
    for (var i = 4; i < PeersForChannel.length; i++) {
      window.node.pubsub.unsubscribe(PeersForChannel[i] + "PinningChannel_alpha11", exitMessageHandler)
        .catch(() => EthoUploads.onError('An error occurred when unsubscribing to the workspace.'))
    }
  }
  publishImmediatePin(hash) {
    const data = Buffer.from(hash)
    for (var i = 0; i < PeersForChannel.length; i++) {
      var channel = PeersForChannel[i] + "ImmediatePinningChannel_alpha11";
      window.node.pubsub.publish(channel, data)
        .catch(() => EthoUploads.onError('An error occurred when publishing the message.'))
    }
  }

  resetProgress() {
    $progressBar = document.querySelector('#progress-bar')
    $progressBar.style.transform = 'translateX(-100%)'
  }

  appendFile(name, hash, size, data) {
    $fileHistory = document.querySelector('#file-history tbody')
    const file = new window.Blob([data], {
      type: 'application/octet-binary'
    })
    const url = window.URL.createObjectURL(file)
    const row = document.createElement('tr')

    const nameCell = document.createElement('td')
    nameCell.innerHTML = name

    const hashCell = document.createElement('td')
    hashCell.innerHTML = hash

    const sizeCell = document.createElement('td')
    sizeCell.innerText = size

    const downloadCell = document.createElement('td')
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', name)
    link.innerHTML = '<img width=20 class="table-action" src="assets/dashboard/images/download.svg" alt="Download" />'
    downloadCell.appendChild(link)

    row.appendChild(nameCell)
    row.appendChild(hashCell)
    row.appendChild(sizeCell)
    row.appendChild(downloadCell)

    $fileHistory.insertBefore(row, $fileHistory.firstChild)
  }

  resetFileTable() {
    document.getElementById("fileUploadButton").value = null;
    if (typeof ($fileHistory) != 'undefined' && $fileHistory != null) {
      while ($fileHistory.hasChildNodes()) {
        $fileHistory.removeChild($fileHistory.firstChild);
      }
    }
  }

  onDragEnter(event) {
    $dragContainer = document.querySelector('#drag-container')
    $dragContainer.classList.add('dragging')
  }
  onDragLeave() {
    $dragContainer = document.querySelector('#drag-container')
    $dragContainer.classList.remove('dragging')
  }

  startUploadProcess() {
    console.log("Starting Upload Process..");
    var streamFinishCount = 0;
    for (var i = 0; i < MainFileArray.length; i++) {
      const streamFiles = (files) => {
        const stream = node.addReadableStream()
        stream.on('data', function (data) {
          GlobalHashArray.push(`${data.hash}`);
          GlobalSizeArray.push(`${data.size}`);
          GlobalPathArray.push(`${data.path}`);
          GlobalUploadHash = `${data.hash}`;
          GlobalUploadPath = `${data.path}`;
          console.log("Path: " + data.path + "  Hash: " + data.hash);
          var comparePath = data.path.replace(/\\/g, '/');
          console.log("Compare Path: " + comparePath);
          var splitString = comparePath.split("/")
          if (splitString.length == 1 || splitString[0] == "") {
            streamFinishCount++;
            GlobalMainHashArray.push(`${data.hash}`);
            GlobalMainPathArray.push(`${data.path}`);
            if (streamFinishCount == MainFileArray.length) {
              console.log("Finish Path: " + data.path + "  Hash: " + data.hash);
              createMainHash();
            }
          }
        });
        files.forEach(file => stream.write(file))
        stream.end()
      }
      var filesForStream = MainFileArray[i];
      streamFiles(filesForStream);
    }

    function streamFilesExternally(filesArray, MainHashArray) {

      var confirmationServers = ["https://ipfsapi.ethofs.com/ipfs/", "https://ipfsapi1.ethofs.com/ipfs/", "https://ipfsapi2.ethofs.com/ipfs/", "https://ipfsapi5.ethofs.com/ipfs/", "https://ipfsapi6.ethofs.com/ipfs/", "https://ipfsapi7.ethofs.com/ipfs/"];
      let hashVerificationArray = [...GlobalHashArray, ...GlobalMainHashArray];
      hashVerificationArray.push(GlobalMainContentHash);
      var hashConfirmationCount = 0;
      var uploadCompleteFlag = false;

      for (var i = 0; i < MainHashArray.length; i++) {
        console.log("Sending Immediate Pin Request: " + MainHashArray[i]);
        EthoUploads.publishImmediatePin(MainHashArray[i]);
      }
      setTimeout(function () {
        hashVerificationArray.forEach(function (hash) {
          verifyDataUpload(hash);
        });
      }, 5000);

      const verifyDataUpload = async hash => {
        var confirmationServer = confirmationServers[Math.floor(Math.random() * confirmationServers.length)];
        var url = confirmationServer + hash;
        try {
          const response = await fetch(url);
          console.log("Data Confirmation Status: " + response.status + " Hash: " + hash);
          if (response.status == 200) {
            hashConfirmationCount++;
            var confirmationPercentage = Math.ceil((hashConfirmationCount / hashVerificationArray.length) * 100);
            EthoUploads.updateUploadProgress(confirmationPercentage);
            console.log("Data Upload Confirmation Received: " + hashConfirmationCount + "/" + hashVerificationArray.length);
            $uploadMessage.innerText = "Upload Confirmation Received: " + hashConfirmationCount + "/" + hashVerificationArray.length;
            if (confirmationPercentage >= 99) {
              $uploadMessage.innerText = "Upload Complete";
              document.getElementById("upload-status-message").textContent = "Complete";
              if (!uploadCompleteFlag) {
                uploadCompleteFlag = true;
                EthoUploads.updateContractTable();
                EthoUploads.finishUploadModal();
              }
              return;
            }
          } else {
            var confirmationPercentage = Math.ceil((hashConfirmationCount / hashVerificationArray.length) * 100);
            if (confirmationPercentage < 99) {
              setTimeout(function () {
                verifyDataUpload(hash)
              }, 2000);
            } else {
              return;
            }
          }
        } catch (error) {
          console.log(error);
          console.log("Data Confirmation Error: " + error.status);
          var confirmationPercentage = Math.ceil((hashConfirmationCount / hashVerificationArray.length) * 100);
          if (confirmationPercentage < 99) {
            setTimeout(function () {
              verifyDataUpload(hash)
            }, 2000);
          } else {
            return;
          }
        }
      };
    }

    function createMainHash() {
      var contentHashString = GlobalChannelString;
      for (i = 0; i < GlobalMainHashArray.length; i++) {
        contentHashString += ":" + GlobalMainHashArray[i];
      }
      window.node.add(Buffer.from(contentHashString), (err, res) => {
        if (err || !res) {
          return console.error('ipfs add error', err, res)
        }
        res.forEach((file) => {
          if (file && file.hash) {
            GlobalMainContentHash = file.hash;
            AddNewPin(GlobalUploadHash, GlobalUploadSize, document.getElementById('newcontractname').value, GlobalContractDuration);
          }
        });
      });
    }

    function AddNewPin(pinToAdd, pinSize, HostingContractName, HostingContractDuration) {
      var contentHashString = GlobalChannelString;
      var contentPathString = GlobalChannelString;
      for (i = 0; i < GlobalMainHashArray.length; i++) {
        contentHashString += ":" + GlobalMainHashArray[i];
        contentPathString += ":" + GlobalMainPathArray[i];
      }
      var MainHashArray = GlobalMainHashArray;
      GlobalUploadName = HostingContractName;
      var contractCost = EthoUploads.calculateCost(pinSize, HostingContractDuration, GlobalHostingCostWei);
      var pinAdding = new web3.eth.Contract(GlobalControllerABI, GlobalControllerContractAddress);
      const transactionObject = {
        from: GlobalUserAddress,
        value: contractCost
      };
      console.log("Contract Address: " + GlobalControllerContractAddress + " Value: " + contractCost);
      if (privateKeyLogin == true) {
        const tx = {
          to: GlobalControllerContractAddress,
          from: GlobalUserAddress,
          value: contractCost,
          gas: 4000000,
          data: pinAdding.methods.AddNewContract(GlobalMainContentHash, HostingContractName, HostingContractDuration, pinSize, pinSize, contentHashString, contentPathString).encodeABI()
        };
        var privateKey = '0x' + GlobalPrivateKey;
        console.log("Private Key: " + privateKey);
        web3.eth.accounts.signTransaction(tx, privateKey)
          .then(function (signedTransactionData) {
            console.log("Signed TX Data: " + signedTransactionData.rawTransaction);
            web3.eth.sendSignedTransaction(signedTransactionData.rawTransaction, function (error, result) {
              if (!error) {
                if (result) {
                  console.log("Result: " + result);
                  $("#minedBlockTrackerModal").iziModal();
                  $('#minedBlockTrackerModal').iziModal('open');
                  $miningMessage = document.querySelector('.mining-message')
                  $('#preparingUploadModal').iziModal('close');
                  EthoUploads.waitForReceipt(result, function (receipt) {
                    console.log("Transaction Has Been Mined: " + receipt);
                    $('#minedBlockTrackerModal').iziModal('close');
                    $('#nodeModal').iziModal('close');
                    var filesForStream = MainFileArray;
                    streamFilesExternally(filesForStream, MainHashArray);
                    EthoUploads.checkForUploadedContentAvailability(HostingContractName);
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
        pinAdding.methods.AddNewContract(GlobalMainContentHash, HostingContractName, HostingContractDuration, pinSize, pinSize, contentHashString, contentPathString).send(transactionObject, function (error, result) {
          if (!error) {
            if (result) {
              $('#minedBlockTrackerModal').iziModal();
              $('#minedBlockTrackerModal').iziModal('open');
              $miningMessage = document.querySelector('.mining-message')
              $('#preparingUploadModal').iziModal('close');
              EthoUploads.waitForReceipt(result, function (receipt) {
                console.log("Transaction Has Been Mined: " + receipt);
                $('#minedBlockTrackerModal').iziModal('close');
                $('#nodeModal').iziModal('close');
                var filesForStream = MainFileArray;
                streamFilesExternally(filesForStream, MainHashArray);
                EthoUploads.checkForUploadedContentAvailability(HostingContractName);
              });
            } else {
              console.log("There was a problem adding new contract");
            }
          } else {
            console.error(error);
          }
        });
      }
    }
  }

  updateUploadProgress(width) {
    var elem = document.getElementById("myBar");
    width = EthoUploads.round(width, 2);
    if (width >= 100) {
      width = 100;
      elem.style.width = width + '%';
      elem.innerHTML = width * 1 + '%';
    }
    elem.style.width = width + '%';
    elem.innerHTML = width * 1 + '%';
  }

  resetUploadProcess() {
    EthoUploads.updateUploadProgress(0);
    document.getElementById("upload-status-message").textContent = "";
    MainFileArray = new Array();
    GlobalUploadSize = 0;
    GlobalUploadSizeMB = 0;
    GlobalMainHashArray = new Array();
    GlobalMainPathArray = new Array();
    GlobalHashArray = new Array();
    GlobalPathArray = new Array();
    GlobalUploadHash = "";
    GlobalUploadPath = "";
    GlobalContractCost = 0;
  }

  updateAnalyzeProgress(width) {
    var elem = document.getElementById("myAnalyzeBar");
    width = EthoUploads.round(width, 2);
    if (width >= 100) {
      width = 100;
      elem.style.width = width + '%';
      elem.innerHTML = width * 1 + '%';
    }
    elem.style.width = width + '%';
    elem.innerHTML = width * 1 + '%';
  }

  connectToPeer(event) {
    const multiaddr = $multiaddrInput.value

    if (!multiaddr) {
      return EthoUploads.onError('No multiaddr was inserted.')
    }

    window.node.swarm.connect(multiaddr)
      .then(() => {
        EthoUploads.onSuccess(`Successfully connected to peer.`)
        $multiaddrInput.value = ''
      })
      .catch(() => EthoUploads.onError('An error occurred when connecting to the peer.'))
  }

  updatePeerProgress(width, peercount) {
    var backgroundcolor = "";
    var elem = document.getElementById("myPeerBar");
    width = EthoUploads.round(width, 2);
    if (width >= 100) {
      width = 100;
    }
    if (width >= 80) {
      backgroundcolor = '"#3CB371"';
    } else if (width >= 40 && width < 80) {
      backgroundcolor = '"#FFFF00"';
    } else {
      backgroundcolor = '"#FF0000"';
    }
    elem.style.width = width + '%';
  }

  refreshPeerList() {
    var updatedPeerCount = 0;
    window.node.swarm.peers()
      .then((peers) => {
        const peersAsHtml = peers.reverse()
          .map((peer) => {
            if (peer.addr) {
              const addr = peer.addr.toString()
              if (addr.indexOf('ipfs') >= 0) {
                return addr
              } else {
                return addr + peer.peer.id.toB58String()
              }
            }
          })
          .map((addr) => {
            var splitString = addr.split("/");
            addr = splitString[splitString.length - 1];
            updatedPeerCount++;
            if (!PeersForChannel.includes(addr)) {
              PeersForChannel.push(addr);
            }
            return `<tr><td>${addr}</td></tr>`
          }).join('')

      }).then(() => {
        EthoUploads.updatePeerProgress(((updatedPeerCount / 7) * 100), updatedPeerCount)
      })
      .catch((error) => EthoUploads.onError(error))
  }

  onSuccess(msg) {
    $logs.classList.add('success')
    $logs.innerHTML = msg
  }

  onError(err) {
    let msg = 'An error occured, check the dev console'

    if (err.stack !== undefined) {
      msg = err.stack
    } else if (typeof err === 'string') {
      msg = err
    }

    $logs.classList.remove('success')
    $logs.innerHTML = msg
  }

  updateView(state, ipfs) {
    if (states[state] !== undefined) {
      states[state]()
    } else {
      throw new Error('Could not find state "' + state + '"')
    }
  }

  startApplication() {
    window.startNode()
    EthoUploads.extendedStartApplication()
  }

  extendedStartApplication() {
    $ethomessage.innerText = GlobalUserAddress;
  }

  stopApplication() {
    EthoUploads.resetUploadProcess();
  }


  renderUploads(ethofsRenderFlag) {
    EthoMainGUI.renderTemplate("uploads.html", {});
    $(document).trigger("render_uploads");
  }
}

// create new uploads variable
EthoUploads = new Uploads();


function onFileUpload(event) {
  event.preventDefault()
  GlobalUploadSize = 0;
  GlobalUploadSizeMB = 0;
  document.getElementById("upload-hash").textContent = "ANALYZING UPLOAD DATA";
  document.getElementById("upload-confirm-button").style.visibility = "hidden";
  MainFileArray.push([]);
  let dirSelected = event.target.files;
  let dirName = dirSelected[0].name;
  let dirPath = dirSelected[0].path;
  var streamCompareCount = 0;
  var totalUploadItems = 0;
  readDirectoryContents(dirPath);

  function readDirectoryContents(directory) {
    console.log("Directory Path: " + directory);
    fs.readdir(directory, function (err, filesUploaded) {
      if (!err) {
        for (let i = 0; filesUploaded.length > i; i++) {
          handleItem(filesUploaded[i], directory);
        }
      } else {
        console.log("File Upload Error: " + err);
      }
    });
  }

  function handleItem(filename, relativePath) {
    var filepath = relativePath.concat(pathSymbol, filename);
    fs.stat(filepath, function (err, stats) {
      if (!err) {
        if (stats.isDirectory()) {
          readDirectoryContents(filepath)
        } else {
          streamCompareCount++;
          totalUploadItems++;
          console.log("File Path: " + filepath);
          fs.readFile(filepath, function (err, file) {
            var updatedPath = filepath.replace(dirPath, dirName);
            var filetowrite = {
              path: updatedPath,
              content: file
            };
            var filename = updatedPath;
            MainFileArray[MainFileArray.length - 1].push(filetowrite);
            GlobalUploadSize += Number(stats.size);
            GlobalUploadSizeMB += Number(stats.size) / 1000000;
            fileSize += Number(stats.size) / 1000000;
            var totalUploadSizeMB = GlobalUploadSizeMB;
            EthoUploads.appendFile(updatedPath, filename, stats.size, null);
            console.log("Path: " + filepath + " Size: " + stats.size + " Total Size: " + GlobalUploadSize);
            document.getElementById("upload-size").textContent = totalUploadSizeMB;
            EthoUploads.contractDurationChange(document.getElementById('contract-duration'));
            EthoUploads.updateAnalyzeProgress(((totalUploadItems - streamCompareCount) / totalUploadItems));
            if (streamCompareCount == 0) {
              document.getElementById("upload-hash").textContent = "READY FOR UPLOAD";
              document.getElementById("upload-confirm-button").style.visibility = "visible";
            }
          });
        }
      } else {
        console.log("File Stats Error: " + err);
      }
    });
  }
}

function onDrop(event) {
  console.log(event);
  MainFileArray.push([]);
  document.getElementById("upload-hash").textContent = "ANALYZING UPLOAD DATA";
  document.getElementById("upload-confirm-button").style.visibility = "hidden";
  fileSize = 0;
  EthoUploads.resetProgress();
  EthoUploads.onDragLeave()
  event.preventDefault()
  if (GlobalUploadHash != "" && GlobalUploadPath != "") {
    GlobalMainHashArray.push(GlobalUploadHash);
    GlobalMainPathArray.push(GlobalUploadPath);
  }
  const dt = event.dataTransfer
  //const filesDropped = dt.files
  const itemsDropped = dt.items

  function readFileContents(file) {
    return new Promise((resolve) => {
      const reader = new window.FileReader()
      reader.onload = (event) => resolve(event.target.result)
      reader.readAsArrayBuffer(file)
    })
  }
  var totalItemCount = 0;
  var streamCompareCount = 0;

  function initialHandleItems(items) {
    const files = [];
    totalItemCount = items.length;
    streamCompareCount = items.length;
    for (var item of items) {
      var awaitHandleEntry = handleEntry(item.webkitGetAsEntry());
    }

    function handleEntry(entry) {
      if (entry.isFile) {
        getFile(entry);

        function getFile(entry) {
          document.getElementById("upload-hash").textContent = "ANALYZING UPLOAD DATA";
          document.getElementById("upload-confirm-button").style.visibility = "hidden";
          entry.file(function (file) {
            readFileContents(file)
              .then((buffer) => {
                var filePath = entry.fullPath;
                var filetowrite = {
                  path: entry.fullPath,
                  content: Buffer.from(buffer)
                };
                MainFileArray[MainFileArray.length - 1].push(filetowrite);
                GlobalUploadSize += Number(file.size);
                fileSize += Number(file.size);
                var totalUploadSizeMB = GlobalUploadSize / 1000000;
                EthoUploads.appendFile(entry.fullPath, entry.name, file.size, null);
                document.getElementById("upload-size").textContent = totalUploadSizeMB;
                EthoUploads.contractDurationChange(document.getElementById('contract-duration'));
                streamCompareCount--;
                EthoUploads.updateAnalyzeProgress(((totalItemCount - streamCompareCount) / totalItemCount));
                if (streamCompareCount == 0) {
                  document.getElementById("upload-hash").textContent = "READY FOR UPLOAD";
                  document.getElementById("upload-confirm-button").style.visibility = "visible";
                }
              });
          });
        }

      } else if (entry.isDirectory) {
        let directoryReader = entry.createReader();
        directoryReader.readEntries(function (entries) {
          streamCompareCount += entries.length - 1;
          totalItemCount += entries.length - 1;
          entries.forEach(function (newEntry) {
            handleEntry(newEntry);
          });
        });
      }
    }

  }
  initialHandleItems(event.dataTransfer.items);
}

$(document).on("render_uploads", function () {
  $('#privatekeytable').hide();
  $('#walletpasswordtable').hide();

  if (isFullySynced) {
    (function ($, _M) {
      M.toast({
        html: 'Node is fully synced and operational.',
        displayLength: 10000
      });
    }(jQuery, M));
  } else {
    (function ($, _M) {
      M.toast({
        html: 'Node is still syncing. Please do not attempt to use the wallet or ethoFS upload system.',
        displayLength: 10000
      });
    }(jQuery, M));
  }
  // Misc
  $ethomessage = document.querySelector('.etho-message')
  $nodeId = document.querySelector('.node-id')
  $logs = document.querySelector('#logs')
  $fetchButton = document.querySelector('#fetch-btn')
  $allDisabledButtons = document.querySelectorAll('button:disabled')
  $allDisabledInputs = document.querySelectorAll('input:disabled')
  $allDisabledElements = document.querySelectorAll('.disabled')

  EthoUploads.beforeLoginState();
  EthoUploads.checkExistingLogin(GlobalPrivateKey);

  fetch('https://api.coinmarketcap.com/v2/ticker/3452/').then(response => {
    return response.json();
  }).then(data => {
    var ethoPriceUSD = data.data.quotes.USD.price;
    document.getElementById("ethoprice").textContent = EthoUploads.round(ethoPriceUSD, 4);
  }).catch(err => {});
});

function getKeyStoreLocation() {
  switch (os.type()) {
    case "Darwin":
      return path.join(os.homedir(), "Library", "Ether1");
      break;
    default:
      return path.join(process.env.APPDATA, "Ether1");
  }
}

$(document).on("dragenter", "#drag-container", function (event) {
  EthoUploads.onDragEnter(event);
});

$(document).on("dragover", "#drag-container", function (event) {
  EthoUploads.onDragEnter(event);
});

$(document).on("drop", "#drag-container", function (event) {
  onDrop(event.originalEvent);
});

$(document).on("dragleave", "#drag-container", function (event) {
  EthoUploads.onDragLeave(event);
});

$(document).on("change", "#fileUploadButton", function (event) {
  onFileUpload(event);
});

$(document).on("click", "#main-login-button", function (event) {
  GlobalPrivateKey = switchFlag;
  EthoUploads.checkLogin();

  $('#ethofsLoginModal').iziModal({
    onOpened: function () {
      console.log("Login Setup Opened ..");
      var addressBook = EthoDatatabse.getWallets();
      console.log("Getting Address List...");

      $('#sendFromAddress').empty();
      $('#sendFromAddress').append(new Option('Login With Private Key', 'privatekey'))
      $('#privatekeytable').show();
      var option = $(this).find("option:selected").text();
      $("#sendFromAddressName").html(option.trim());

      for (var key in addressBook.names) {
        if (addressBook.names.hasOwnProperty(key)) {
          $('#sendFromAddress').append(new Option(addressBook.names[key], key))
        }
      }

      $("#sendFromAddress").on("change", function () {
        var optionText = $(this).find("option:selected").text();
        var optionTextValue = $(this).find("option:selected").val();
        $("#sendFromAddressName").html(optionText.trim());
        console.log("Address Name: " + optionText)
        console.log("Address: " + optionText)
        if (optionTextValue == 'privatekey') {
          privateKeyLogin = true;
          $("#sendFromAddressValue").hide();
          $('#walletpasswordtable').hide();
          $('#privatekeytable').show();
        } else {
          privateKeyLogin = false;
          $("#sendFromAddressValue").show();
          $('#privatekeytable').hide();
          $('#walletpasswordtable').show();
          $("#sendFromAddressValue").html(optionTextValue.trim());
          loginAddress = optionTextValue.trim();
        }
      });
    },
    onOpening: function (modal) {
      console.log("Opening Login Setup..");
      $("#sendFromAddressValue").hide();
      $('#walletpasswordtable').hide();
      $('#privatekeytable').hide();
      (function ($, _M) {
        M.toast({
          html: '<i class="small material-icons">warning </i> If your wallet has a default name e.g: Account 1, you will not be able to select it.',
          displayLength: 10000,
          classes: 'warning'
        });
      }(jQuery, M));
    }
  });
  $('#ethofsLoginModal').iziModal('open');
});

$(document).on("click", "#ethofs-login-button", function (event) {
  if (privateKeyLogin == true) {
    GlobalPrivateKey = document.getElementById('privatekey').value;
    console.log("Global Private Key: " + GlobalPrivateKey);
    EthoUploads.ethofsLogin(GlobalPrivateKey);
  } else {
    loginPassword = document.getElementById('walletpassword').value;
    loginAddress = $("#sendFromAddress").find("option:selected").val().trim();
    var accountsPath = getKeyStoreLocation();
    var keyObject = keythereum.importFromFile(loginAddress, accountsPath);
    var privateKey = keythereum.recover(loginPassword, keyObject);
    var key = privateKey.toString('hex');
    GlobalPrivateKey = key;
    console.log("Global Private Key: " + GlobalPrivateKey);
    EthoUploads.ethofsLogin(GlobalPrivateKey);
  }

});

$(document).on("click", "#main-upload-button", function (event) {
  $('#defaultModal').iziModal();
  $('#defaultModal').iziModal('open');
  EthoUploads.resetUploadProcess();
});

$(document).on("click", "#defaultModal-close", function (event) {
  $('#defaultModal').iziModal('close');
  EthoUploads.resetUploadSystem();
  EthoUploads.resetUploadProcess();
  EthoUploads.resetUploadModal();
});

$(document).on("click", "#defaultModal-next", function (event) {
  $('#defaultModal2').iziModal({
    onOpened: function () {
      //EthoUploads.resetFileTable();
    },
    onOpening: function () {
      EthoUploads.resetFileTable();
    },
    onClosed: function () {
      //document.getElementById("fileUploadButton").value = "";
    },
    onHide: function () {
      //document.getElementById("fileUploadButton").value = "";
    }
  });

  $('#defaultModal2').iziModal('open');
  $('#defaultModal').iziModal('close');
  EthoUploads.resetUploadProcess();
});

$(document).on("click", "#defaultModal2-close", function (event) {
  $('#defaultModal2').iziModal('close');
  EthoUploads.resetUploadSystem();
  EthoUploads.resetUploadProcess();
  EthoUploads.resetUploadModal();
});

$(document).on("click", "#ethofs-registration-button", function (event) {
  EthoUploads.AddNewUser(document.getElementById('username').value);
});

$(document).on("click", "#confirm-files-button", function (event) {
  $('#defaultModal3').iziModal({
    onClosed: function () {
      document.getElementById("fileUploadButton").value = null;
    },
    onHidden: function () {
      document.getElementById("fileUploadButton").value = null;
    }
  });
  $('#defaultModal3').iziModal('open');
  document.getElementById("contract-cost").innerHTML = EthoUploads.round(GlobalContractCost, 2);
  $('#defaultModal2').iziModal('close');
  document.getElementById("upload-hash").textContent = "READY FOR UPLOAD";
  document.getElementById("upload-confirm-button").style.visibility = "visible";
  EthoUploads.resetUploadModal();
});

$(document).on("click", "#defaultModal3-close", function (event) {
  $('#defaultModal3').iziModal('close');
  EthoUploads.resetUploadSystem();
  EthoUploads.resetUploadProcess();
  EthoUploads.resetUploadModal();
});

$(document).on("click", "#upload-confirm-button", function (event) {
  $('#preparingUploadModal').iziModal();
  $('#preparingUploadModal').iziModal('open');
  $('#defaultModal3').iziModal('close');
  EthoUploads.startUploadProcess();
});

$(document).on("click", "#tracker-close-button", function (event) {
  EthoUploads.updateContractTable();
});

$(document).on("click", "#upload-check-button", function (event) {
  EthoUploads.finishUploadModal();
});

$(document).on("click", "#contract-extension-button", function (event) {
  EthoUploads.contractExtensionConfirmation();
});

$(document).on("click", "#reset-table-button", function (event) {
  $("#contractDetailModal").iziModal("close");
  EthoUploads.resetContractDetailTableRows();
});

$(document).on("change", "#contract-duration", function (event) {
  EthoUploads.contractDurationChange(document.getElementById('contract-duration'));
});

$(document).on("change", "#extend-contract", function (event) {
  EthoUploads.contractExtensionChange(document.getElementById('extend-contract'));
});