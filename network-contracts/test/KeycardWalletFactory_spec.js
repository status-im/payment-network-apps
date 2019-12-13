const KeycardWalletFactory = require('Embark/contracts/KeycardWalletFactory');
const KeycardWallet = require('Embark/contracts/KeycardWallet');
const EmbarkJS = require('Embark/EmbarkJS');


let owner, owner2;

config({
  contracts: {
    KeycardWalletFactory: {}
  }
}, (err, _accounts) => {
  owner = _accounts[0];
  owner2 = _accounts[1];
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
    const keycard = "0x0000000000000000000000000000000000000001";

    const create = KeycardWalletFactory.methods.create(keycard, {maxTxValue: 999, minBlockDistance: 1}, false);
    const receipt = await create.send({
      from: owner
    });

    const event = receipt.events.NewWallet;
    const walletAddress = event.returnValues.wallet;
    assert.notEqual(walletAddress, keycard);

    assert.equal(await KeycardWalletFactory.methods.ownersWallets(owner).call(), walletAddress);
    assert.equal(await KeycardWalletFactory.methods.keycardsWallets(keycard).call(), walletAddress);
  });

  it ('create (keycard is owner)', async () => {
    const keycard = "0x0000000000000000000000000000000000000002";

    const create = KeycardWalletFactory.methods.create(keycard, {maxTxValue: 999, minBlockDistance: 1}, true);
    const receipt = await create.send({
      from: owner
    });

    const event = receipt.events.NewWallet;
    const walletAddress = event.returnValues.wallet;
    assert.notEqual(walletAddress, keycard);

    assert.equal(await KeycardWalletFactory.methods.ownersWallets(keycard).call(), walletAddress);
    assert.equal(await KeycardWalletFactory.methods.keycardsWallets(keycard).call(), walletAddress);
  });

  it ('create fails if owner/keycard already has a wallet', async () => {
    const keycard = "0x0000000000000000000000000000000000000002";

    try {
      const create = KeycardWalletFactory.methods.create(keycard, {maxTxValue: 999, minBlockDistance: 1}, false);
      const receipt = await create.send({
        from: owner2
      });
    
      assert.fail("should have failed")
    } catch (err) {
      assert.equal(getErrorReason(err), "the keycard is already associated to a wallet");
    }

    try {
      const create = KeycardWalletFactory.methods.create(keycard, {maxTxValue: 999, minBlockDistance: 1}, true);
      const receipt = await create.send({
        from: owner
      });
    
      assert.fail("should have failed")
    } catch (err) {
      assert.equal(getErrorReason(err), "the owner already has a wallet");
    }
  }); 
  
  it ('setOwner fails if no wallet is present', async () => {
    try {
      const setOwner = KeycardWalletFactory.methods.setOwner(owner);
      const receipt = await setOwner.send({
        from: owner2
      });
      assert.fail("should have failed");
    } catch (err) {
      assert.equal(getErrorReason(err), "the sender has no wallet");
    }
  });  
  
  it ('setOwner fails if new owner already has a wallet', async () => {
    try {
      const setOwner = KeycardWalletFactory.methods.setOwner("0x0000000000000000000000000000000000000002");
      const receipt = await setOwner.send({
        from: owner
      });
      assert.fail("should have failed");
    } catch (err) {
      assert.equal(getErrorReason(err), "the new owner already has a wallet");
    }
  });  
  
  it ('setOwner', async () => {
    const wallet = await KeycardWalletFactory.methods.ownersWallets(owner).call();
    const setOwner = KeycardWalletFactory.methods.setOwner(owner2);
    const receipt = await setOwner.send({
      from: owner
    });

    assert.equal(await KeycardWalletFactory.methods.ownersWallets(owner).call(), "0x0000000000000000000000000000000000000000");
    assert.equal(await KeycardWalletFactory.methods.ownersWallets(owner2).call(), wallet);
    
    const jsonInterface = KeycardWallet.options.jsonInterface;
    const walletContract = new EmbarkJS.Blockchain.Contract({
      abi: jsonInterface,
      address: wallet,
    });

    assert.equal(await walletContract.methods.owner().call(), owner2);
  });
  
  it ('setKeycard fails if no wallet is present', async () => {
    try {
      const setKeycard = KeycardWalletFactory.methods.setKeycard("0x0000000000000000000000000000000000000001", "0x0000000000000000000000000000000000000003");
      const receipt = await setKeycard.send({
        from: owner
      });
      assert.fail("should have failed");
    } catch (err) {
      assert.equal(getErrorReason(err), "the sender has no wallet");
    }
  });  
  
  it ('setKeycard fails if new keycard already has a wallet', async () => {
    try {
      const setKeycard = KeycardWalletFactory.methods.setKeycard("0x0000000000000000000000000000000000000001", "0x0000000000000000000000000000000000000002");
      const receipt = await setKeycard.send({
        from: owner2
      });
      assert.fail("should have failed");
    } catch (err) {
      assert.equal(getErrorReason(err), "the keycard already has a wallet");
    }
  });  

  it ('setKeycard fails if wrong owner', async () => {
    try {
      const setKeycard = KeycardWalletFactory.methods.setKeycard("0x0000000000000000000000000000000000000002", "0x0000000000000000000000000000000000000003");
      const receipt = await setKeycard.send({
        from: owner2
      });
      assert.fail("should have failed");
    } catch (err) {
      assert.equal(getErrorReason(err), "only the owner can change the associated keycard");
    }
  });    
  
  it ('setKeycard', async () => {
    const wallet = await KeycardWalletFactory.methods.keycardsWallets("0x0000000000000000000000000000000000000001").call();
    const setKeycard = KeycardWalletFactory.methods.setKeycard("0x0000000000000000000000000000000000000001", "0x0000000000000000000000000000000000000003");
    const receipt = await setKeycard.send({
      from: owner2
    });

    assert.equal(await KeycardWalletFactory.methods.keycardsWallets("0x0000000000000000000000000000000000000001").call(), "0x0000000000000000000000000000000000000000");
    assert.equal(await KeycardWalletFactory.methods.keycardsWallets("0x0000000000000000000000000000000000000003").call(), wallet);

    const jsonInterface = KeycardWallet.options.jsonInterface;
    const walletContract = new EmbarkJS.Blockchain.Contract({
      abi: jsonInterface,
      address: wallet,
    });

    assert.equal(await walletContract.methods.keycard().call(), "0x0000000000000000000000000000000000000003");
  });   

  it ('unregister fails if no wallet is present', async () => {
    try {
      const unregister = KeycardWalletFactory.methods.unregister("0x0000000000000000000000000000000000000003");
      const receipt = await unregister.send({
        from: owner
      });
      assert.fail("should have failed");
    } catch (err) {
      assert.equal(getErrorReason(err), "the sender has no wallet");
    }
  });  
  
  it ('setOwner fails if the keycard is wrong', async () => {
    try {
      const unregister = KeycardWalletFactory.methods.unregister("0x0000000000000000000000000000000000000002");
      const receipt = await unregister.send({
        from: owner2
      });
      assert.fail("should have failed");
    } catch (err) {
      assert.equal(getErrorReason(err), "owner required");
    }
  });  
  
  it ('unregister', async () => {
    const unregister = KeycardWalletFactory.methods.unregister("0x0000000000000000000000000000000000000003");
    const receipt = await unregister.send({
      from: owner2
    });

    assert.equal(await KeycardWalletFactory.methods.ownersWallets(owner2).call(), "0x0000000000000000000000000000000000000000");
    assert.equal(await KeycardWalletFactory.methods.keycardsWallets("0x0000000000000000000000000000000000000003").call(), "0x0000000000000000000000000000000000000000");
  });  
});
