// Light Wallet Transaction Handler
// Handles transaction signing and sending for light wallet mode

class LightWalletTransactionHandler {
    constructor() {
        this.privateKeys = new Map(); // Store private keys temporarily
    }

    // Store private key temporarily for transaction signing
    setPrivateKey(address, privateKey) {
        // Remove 0x prefix if present
        const cleanPrivateKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
        this.privateKeys.set(address.toLowerCase(), cleanPrivateKey);
    }

    // Remove stored private key
    clearPrivateKey(address) {
        this.privateKeys.delete(address.toLowerCase());
    }

    // Clear all stored private keys
    clearAllPrivateKeys() {
        this.privateKeys.clear();
    }

    // Sign and send transaction
    async signAndSendTransaction(fromAddress, toAddress, value, gasLimit, gasPrice, password = null) {
        try {
            const privateKey = this.privateKeys.get(fromAddress.toLowerCase());
            if (!privateKey) {
                throw new Error('Private key not found for address. Please unlock the account first.');
            }

            // Get nonce
            const nonce = await web3Local.eth.getTransactionCount(fromAddress, 'pending');
            
            // Convert value to wei
            const amountToSend = web3Local.utils.toWei(value.toString(), "ether");

            // Create transaction object
            const transactionObject = {
                from: fromAddress,
                to: toAddress,
                value: amountToSend,
                gas: gasLimit,
                gasPrice: gasPrice,
                nonce: nonce
            };

            // Sign transaction
            const signedTransaction = await web3Local.eth.accounts.signTransaction(
                transactionObject, 
                '0x' + privateKey
            );

            // Send signed transaction
            const receipt = await web3Local.eth.sendSignedTransaction(signedTransaction.rawTransaction);
            
            return receipt;
        } catch (error) {
            throw error;
        }
    }

    // Estimate gas for transaction
    async estimateTransactionGas(fromAddress, toAddress, value) {
        try {
            const amountToSend = web3Local.utils.toWei(value.toString(), "ether");
            
            const transactionObject = {
                from: fromAddress,
                to: toAddress,
                value: amountToSend
            };

            const gasEstimate = await web3Local.eth.estimateGas(transactionObject);
            const gasPrice = await web3Local.eth.getGasPrice();
            
            return {
                gasEstimate: gasEstimate,
                gasPrice: gasPrice,
                totalFee: (BigInt(gasEstimate) * BigInt(gasPrice)).toString()
            };
        } catch (error) {
            throw error;
        }
    }

    // Create new account (for light wallet)
    createNewAccount() {
        try {
            const account = web3Local.eth.accounts.create();
            return {
                address: account.address,
                privateKey: account.privateKey
            };
        } catch (error) {
            throw error;
        }
    }

    // Import account from private key
    importAccountFromPrivateKey(privateKey) {
        try {
            // Ensure private key has 0x prefix
            const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : '0x' + privateKey;
            const account = web3Local.eth.accounts.privateKeyToAccount(formattedPrivateKey);
            
            return {
                address: account.address,
                privateKey: formattedPrivateKey
            };
        } catch (error) {
            throw error;
        }
    }

    // Validate private key format
    isValidPrivateKey(privateKey) {
        try {
            const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : '0x' + privateKey;
            web3Local.eth.accounts.privateKeyToAccount(formattedPrivateKey);
            return true;
        } catch (error) {
            return false;
        }
    }

    // Get connection mode to determine transaction handling method
    getConnectionMode() {
        try {
            if (typeof require !== 'undefined') {
                const { ipcRenderer } = require('electron');
                return ipcRenderer.sendSync("getConnectionMode");
            } else {
                return 'rpc'; // Default to RPC if can't determine
            }
        } catch (error) {
            return 'rpc'; // Default to RPC if can't determine
        }
    }
}

// Global instance
const lightWalletHandler = new LightWalletTransactionHandler();
