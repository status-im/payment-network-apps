const KeycardWalletFactory = require('Embark/contracts/KeycardWalletFactory');
const KeycardWallet = require('Embark/contracts/KeycardWallet');
const EmbarkJS = require('Embark/EmbarkJS');
const { getErrorReason } = require('./utils');

let owner, owner2;

config({
  contracts: {
    KeycardWalletFactory: {args:["0x00000000000000000000000000000000000000ff"]}
  }
}, (err, _accounts) => {
  owner = _accounts[0];
  owner2 = _accounts[1];
});


contract('KeycardWalletFactory', () => {
  it ('create', async () => {
    const keycard = "0x0000000000000000000000000000000000000001";

    const create = KeycardWalletFactory.methods.create(keycard, false, 1, 0);
    const receipt = await create.send({
      from: owner
    });

    const event = receipt.events.NewWallet;
    const walletAddress = event.returnValues.wallet;
    assert.notEqual(walletAddress, keycard);

    assert.equal(await KeycardWalletFactory.methods.keycardsWallets(keycard).call(), walletAddress);
  });

  it ('create (keycard is owner)', async () => {
    const keycard = "0x0000000000000000000000000000000000000002";

    const create = KeycardWalletFactory.methods.create(keycard, true, 1, 0);
    const receipt = await create.send({
      from: owner
    });

    const event = receipt.events.NewWallet;
    const walletAddress = event.returnValues.wallet;
    assert.notEqual(walletAddress, keycard);

    assert.equal(await KeycardWalletFactory.methods.keycardsWallets(keycard).call(), walletAddress);
  });

  it ('create fails if keycard already has a wallet', async () => {
    const keycard = "0x0000000000000000000000000000000000000002";

    try {
      const create = KeycardWalletFactory.methods.create(keycard, false, 1, 0);
      const receipt = await create.send({
        from: owner2
      });

      assert.fail("should have failed")
    } catch (err) {
      assert.equal(getErrorReason(err), "the keycard is already associated to a wallet");
    }
  });
});
