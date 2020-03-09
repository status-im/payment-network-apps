#!/usr/bin/env node

import Web3 from 'web3';
import parseArgs from 'minimist';
import fs from 'fs';

const factoryABI = [{"constant":false,"inputs":[{"name":"_wallet","type":"address"},{"name":"_keycard","type":"address"}],"name":"unregisterFromOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_oldOwner","type":"address"},{"name":"_newOwner","type":"address"}],"name":"setOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_oldKeycard","type":"address"},{"name":"_newKeycard","type":"address"}],"name":"setKeycard","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_owner","type":"address"},{"name":"_keycard","type":"address"}],"name":"unregister","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"}],"name":"countWalletsForOwner","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_keycard","type":"address"},{"name":"_keycardIsOwner","type":"bool"},{"name":"_minBlockDistance","type":"uint256"},{"name":"_txMaxAmount","type":"uint256"}],"name":"create","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_owner","type":"address"},{"name":"_keycard","type":"address"}],"name":"register","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"keycardsWallets","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"uint256"}],"name":"ownersWallets","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"currency","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_currency","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"wallet","type":"address"}],"name":"NewWallet","type":"event"}];
const argv = parseArgs(process.argv.slice(2), {boolean: ["deploy-registry"], string: ["registry", "keycard", "token"], default: {"endpoint": "ws://127.0.0.1:8546", "minBlockDistance": 5, "tokenMaxTxValue": 10000000000000}});

const web3 = new Web3(argv["endpoint"]);
const KeycardWalletFactory = new web3.eth.Contract(factoryABI, argv["registry"]);
const STDOUT = 1;

async function getDefaultSender() {
    let accounts = await web3.eth.getAccounts();
    return accounts[0];
}

function loadAccount(account, passfile) {
    let json = fs.readFileSync(account, "utf-8");
    let pass = fs.readFileSync(passfile, "utf-8").split("\n")[0].replace("\r", "");
    return web3.eth.accounts.decrypt(json, pass);
}

async function sendMethod(methodCall, sender, to) {
    let receipt;

    if (typeof(sender) == "string") {
        let gasAmount = await methodCall.estimateGas({from: sender});
        receipt = await methodCall.send({from: sender, gas: gasAmount});
    } else {
        let gasAmount = await methodCall.estimateGas({from: sender.address});
        let data = methodCall.encodeABI();
        let signedTx = await sender.signTransaction({to: to, data: data, gas: gasAmount});
        receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    }   
    
    return receipt;
}

async function createWallet(sender, keycard, minBlockDistance, tokenMaxTxValue) {
    let methodCall = KeycardWalletFactory.methods.create(keycard.toLowerCase(), true, minBlockDistance, tokenMaxTxValue);
    
    try {
        let receipt = await sendMethod(methodCall, sender, KeycardWalletFactory.options.address);
        const event = receipt.events.NewWallet;
        return event.returnValues.wallet;
    } catch(err) {
        console.error(err);
        return null;
    }
}

async function deployRegistry(sender, code, token) {
    let methodCall = KeycardWalletFactory.deploy({data: "0x" + code, arguments: [token]});
    let receipt = await sendMethod(methodCall, sender, null);
    return receipt.contractAddress;
}

async function run() {
    KeycardWalletFactory.transactionConfirmationBlocks = 3;
    
    let sender;

    if (argv["account"]) {
        if (!argv["passfile"]) {
            console.error("the ---passfile option must be specified when using the --account option");
            process.exit(1);
        }

        if (argv["sender"]) {
            console.warn("--account used, --sender will be ignored");
        }

        sender = loadAccount(argv["account"], argv["passfile"]);
    } else {
        sender = argv["sender"] || await getDefaultSender();
    }

    if (argv["deploy-registry"]) {
        if (!argv["code"]) {
            console.error("the --code option must be specified");
            process.exit(1);
        }

        if (!argv["token"]) {
            console.error("the --token option must be specified");
            process.exit(1);
        }

        let code = fs.readFileSync(argv["code"], 'utf8').trim();
        let registry = await deployRegistry(sender, code, argv["token"]);
        console.log("Registry deployed at: " + registry);
    } else {
        let keycards;

        if (argv["file"]) {
            let file = fs.readFileSync(argv["file"], 'utf8');
            keycards = file.split("\n").map((addr) => addr.trim());
        } else if (argv["keycard"]) {
            keycards = [argv["keycard"]]
        } else {
            console.error("either the --file or the --keycard option must be specified");
            process.exit(1);
        }
    
        if (!argv["registry"]) {
            console.error("the --registry option must be specified");
            process.exit(1);
        }    
    
        let walletAddresses = await Promise.all(keycards.map((keycard) => createWallet(sender, keycard, argv["minBlockDistance"], argv["tokenMaxTxValue"])));
        let zippedAddresses = keycards.map((keycard, i) => [keycard, walletAddresses[i]]);
    
        let fid;
        if (argv["out"]) {
            fid = fs.openSync(argv["out"], "w", o0644);
        } else {
            fid = STDOUT;
        }
    
        zippedAddresses.forEach((tuple) => fs.writeSync(fid, `${tuple[0]},${tuple[1]}\n`));
    
        fs.close(fid);
    }

    process.exit(0);
}

run();
