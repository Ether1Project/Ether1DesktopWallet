// Web3 Compatibility Layer
// This file handles the differences between Web3 v1.x and v4.x APIs

// Use global Web3 if available (from CDN or bundle), otherwise try require
let Web3;
try {
    if (typeof window !== 'undefined' && window.Web3) {
        Web3 = window.Web3;
    } else if (typeof require !== 'undefined') {
        const web3Module = require('web3');
        Web3 = web3Module.Web3 || web3Module;
    } else {
        console.error('Web3 not available');
    }
} catch (error) {
    console.error('Failed to load Web3:', error);
}

class Web3CompatibilityLayer {
    constructor() {
        this.web3Instance = null;
        this.isV4 = true; // We're using Web3 v4
    }

    initializeWeb3(provider) {
        try {
            if (typeof provider === 'string') {
                if (provider.startsWith('ws://') || provider.startsWith('wss://')) {
                    this.web3Instance = new Web3(new Web3.providers.WebsocketProvider(provider));
                } else {
                    this.web3Instance = new Web3(new Web3.providers.HttpProvider(provider));
                }
            } else {
                this.web3Instance = new Web3(provider);
            }

            // Create compatibility wrapper
            this.createCompatibilityWrapper();
            return true;
        } catch (error) {
            console.error('Failed to initialize Web3:', error);
            return false;
        }
    }

    createCompatibilityWrapper() {
        if (!this.web3Instance) return;

        // Wrap methods to maintain v1.x-like API for existing code
        const originalEth = this.web3Instance.eth;

        // Wrap getBalance to handle both callback and promise patterns
        this.web3Instance.eth.getBalance = (address, callback) => {
            if (callback) {
                originalEth.getBalance(address)
                    .then(balance => callback(null, balance))
                    .catch(error => callback(error, null));
            } else {
                return originalEth.getBalance(address);
            }
        };

        // Wrap getBlock
        this.web3Instance.eth.getBlock = (blockHashOrNumber, includeTransactions, callback) => {
            if (typeof includeTransactions === 'function') {
                callback = includeTransactions;
                includeTransactions = false;
            }
            
            if (callback) {
                originalEth.getBlock(blockHashOrNumber, includeTransactions)
                    .then(block => callback(null, block))
                    .catch(error => callback(error, null));
            } else {
                return originalEth.getBlock(blockHashOrNumber, includeTransactions);
            }
        };

        // Wrap getTransaction
        this.web3Instance.eth.getTransaction = (transactionHash, callback) => {
            if (callback) {
                originalEth.getTransaction(transactionHash)
                    .then(transaction => callback(null, transaction))
                    .catch(error => callback(error, null));
            } else {
                return originalEth.getTransaction(transactionHash);
            }
        };

        // Wrap getTransactionCount
        this.web3Instance.eth.getTransactionCount = (address, blockParameter, callback) => {
            if (typeof blockParameter === 'function') {
                callback = blockParameter;
                blockParameter = 'latest';
            }

            if (callback) {
                originalEth.getTransactionCount(address, blockParameter)
                    .then(count => callback(null, count))
                    .catch(error => callback(error, null));
            } else {
                return originalEth.getTransactionCount(address, blockParameter);
            }
        };

        // Wrap estimateGas
        this.web3Instance.eth.estimateGas = (transactionObject, callback) => {
            if (callback) {
                originalEth.estimateGas(transactionObject)
                    .then(gas => callback(null, gas))
                    .catch(error => callback(error, null));
            } else {
                return originalEth.estimateGas(transactionObject);
            }
        };

        // Wrap getGasPrice
        this.web3Instance.eth.getGasPrice = (callback) => {
            if (callback) {
                originalEth.getGasPrice()
                    .then(gasPrice => callback(null, gasPrice))
                    .catch(error => callback(error, null));
            } else {
                return originalEth.getGasPrice();
            }
        };

        // Wrap getAccounts
        this.web3Instance.eth.getAccounts = (callback) => {
            if (callback) {
                originalEth.getAccounts()
                    .then(accounts => callback(null, accounts))
                    .catch(error => callback(error, null));
            } else {
                return originalEth.getAccounts();
            }
        };

        // Wrap sendSignedTransaction
        this.web3Instance.eth.sendSignedTransaction = (signedTransactionData, callback) => {
            if (callback) {
                originalEth.sendSignedTransaction(signedTransactionData)
                    .then(receipt => callback(null, receipt))
                    .catch(error => callback(error, null));
            } else {
                return originalEth.sendSignedTransaction(signedTransactionData);
            }
        };

        // Net API compatibility
        if (!this.web3Instance.eth.net) {
            this.web3Instance.eth.net = {};
        }

        this.web3Instance.eth.net.isListening = (callback) => {
            if (callback) {
                this.web3Instance.net.isListening()
                    .then(result => callback(null, result))
                    .catch(error => callback(error, null));
            } else {
                return this.web3Instance.net.isListening();
            }
        };

        this.web3Instance.eth.net.getPeerCount = (callback) => {
            if (callback) {
                this.web3Instance.net.getPeerCount()
                    .then(count => callback(null, count))
                    .catch(error => callback(error, null));
            } else {
                return this.web3Instance.net.getPeerCount();
            }
        };

        // Personal API replacement (removed in Web3 v4)
        this.web3Instance.eth.personal = {
            unlockAccount: (address, password, callback) => {
                // Personal API is not available in modern Web3
                // For light wallet mode, we'll handle this differently
                if (callback) {
                    callback(new Error('Personal API not available in light wallet mode. Use private key signing instead.'), false);
                } else {
                    return Promise.reject(new Error('Personal API not available in light wallet mode. Use private key signing instead.'));
                }
            },
            newAccount: (password, callback) => {
                // For light wallet, we need to generate accounts client-side
                try {
                    const account = this.web3Instance.eth.accounts.create();
                    if (callback) {
                        callback(null, account.address);
                    } else {
                        return Promise.resolve(account.address);
                    }
                } catch (error) {
                    if (callback) {
                        callback(error, null);
                    } else {
                        return Promise.reject(error);
                    }
                }
            },
            importRawKey: (privateKey, password, callback) => {
                // For light wallet, validate and return the account
                try {
                    const account = this.web3Instance.eth.accounts.privateKeyToAccount(privateKey);
                    if (callback) {
                        callback(null, account.address);
                    } else {
                        return Promise.resolve(account.address);
                    }
                } catch (error) {
                    if (callback) {
                        callback(error, null);
                    } else {
                        return Promise.reject(error);
                    }
                }
            }
        };

        // Add signTransaction compatibility
        this.web3Instance.eth.signTransaction = (transactionObject, privateKey, callback) => {
            try {
                if (typeof privateKey === 'function') {
                    // If called with (tx, callback) - no private key provided
                    callback = privateKey;
                    callback(new Error('Private key required for transaction signing in light wallet mode'), null);
                    return;
                }

                const signedTx = this.web3Instance.eth.accounts.signTransaction(transactionObject, privateKey);
                if (callback) {
                    signedTx
                        .then(signed => callback(null, signed))
                        .catch(error => callback(error, null));
                } else {
                    return signedTx;
                }
            } catch (error) {
                if (callback) {
                    callback(error, null);
                } else {
                    return Promise.reject(error);
                }
            }
        };
    }

    getWeb3Instance() {
        return this.web3Instance;
    }
}

// Global instance
const web3Compatibility = new Web3CompatibilityLayer();
