#!/usr/bin/env node

import Web3 from 'web3';
import parseArgs from 'minimist';
import fs from 'fs';

const factoryABI = [{"constant":false,"inputs":[{"name":"_wallet","type":"address"},{"name":"_keycard","type":"address"}],"name":"unregisterFromOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x25a6e9a1"},{"constant":false,"inputs":[{"name":"_oldOwner","type":"address"},{"name":"_newOwner","type":"address"}],"name":"setOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x299a7bcc"},{"constant":false,"inputs":[{"name":"_oldKeycard","type":"address"},{"name":"_newKeycard","type":"address"}],"name":"setKeycard","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x4349c8bc"},{"constant":false,"inputs":[{"name":"_owner","type":"address"},{"name":"_keycard","type":"address"}],"name":"unregister","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x4a45b60b"},{"constant":false,"inputs":[{"name":"keycard","type":"address"},{"components":[{"name":"maxTxValue","type":"uint256"},{"name":"minBlockDistance","type":"uint256"}],"name":"settings","type":"tuple"},{"name":"keycardIsOwner","type":"bool"}],"name":"create","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x5213737f"},{"constant":true,"inputs":[{"name":"owner","type":"address"}],"name":"countWalletsForOwner","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x624de70e"},{"constant":false,"inputs":[{"name":"_owner","type":"address"},{"name":"_keycard","type":"address"}],"name":"register","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0xaa677354"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"keycardsWallets","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function","signature":"0xcf7661b9"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"uint256"}],"name":"ownersWallets","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function","signature":"0xde59dda1"},{"anonymous":false,"inputs":[{"indexed":false,"name":"wallet","type":"address"}],"name":"NewWallet","type":"event","signature":"0xd627a1aeb13261b560c345aaf7d003d55a27193b9284c0b941f53cd62a045f16"}];
const argv = parseArgs(process.argv.slice(2), {string: ["registry", "keycard"], default: {"endpoint": "ws://127.0.0.1:8546", "maxTxValue": 100000000, "minBlockDistance": 5}});

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

async function createWallet(sender, keycard, maxTxValue, minBlockDistance) {
    let methodCall = KeycardWalletFactory.methods.create(keycard.toLowerCase(), {maxTxValue: maxTxValue, minBlockDistance: minBlockDistance}, true);
    
    try {
        let receipt;
        
        if (typeof(sender) == "string") {
            let gasAmount = await methodCall.estimateGas({from: sender});
            receipt = await methodCall.send({from: sender, gas: gasAmount});
        } else {
            let gasAmount = await methodCall.estimateGas({from: sender.address});
            let data = methodCall.encodeABI();
            let signedTx = await sender.signTransaction({to: KeycardWalletFactory.options.address, data: data, gas: gasAmount});
            receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        }

        const event = receipt.events.NewWallet;
        return event.returnValues.wallet;
    } catch(err) {
        console.error(err);
        return null;
    }
}

async function run() {
    KeycardWalletFactory.transactionConfirmationBlocks = 3;
    
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
        console.error("the ---registry option must be specified");
        process.exit(1);
    }

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

    let walletAddresses = await Promise.all(keycards.map((keycard) => createWallet(sender, keycard, argv["maxTxValue"], argv["minBlockDistance"])));
    let zippedAddresses = keycards.map((keycard, i) => [keycard, walletAddresses[i]]);

    let fid;
    if (argv["out"]) {
        fid = fs.openSync(argv["out"], "w", o0644);
    } else {
        fid = STDOUT;
    }

    zippedAddresses.forEach((tuple) => fs.writeSync(fid, `${tuple[0]},${tuple[1]}\n`));

    fs.close(fid);
    process.exit(0);
}

run();
