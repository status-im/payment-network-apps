#!/usr/bin/env node

import Web3 from 'web3';
import parseArgs from 'minimist';

const factoryABI = [{"constant":false,"inputs":[{"name":"_wallet","type":"address"},{"name":"_keycard","type":"address"}],"name":"unregisterFromOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x25a6e9a1"},{"constant":false,"inputs":[{"name":"_oldOwner","type":"address"},{"name":"_newOwner","type":"address"}],"name":"setOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x299a7bcc"},{"constant":false,"inputs":[{"name":"_oldKeycard","type":"address"},{"name":"_newKeycard","type":"address"}],"name":"setKeycard","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x4349c8bc"},{"constant":false,"inputs":[{"name":"_owner","type":"address"},{"name":"_keycard","type":"address"}],"name":"unregister","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x4a45b60b"},{"constant":false,"inputs":[{"name":"keycard","type":"address"},{"components":[{"name":"maxTxValue","type":"uint256"},{"name":"minBlockDistance","type":"uint256"}],"name":"settings","type":"tuple"},{"name":"keycardIsOwner","type":"bool"}],"name":"create","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x5213737f"},{"constant":true,"inputs":[{"name":"owner","type":"address"}],"name":"countWalletsForOwner","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x624de70e"},{"constant":false,"inputs":[{"name":"_owner","type":"address"},{"name":"_keycard","type":"address"}],"name":"register","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0xaa677354"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"keycardsWallets","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function","signature":"0xcf7661b9"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"uint256"}],"name":"ownersWallets","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function","signature":"0xde59dda1"},{"anonymous":false,"inputs":[{"indexed":false,"name":"wallet","type":"address"}],"name":"NewWallet","type":"event","signature":"0xd627a1aeb13261b560c345aaf7d003d55a27193b9284c0b941f53cd62a045f16"}];
const argv = parseArgs(process.argv.slice(2), {string: ["registry", "keycard"], default: {"endpoint": "ws://127.0.0.1:8546", "registry": "0x49307b9867f4e1C48c40f9563c96627390307CF2", "maxTxValue": 1, "minBlockDistance": 5}});

const web3 = new Web3(argv["endpoint"]);
const KeycardWalletFactory = new web3.eth.Contract(factoryABI, argv["registry"]);

async function getDefaultSender() {
    let accounts = await web3.eth.getAccounts();
    return accounts[0];
}

async function createWallet(sender, keycard, maxTxValue, minBlockDistance) {
    let methodCall = KeycardWalletFactory.methods.create(keycard, {maxTxValue: maxTxValue, minBlockDistance: minBlockDistance}, true);

    methodCall.estimateGas({from: sender})
    .then((gasAmount) => {
        methodCall.send({from: sender, gas: gasAmount}).then(() => {
            console.log("tx sent");
        }).catch((error) => {
            console.log(error);
        });
    })
    .catch((error) => {
        console.log(error);
    });    
}

async function run() {
    let sender = argv["sender"] || await getDefaultSender();
    
    let keycards;

    if (argv["file"]) {

    } else if (argv["keycard"]) {
        keycards = [argv["keycard"]]
    } else {
        console.log("either a file or a keycard address must be supplied");
        process.exit(1);
    }

    let walletAddresses = keycards.map((keycard) => {
        createWallet(sender, keycard, argv["maxTxValue"], argv["minBlockDistance"]);
    });
    
}

run();
