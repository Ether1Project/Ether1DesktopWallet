window.Web3 = require('web3');
window.privateKeyToAddress = require('ethereum-private-key-to-address');
window.Buf = require('buffer').Buffer;
var Common = require('ethereumjs-common')

/* global location */
'use strict'
const fetch = require("node-fetch");
const IPFS = require('ipfs')
const {
    Buffer
} = IPFS
const fs = require('fs');
const Protector = require('libp2p-pnet')

const fileReaderPullStream = require('pull-file-reader')
const request = require('request');
// Node
const $ethomessage = document.querySelector('.etho-message')
const $nodeId = document.querySelector('.node-id')
const $uploadMessage = document.querySelector('.upload-message')
const $analyzeMessage = document.querySelector('.analyze-message')
const $nodeAddresses = document.querySelector('.node-addresses')
const $logs = document.querySelector('#logs')
// Files
const $fetchButton = document.querySelector('#fetch-btn')
const $dragContainer = document.querySelector('#drag-container')
const $progressBar = document.querySelector('#progress-bar')
const $fileHistory = document.querySelector('#file-history tbody')
const $emptyRow = document.querySelector('.empty-row')
// Misc
const $allDisabledButtons = document.querySelectorAll('button:disabled')
const $allDisabledInputs = document.querySelectorAll('input:disabled')
const $allDisabledElements = document.querySelectorAll('.disabled')

let MainFileArray = [];
const FILES = []
const workspace = location.hash
var ChannelStringArray = new Array();
var usedStorageArray = new Array();
var availableStorageArray = new Array();
var nodeCountArray = new Array();
var PeersForChannel = new Array();
let uploadCount = 0;
let fileSize = 0
process.env.LIBP2P_FORCE_PNET = 1
let node
let info
let addr
let messageFlag = 0;
let messageString = "";
let healthMessage = "";
let averageAvailableStorageTotal = 0;
const swarmKey = "/key/swarm/psk/1.0.0/\n/base16/\n38307a74b2176d0054ffa2864e31ee22d0fc6c3266dd856f6d41bddf14e2ad63";
var swarmKeyBuffer = new Buffer(swarmKey);
/* ===========================================================================
   Start the IPFS node
   =========================================================================== */
function start() {
    if (!node) {
        const options = {
            libp2p: {
                modules: {
                    connProtector: new Protector(swarmKeyBuffer)
                },
		config: {
		    dht: {
		        enabled: false
		    }
		}
	    },
            config: {
	            Bootstrap: [
                        '/dns4/wss0.ethofs.com/tcp/443/wss/ipfs/QmTJ81wQ6cQV9bh5nTthfLbjnrZPMeeCPfvRFiygSzWV1W',
                        '/dns4/wss1.ethofs.com/tcp/443/wss/ipfs/QmTcwcKqKcnt84wCecShm1zdz1KagfVtqopg1xKLiwVJst',
                        '/dns4/wss.ethofs.com/tcp/443/wss/ipfs/QmPW8zExrEeno85Us3H1bk68rBo7N7WEhdpU9pC9wjQxgu',
                        '/dns4/wss2.ethofs.com/tcp/443/wss/ipfs/QmUEy4ScCYCgP6GRfVgrLDqXfLXnUUh4eKaS1fDgaCoGQJ',
                        '/dns4/wss3.ethofs.com/tcp/443/wss/ipfs/QmPT4bDvbAjwPTjf2yeugRT1pruHoH2DMLhpjR2NoczWgw',
                        '/dns4/wss4.ethofs.com/tcp/443/wss/ipfs/QmeG81bELkgLBZFYZc53ioxtvRS8iNVzPqxUBKSuah2rcQ',
                        '/dns4/wss5.ethofs.com/tcp/443/wss/ipfs/QmRwQ49Zknc2dQbywrhT8ArMDS9JdmnEyGGy4mZ1wDkgaX',
                        '/dns4/wss6.ethofs.com/tcp/443/wss/ipfs/Qmf4oLLYAhkXv95ucVvUihnWPR66Knqzt9ee3CU6UoJKVu',
                        '/dns4/wss0.ethofs.com/tcp/443/wss/ipfs/QmTJ81wQ6cQV9bh5nTthfLbjnrZPMeeCPfvRFiygSzWV1W',
                        '/dns4/wss7.ethofs.com/tcp/443/wss/ipfs/QmeG81bELkgLBZFYZc53ioxtvRS8iNVzPqxUBKSuah2rcQ',
                        '/dns4/wss8.ethofs.com/tcp/443/wss/ipfs/QmeG81bELkgLBZFYZc53ioxtvRS8iNVzPqxUBKSuah2rcQ'
                    ],
		Addresses: {
                    Swarm: [
                        '/dns4/wss0.ethofs.com/tcp/443/wss/ipfs/QmTJ81wQ6cQV9bh5nTthfLbjnrZPMeeCPfvRFiygSzWV1W',
                        '/dns4/wss1.ethofs.com/tcp/443/wss/ipfs/QmTcwcKqKcnt84wCecShm1zdz1KagfVtqopg1xKLiwVJst',
                        '/dns4/wss.ethofs.com/tcp/443/wss/ipfs/QmPW8zExrEeno85Us3H1bk68rBo7N7WEhdpU9pC9wjQxgu',
                        '/dns4/wss2.ethofs.com/tcp/443/wss/ipfs/QmUEy4ScCYCgP6GRfVgrLDqXfLXnUUh4eKaS1fDgaCoGQJ',
                        '/dns4/wss3.ethofs.com/tcp/443/wss/ipfs/QmPT4bDvbAjwPTjf2yeugRT1pruHoH2DMLhpjR2NoczWgw',
                        '/dns4/wss4.ethofs.com/tcp/443/wss/ipfs/QmeG81bELkgLBZFYZc53ioxtvRS8iNVzPqxUBKSuah2rcQ',
                        '/dns4/wss5.ethofs.com/tcp/443/wss/ipfs/QmRwQ49Zknc2dQbywrhT8ArMDS9JdmnEyGGy4mZ1wDkgaX',
                        '/dns4/wss6.ethofs.com/tcp/443/wss/ipfs/Qmf4oLLYAhkXv95ucVvUihnWPR66Knqzt9ee3CU6UoJKVu',
                        '/dns4/wss0.ethofs.com/tcp/443/wss/ipfs/QmTJ81wQ6cQV9bh5nTthfLbjnrZPMeeCPfvRFiygSzWV1W',
                        '/dns4/wss7.ethofs.com/tcp/443/wss/ipfs/QmeG81bELkgLBZFYZc53ioxtvRS8iNVzPqxUBKSuah2rcQ',
                        '/dns4/wss8.ethofs.com/tcp/443/wss/ipfs/QmeG81bELkgLBZFYZc53ioxtvRS8iNVzPqxUBKSuah2rcQ'
                     ]
                }
            }
        }
        node = new IPFS(options)
        node.once('start', () => {
            node.id()
                .then((id) => {
                    info = id
                    subscribeToHealthChannel()
                    updateView('ready', node)
                    onSuccess('Node is ready.')
                    setInterval(refreshPeerList, 10000)
                    setInterval(sendFileList, 10000)
                })
                .catch((error) => onError(error))
        })
    }
}

function SwarmPeers() {
    node.swarm.peers(function(err, peerInfos) {
        if (err) {
            throw err
        }
        console.log(peerInfos)
    })
}
/* ===========================================================================
   Pubsub
   =========================================================================== */

const subscribeToHealthChannel = () => {
  node.pubsub.subscribe(info.id + "_alpha11", healthMessageHandler)
    .catch(() => onError('An error occurred when subscribing to the health check workspace.'))
}
const healthMessageHandler = (message) => {
    healthMessage = message.data.toString();
    UpdateHealthCheckInfo(healthMessage);
}
function UpdateHealthCheckInfo(healthMessage) {
    var mainMessage = healthMessage.split(";")[1];
    var splitMessage = mainMessage.split(",");
    var usedStorageTotal = 0;
    var availableStorageTotal = 0;
    var activeHistory = 0;
    var nodeCounter = 0;
    splitMessage.forEach(function(nodeMessage, index) {
        var nodeSplitMessage = nodeMessage.split(":");
        activeHistory = Number(nodeSplitMessage[5]);
        if(activeHistory >= 5){
            nodeCounter++;
            usedStorageTotal += Number(nodeSplitMessage[8]);
            availableStorageTotal += Number(nodeSplitMessage[7]);
        }
        if(index == (splitMessage.length - 1)){
            updateStorageArrays(usedStorageTotal, availableStorageTotal, nodeCounter);
        }
    });
    function updateStorageArrays(usedStorageTotal, availableStorageTotal, nodecount){

        if(availableStorageArray.length >= 50){
            if(availableStorageTotal > 0.75 * averageAvailableStorageTotal && availableStorageTotal < 1.25 * averageAvailableStorageTotal){
                availableStorageArray.push(availableStorageTotal);
                availableStorageArray.shift();
            }
        }else{
            availableStorageArray.push(availableStorageTotal);
        }
        if(nodeCountArray.length >= 50){
            nodeCountArray.push(nodecount);
            nodeCountArray.shift();
        }else{
            nodeCountArray.push(nodecount);
        }
        calculateStorageAverages(usedStorageArray, availableStorageArray, nodeCountArray);
    }
    function calculateStorageAverages(usedStorageArray, availableStorageArray, nodeCountArray){

        var sumAvailableStorage = 0;
        availableStorageArray.forEach(function(value, index) {
            sumAvailableStorage += value;
            if(index == (availableStorageArray.length - 1)){
                averageAvailableStorageTotal = (sumAvailableStorage/availableStorageArray.length);
                document.getElementById("nodestorage").textContent=(round(2+((averageAvailableStorageTotal)/1000000), 1)) + "TB";
            }
        });
        var sumNodeCount = 0;
        nodeCountArray.forEach(function(value, index) {
            sumNodeCount += value;
            if(index == (nodeCountArray.length - 1)){
                var averageNodeCount = (sumNodeCount/nodeCountArray.length) + 19;
                document.getElementById("nodecount").textContent=(round(averageNodeCount, 0));
            }
        });
    }
}


const messageHandler = (message) => {
    messageString = message.data.toString();
}
const receiveExitMsg = (msg) => console.log("Content Upload Successful")
const exitMessageHandler = (message) => {
    const cancelMessageString = message.data.toString()
}
window.CheckForUploadedContentVerification = function(){

}

const subscribeToMessaging = () => {
  for(var i = 4; i < PeersForChannel.length; i++){
    node.pubsub.subscribe(PeersForChannel[i] + "PinningChannel_alpha11", messageHandler)
    .catch(() => onError('An error occurred when subscribing to the workspace.'))
  }
}
const unsubscribeToMessaging = () => {
  for(var i = 4; i < PeersForChannel.length; i++){
  node.pubsub.unsubscribe(PeersForChannel[i] + "PinningChannel_alpha11", exitMessageHandler)
    .catch(() => onError('An error occurred when unsubscribing to the workspace.'))
  }
}
const publishImmediatePin = (hash) => {
    const data = Buffer.from(hash)
    for (var i = 0; i < PeersForChannel.length; i++) {
        var channel = PeersForChannel[i] + "ImmediatePinningChannel_alpha11";
        node.pubsub.publish(channel, data)
            .catch(() => onError('An error occurred when publishing the message.'))
    }
}

/* ===========================================================================
   Files handling
   =========================================================================== */

const isFileInList = (hash) => FILES.indexOf(hash) !== -1

const sendFileList = () => FILES.forEach((hash) => publishHash(hash))

const updateProgress = (bytesLoaded) => {
    let percent = 100 - ((bytesLoaded / fileSize) * 100)
    if (percent <= 5) {
        document.getElementById("upload-confirm-button").style.visibility = "visible";
    }
    $progressBar.style.transform = `translateX(${-percent}%)`
}

const resetProgress = () => {
    $progressBar.style.transform = 'translateX(-100%)'
}

function appendFile(name, hash, size, data) {
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
    link.innerHTML = '<img width=20 class="table-action" src="dashboard/images/download.svg" alt="Download" />'
    downloadCell.appendChild(link)

    row.appendChild(nameCell)
    row.appendChild(hashCell)
    row.appendChild(sizeCell)
    row.appendChild(downloadCell)

    $fileHistory.insertBefore(row, $fileHistory.firstChild)
}

function resetFileTable() {
    while ($fileHistory.hasChildNodes()) {
        $fileHistory.removeChild($fileHistory.firstChild);
    }
}
/* Drag & Drop
   =========================================================================== */

const onDragEnter = (event) => $dragContainer.classList.add('dragging')
const onDragLeave = () => $dragContainer.classList.remove('dragging')

window.startUploadProcess = function() {
    $('#preparingUploadModal').modal('show');
    var streamFinishCount = 0;
    for (var i = 0; i < MainFileArray.length; i++) {
        const streamFiles = (files) => {
            const stream = node.addReadableStream()
            stream.on('data', function(data) {
                GlobalHashArray.push(`${data.hash}`);
                GlobalSizeArray.push(`${data.size}`);
                GlobalPathArray.push(`${data.path}`);
                GlobalUploadHash = `${data.hash}`;
                GlobalUploadPath = `${data.path}`;
                var splitString = GlobalUploadPath.split("/")
                if (splitString.length == 1 || splitString[0] == "") {
                    streamFinishCount++;
                    GlobalMainHashArray.push(`${data.hash}`);
                    GlobalMainPathArray.push(`${data.path}`);
                    if (streamFinishCount == MainFileArray.length) {
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

    const streamFilesExternally = (filesArray, MainHashArray) => {

        var confirmationServers = ["https://ipfsapi.ethofs.com/ipfs/", "https://ipfsapi1.ethofs.com/ipfs/", "https://ipfsapi2.ethofs.com/ipfs/", "https://ipfsapi5.ethofs.com/ipfs/", "https://ipfsapi6.ethofs.com/ipfs/", "https://ipfsapi7.ethofs.com/ipfs/"];
        let hashVerificationArray = [...GlobalHashArray, ...GlobalMainHashArray];
        hashVerificationArray.push(GlobalMainContentHash);
        var hashConfirmationCount = 0;


        for (var i = 0; i < MainHashArray.length; i++) {
            console.log("Sending Immediate Pin Request: " + MainHashArray[i]);
            publishImmediatePin(MainHashArray[i]);
        }
        setTimeout(function() {
            hashVerificationArray.forEach(function(hash) {
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
                    updateUploadProgress(confirmationPercentage);
                    console.log("Data Upload Confirmation Received: " + hashConfirmationCount + "/" + hashVerificationArray.length);
                    $uploadMessage.innerText = "Upload Confirmation Received: " + hashConfirmationCount + "/" + hashVerificationArray.length;
                    if (confirmationPercentage >= 99) {
                        $uploadMessage.innerText = "Upload Complete";
                        document.getElementById("upload-status-message").textContent = "Complete";
                        finishUploadModal();
                    }
                } else {
                    setTimeout(function() {
                        verifyDataUpload(hash)
                    }, 2000);
                }
            } catch (error) {
                console.log(error);
                console.log("Data Confirmation Error: " + error.status);
                setTimeout(function() {
                    verifyDataUpload(hash)
                }, 2000);
            }
        };
    }

    function updateUploadProgress(width) {
        var elem = document.getElementById("myBar");
        width = round(width, 2);
        if (width >= 100) {
            width = 100;
            elem.style.width = width + '%';
            elem.innerHTML = width * 1 + '%';
        }
        elem.style.width = width + '%';
        elem.innerHTML = width * 1 + '%';
    }

    function createMainHash() {
        var contentHashString = GlobalChannelString;
        for (i = 0; i < GlobalMainHashArray.length; i++) {
            contentHashString += ":" + GlobalMainHashArray[i];
        }
        node.add(Buffer.from(contentHashString), (err, res) => {
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

    /*****************************************************************************/
    function AddNewPin(pinToAdd, pinSize, HostingContractName, HostingContractDuration) {
        var contentHashString = GlobalChannelString;
        var contentPathString = GlobalChannelString;
        for (i = 0; i < GlobalMainHashArray.length; i++) {
            contentHashString += ":" + GlobalMainHashArray[i];
            contentPathString += ":" + GlobalMainPathArray[i];
        }
        var MainHashArray = GlobalMainHashArray;
        GlobalUploadName = HostingContractName;
        var contractCost = calculateCost(pinSize, HostingContractDuration, GlobalHostingCostWei);
        var pinAdding = new web3.eth.Contract(GlobalControllerABI, GlobalControllerContractAddress);
        const transactionObject = {
            from: GlobalUserAddress,
            value: contractCost
        };
        $('#preparingUploadModal').modal('hide');
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
                .then(function(signedTransactionData) {
                    console.log("Signed TX Data: " + signedTransactionData.rawTransaction);
                    web3.eth.sendSignedTransaction(signedTransactionData.rawTransaction, function(error, result) {
                        if (!error) {
                            if (result) {
                                console.log("Result: " + result);
                                $('#minedBlockTrackerModal').modal('show');
                                waitForReceipt(result, function(receipt) {
                                    console.log("Transaction Has Been Mined: " + receipt);
                                    $('#minedBlockTrackerModal').modal('hide');
                                    $('#nodeModal').modal('hide');
                                    var filesForStream = MainFileArray;
                                    streamFilesExternally(filesForStream, MainHashArray);
                                    checkForUploadedContentAvailability(HostingContractName);
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
            pinAdding.methods.AddNewContract(GlobalMainContentHash, HostingContractName, HostingContractDuration, pinSize, pinSize, contentHashString, contentPathString).send(transactionObject, function(error, result) {
                if (!error) {
                    if (result) {
                        $('#minedBlockTrackerModal').modal('show');
                        waitForReceipt(result, function(receipt) {
                            console.log("Transaction Has Been Mined: " + receipt);
                            $('#minedBlockTrackerModal').modal('hide');
                            $('#nodeModal').modal('hide');
                            var filesForStream = MainFileArray;
                            streamFilesExternally(filesForStream, MainHashArray);
                            checkForUploadedContentAvailability(HostingContractName);
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
    /*****************************************************************************/
}

function resetUploadProcess() {
    MainFileArray = new Array();
    GlobalUploadSize = 0;
}

function updateAnalyzeProgress(width) {
    var elem = document.getElementById("myAnalyzeBar");
    width = round(width, 2);
    if (width >= 100) {
        width = 100;
        elem.style.width = width + '%';
        elem.innerHTML = width * 1 + '%';
    }
    elem.style.width = width + '%';
    elem.innerHTML = width * 1 + '%';
}

function onFileUpload(event) {
    document.getElementById("upload-hash").textContent = "ANALYZING UPLOAD DATA";
    document.getElementById("upload-confirm-button").style.visibility = "hidden";
    MainFileArray.push([]);
    let filesUploaded = event.target.files;
    var streamCompareCount = filesUploaded.length;
    for (let i = 0; filesUploaded.length > i; i++) {
        handleFile(filesUploaded[i]);
    }

    function readFileContents(file) {
        return new Promise((resolve) => {
            const reader = new window.FileReader()
            reader.onload = (event) => resolve(event.target.result)
            reader.readAsArrayBuffer(file)
        })
    }

    function handleFile(file) {
        readFileContents(file).then((buffer) => {
            var filePath = file.webkitRelativePath;
            var filetowrite = {
                path: filePath,
                content: Buffer.from(buffer)
            };
            MainFileArray[MainFileArray.length - 1].push(filetowrite);
            GlobalUploadSize += Number(file.size);
            fileSize += Number(file.size);
            var totalUploadSizeMB = GlobalUploadSize / 1000000;
            appendFile(filePath, file.name, file.size, null);
            console.log("Path: " + filePath + " Size: " + file.size + " Total Size: " + GlobalUploadSize);
            document.getElementById("upload-size").textContent = totalUploadSizeMB;
            contractDurationChange(document.getElementById('contract-duration').value);
            streamCompareCount--;
            updateAnalyzeProgress(((filesUploaded.length - streamCompareCount) / filesUploaded.length));
            if (streamCompareCount == 0) {
                document.getElementById("upload-hash").textContent = "READY FOR UPLOAD";
                document.getElementById("upload-confirm-button").style.visibility = "visible";
            }
        });
    }
}

function onDrop(event) {
    MainFileArray.push([]);
    document.getElementById("upload-hash").textContent = "ANALYZING UPLOAD DATA";
    document.getElementById("upload-confirm-button").style.visibility = "hidden";
    fileSize = 0;
    resetProgress();
    onDragLeave()
    event.preventDefault()
    if (GlobalUploadHash != "" && GlobalUploadPath != "") {
        GlobalMainHashArray.push(GlobalUploadHash);
        GlobalMainPathArray.push(GlobalUploadPath);
    }
    const dt = event.dataTransfer
    const filesDropped = dt.files
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
                    entry.file(function(file) {
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
                                appendFile(entry.fullPath, entry.name, file.size, null);
                                document.getElementById("upload-size").textContent = totalUploadSizeMB;
                                contractDurationChange(document.getElementById('contract-duration').value);
                                streamCompareCount--;
                                updateAnalyzeProgress(((totalItemCount - streamCompareCount) / totalItemCount));
                                if (streamCompareCount == 0) {
                                    document.getElementById("upload-hash").textContent = "READY FOR UPLOAD";
                                    document.getElementById("upload-confirm-button").style.visibility = "visible";
                                }
                            });
                    });
                }

            } else if (entry.isDirectory) {
                let directoryReader = entry.createReader();
                directoryReader.readEntries(function(entries) {
                    streamCompareCount += entries.length - 1;
                    totalItemCount += entries.length - 1;
                    entries.forEach(function(newEntry) {
                        handleEntry(newEntry);
                    });
                });
            }
        }

    }
    initialHandleItems(event.dataTransfer.items);
}

/* ===========================================================================
   Peers handling
   =========================================================================== */

function connectToPeer(event) {
    const multiaddr = $multiaddrInput.value

    if (!multiaddr) {
        return onError('No multiaddr was inserted.')
    }

    node.swarm.connect(multiaddr)
        .then(() => {
            onSuccess(`Successfully connected to peer.`)
            $multiaddrInput.value = ''
        })
        .catch(() => onError('An error occurred when connecting to the peer.'))
}

function updatePeerProgress(width, peercount) {
    var backgroundcolor = "";
    var elem = document.getElementById("myPeerBar");
    width = round(width, 2);
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

function refreshPeerList() {
    var updatedPeerCount = 0;
    node.swarm.peers()
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
            updatePeerProgress(((updatedPeerCount / 7) * 100), updatedPeerCount)
        })
        .catch((error) => onError(error))
}

/* ===========================================================================
   Error handling
   =========================================================================== */

function onSuccess(msg) {
    $logs.classList.add('success')
    $logs.innerHTML = msg
}

function onError(err) {
    let msg = 'An error occured, check the dev console'

    if (err.stack !== undefined) {
        msg = err.stack
    } else if (typeof err === 'string') {
        msg = err
    }

    $logs.classList.remove('success')
    $logs.innerHTML = msg
}

window.onerror = onError

/* ===========================================================================
   App states
   =========================================================================== */

const states = {
    ready: () => {
        const addressesHtml = info.addresses.map((address) => {
            return `<li><pre>${address}</pre></li>`
        }).join('')
        $nodeId.innerText = info.id
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

function updateView(state, ipfs) {
    if (states[state] !== undefined) {
        states[state]()
    } else {
        throw new Error('Could not find state "' + state + '"')
    }
}
/* ===========================================================================
   Boot the app
   =========================================================================== */
window.startApplication = function() {
    // Setup event listeners
    $dragContainer.addEventListener('dragenter', onDragEnter)
    $dragContainer.addEventListener('dragover', onDragEnter)
    $dragContainer.addEventListener('drop', onDrop)
    $dragContainer.addEventListener('dragleave', onDragLeave)
    document.getElementById("fileUploadButton").addEventListener("change", onFileUpload)
    start()
    extendedStartApplication()
}

function extendedStartApplication() {
    $ethomessage.innerText = GlobalUserAddress;
}
window.stopApplication = function() {
    resetUploadProcess();
    resetFileTable();
}
