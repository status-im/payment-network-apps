const KeycardWalletFactory = require('Embark/contracts/KeycardWalletFactory');
const { getErrorReason } = require('./utils');

let owner;

config({
  contracts: {
    KeycardWalletFactory: {}
  }
}, (err, _accounts) => {
  owner = _accounts[0];
});


contract('KeycardWalletFactory', () => {
  it ('create', async () => {
    const zeroAddress = "0x0000000000000000000000000000000000000000";

    const ownerWalletsCountBefore = await KeycardWalletFactory.methods.ownerWalletsCount(owner).call();
    assert.equal(ownerWalletsCountBefore, 0);

    const create = KeycardWalletFactory.methods.create(zeroAddress, {maxTxValue: 999, minBlockDistance: 1});
    const receipt = await create.send({
      from: owner
    });

    const event = receipt.events.NewWallet;
    const walletAddress = event.returnValues.wallet;
    assert.notEqual(walletAddress, zeroAddress);

    const ownerWalletsCountAfter = await KeycardWalletFactory.methods.ownerWalletsCount(owner).call();
    assert.equal(ownerWalletsCountAfter, 1);
  });
});
