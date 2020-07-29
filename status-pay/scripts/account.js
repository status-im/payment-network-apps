const fs = require('fs');
const { ethers } = require("ethers");
const ethSigUtil = require('eth-sig-util');

const NUTBERRY_TX_TYPED_DATA = {
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
    ],
    Transaction: [
      { name: 'to', type: 'address' },
      { name: 'nonce', type: 'uint256' },
      { name: 'data', type: 'bytes' },
    ],
  },
  primaryType: 'Transaction',
  domain: {
    name: 'NutBerry',
    version: '2',
  },
};

module.exports = class Account {
  constructor(rpcURL) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcURL);
    this.sender = null;
    this.senderAddress = null;
  }

  async init(account, passfile) {
    this.sender = await this.loadAccount(account, passfile);
    this.senderAddress = await this.sender.getAddress();
  }

  async loadAccount(account, passfile) {
    let json = fs.readFileSync(account, "utf-8");
    let pass = fs.readFileSync(passfile, "utf-8").split("\n")[0].replace("\r", "");
    return await ethers.Wallet.fromEncryptedJson(json, pass);
  }

  async sendDataTx(to, data) {
    let signedTx = this.signTransaction({
      to: to,
      data: data,
      nonce: await this.provider.getTransactionCount(this.senderAddress, 'pending')
    });

    let txHash = await this.provider.send('eth_sendRawTransaction', [signedTx]);
    return await this.provider.getTransactionReceipt(txHash);
  }

  encodeTx(tx) {
    function arrayify (val) {
      let v = val;

      if (typeof v === 'number' || typeof v === 'bigint') {
        v = v.toString(16);
        if (v.length % 2) {
          v = `0x0${v}`;
        } else {
          v = `0x${v}`;
        }
      }

      return Array.from(ethers.utils.arrayify(v));
    }

    const nonceBytes = arrayify(tx.nonce);
    const calldataBytes = arrayify(tx.data);
    let enc = arrayify(tx.v)
      .concat(arrayify(tx.r))
      .concat(arrayify(tx.s));

    if (nonceBytes.length > 1 || nonceBytes[0] > 0xde) {
      enc.push(0xff - nonceBytes.length);
      enc = enc.concat(nonceBytes);
    } else {
      enc = enc.concat(nonceBytes);
    }

    enc = enc.concat(arrayify(tx.to));

    if (calldataBytes.length >= 0xff) {
      enc.push(0xff);
      enc.push(calldataBytes.length >> 8);
      enc.push(calldataBytes.length & 0xff);
    } else {
      enc.push(calldataBytes.length);
    }

    return ethers.utils.hexlify(enc.concat(calldataBytes));
  }

  signTransaction(tx) {
    const sig = this.signTypedData(tx, NUTBERRY_TX_TYPED_DATA);
    const { r, s, v } = ethers.utils.splitSignature(sig);

    return encodeTx(Object.assign(tx, { r, s, v: v + 101 }));
  }

  signTypedData(message, typeInfo) {
    const obj = Object.assign({ message: message }, typeInfo);
    return ethSigUtil.signTypedData(this.sender.privateKey, { data: obj });
  }
}
