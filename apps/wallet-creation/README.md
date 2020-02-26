## Wallet Creation Script

This script is an easy way to create KeycardWallet instances for the payment network. Wallets can be created in batches.

## Installation

`npm install`

## Usage

You launch the script with either

`node -r esm index.js <options>`

or

`npm run wallet-creation -- <options>` (the -- is required so all other options are sent to the script and not to npm)

The only required options are

`--registry 0x...`: the address of the KeycardWalletFactory

and then either

`--keycard 0x...`: the address of the Keycard to associate to the wallet

or

`--file path`: the path to a file containing a list of Keycard addresses, one per line

Other options are
`--endpoint`: the address of the RPC endpoint. The client as an empty origin so make sure to start the Ethereum node as needed. For ws, you can just start it with --wsorigins="*". The default value is ws://127.0.0.1:8546.

`--sender`: the address signing and sending the transactions. This account will pay for gas. **THIS ACCOUNT MUST BE ALREADY UNLOCKED**. If not specified, accounts[0] is used. Also in this case, the account must be unlocked. Ignored if --account is used.

`--account`: the path to a JSON encoded private key. If this is specified, sender will be ignored. Use this if your endpoint is Infura or similar. You do not need a local node in this case. You also need to specify --passfile.

`--passfile`: the path to a file storing the password for the JSON encoded private key. Always used with --account.

`--maxTxValue`: the maxTxValue for payment transaction. This can be changed later but providing a meaningful value on creation can be convenient. Defaults to 100000000.

`--minBlockDistance`: how many blocks must elapse between two consecutive payments. This solves the possible attack of having the Keycard sign several transactions at once. The higher the value, the more time must pass between transactions. This can be changed later too. Defaults to 5.

`--out path`: the path to the output file to use. The output is a list containing the keycard addresses and their respective wallet address. The two addresses are separated by a comma and are stored one record per line. If there was an error during the creation of a wallet null will be printed as the wallet address. If not specified, the output will be printed on console.

## Notes

Creating the wallets is very fast, but printing the output files must wait for receipts. Depending on the network this might take a lot of time. You can kill the script after confirming that the tx are fine on Etherscan and you are not interested in the output.