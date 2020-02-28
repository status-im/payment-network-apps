const KeycardWalletFactory = require('Embark/contracts/KeycardWalletFactory');
const KeycardWallet = require('Embark/contracts/KeycardWallet');
const EmbarkJS = require('Embark/EmbarkJS');
const { getErrorReason } = require('./utils');

let owner, owner2;

config({
  contracts: {
    KeycardWalletFactory: {}
  }
}, (err, _accounts) => {
  owner = _accounts[0];
  owner2 = _accounts[1];
});


contract('KeycardWalletFactory', () => {
  it ('create', async () => {
    const keycard = "0x0000000000000000000000000000000000000001";

    const create = KeycardWalletFactory.methods.create(keycard, {maxTxValue: 999, minBlockDistance: 1}, false, "0x0000000000000000000000000000000000000000", 0);
    const receipt = await create.send({
      from: owner
    });

    const event = receipt.events.NewWallet;
    const walletAddress = event.returnValues.wallet;
    assert.notEqual(walletAddress, keycard);

    assert.equal(await KeycardWalletFactory.methods.ownersWallets(owner, 0).call(), walletAddress);
    assert.equal(await KeycardWalletFactory.methods.keycardsWallets(keycard).call(), walletAddress);
  });

  it ('create (keycard is owner)', async () => {
    const keycard = "0x0000000000000000000000000000000000000002";
    assert.equal(await KeycardWalletFactory.methods.countWalletsForOwner(keycard).call(), 0);

    const create = KeycardWalletFactory.methods.create(keycard, {maxTxValue: 999, minBlockDistance: 1}, true, "0x0000000000000000000000000000000000000000", 0);
    const receipt = await create.send({
      from: owner
    });

    const event = receipt.events.NewWallet;
    const walletAddress = event.returnValues.wallet;
    assert.notEqual(walletAddress, keycard);

    assert.equal(await KeycardWalletFactory.methods.countWalletsForOwner(keycard).call(), 1);
    assert.equal(await KeycardWalletFactory.methods.ownersWallets(keycard, 0).call(), walletAddress);
    assert.equal(await KeycardWalletFactory.methods.keycardsWallets(keycard).call(), walletAddress);
  });

  it ('create fails if keycard already has a wallet', async () => {
    const keycard = "0x0000000000000000000000000000000000000002";

    try {
      const create = KeycardWalletFactory.methods.create(keycard, {maxTxValue: 999, minBlockDistance: 1}, false, "0x0000000000000000000000000000000000000000", 0);
      const receipt = await create.send({
        from: owner2
      });

      assert.fail("should have failed")
    } catch (err) {
      assert.equal(getErrorReason(err), "the keycard is already associated to a wallet");
    }
  });

  it ('unregisterFromOwner', async () => {
    assert.equal(await KeycardWalletFactory.methods.countWalletsForOwner(owner).call(), 1);

    const walletAddress = await KeycardWalletFactory.methods.ownersWallets(owner, 0).call();
    const unregisterFromOwner = KeycardWalletFactory.methods.unregisterFromOwner(walletAddress, "0x0000000000000000000000000000000000000001");
    const receipt = await unregisterFromOwner.send({
      from: owner
    });

    assert.equal(await KeycardWalletFactory.methods.countWalletsForOwner(owner).call(), 0);
    assert.equal(await KeycardWalletFactory.methods.keycardsWallets("0x0000000000000000000000000000000000000001").call(), "0x0000000000000000000000000000000000000000");
  });
});
