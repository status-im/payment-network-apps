const KeycardWalletFactory = require('Embark/contracts/KeycardWalletFactory');

let owner,
  merchant;

config({
  contracts: {
    KeycardWalletFactory: {}
  }
}, (err, _accounts) => {
  owner = _accounts[0];
});


const getErrorReason = (err) => {
  const errors = [];
  for (hash in err.results) {
    errors.push(err.results[hash].reason);
  }

  return errors[0];
}

contract('KeycardWalletFactory', () => {
  it ('create', async () => {
    const zeroAddress = "0x0000000000000000000000000000000000000000";

    const ownerWalletsCountBefore = await KeycardWalletFactory.methods.ownerWalletsCount(owner).call();
    assert.equal(ownerWalletsCountBefore, 0);

    const create = KeycardWalletFactory.methods.create("0x010203", zeroAddress, 0);
    const receipt = await create.send({
      from: owner
    });

    const event = receipt.events.NewWallet;
    const walletAddress = event.returnValues.wallet;
    assert.notEqual(walletAddress, zeroAddress);
    assert.equal(event.returnValues.name, "0x010203", "name in event should be 0x01020304");

    const ownerWalletsCountAfter = await KeycardWalletFactory.methods.ownerWalletsCount(owner).call();
    assert.equal(ownerWalletsCountAfter, 1);
  });
});
