const KeycardWallet = require('Embark/contracts/KeycardWallet');
const KeycardWalletFactory = require('Embark/contracts/KeycardWalletFactory');
const MockERC20 = require('Embark/contracts/MockERC20');
const { getErrorReason } = require('./utils');

const zeroAddress = "0x0000000000000000000000000000000000000000";

const promisifyJsonRPC = (inner) =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res.result);
      }
  })
);

async function signPaymentRequest(signer, message) {
  let domain = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" }
  ];

  let payment = [
    { name: "blockNumber", type: "uint256" },
    { name: "blockHash", type: "bytes32" },
    { name: "currency", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "to", type: "address" }
  ];

  let domainData = {
    name: "KeycardWallet",
    version: "1",
    chainId: 1,
    verifyingContract: KeycardWalletFactory.options.address
  };

  let data = {
    types: {
      EIP712Domain: domain,
      Payment: payment
    },
    primaryType: "Payment",
    domain: domainData,
    message: message
  };

  return promisifyJsonRPC(cb => web3.currentProvider.sendAsync({method: "eth_signTypedData", params: [signer, data], from: signer}, cb));
}

let owner, merchant, keycard;

config({
  contracts: {
    MockERC20: {}
  }
}, (err, _accounts) => {
  owner = _accounts[0];
  keycard = _accounts[1]
  merchant = _accounts[2];
  thief = _accounts[3];
});

contract('KeycardWallet', () => {
  before(async () => {
    let tmp = await KeycardWalletFactory.deploy({arguments: [MockERC20.address]}).send({from: owner});
    KeycardWalletFactory.options.address = tmp.options.address;

    const create = KeycardWalletFactory.methods.create(zeroAddress, false, 0, 0);
    const receipt = await create.send({from: owner});

    const event = receipt.events.NewWallet;
    KeycardWallet.options.address = event.returnValues.wallet;
  });

  it('registers', async () => {
    const setRegister = KeycardWallet.methods.setRegister(KeycardWalletFactory.options.address);
    await setRegister.send({
      from: owner
    });

    const currentRegister = await KeycardWallet.methods.register().call();
    assert.equal(currentRegister, KeycardWalletFactory.options.address);
  });

  it('requestPayment without setting a keycard address', async () => {
    const block = await web3.eth.getBlock("latest");
    const requestPayment = KeycardWallet.methods.requestPayment({blockNumber: block.number, blockHash: block.hash, currency: MockERC20.address, amount: 0, to: merchant}, "0x00");
    try {
      const estimatedGas = await requestPayment.estimateGas();
      await requestPayment.send({
        from: owner,
        gas: estimatedGas
      });
      assert.fail("requestPayment should have failed");
    } catch (err) {
      assert.equal(getErrorReason(err), "keycard address not set");
    }
  });

  it('setKeycard needs to be called by the owner', async () => {
    const setKeycard = KeycardWallet.methods.setKeycard(keycard);
    try {
      await setKeycard.send({
        from: merchant
      });
      assert.fail("setKeycard should have failed");
    } catch (err) {
      assert.equal(getErrorReason(err), "owner required");
    }
  });

  it('setKeycard called by the owner', async () => {
    const keycardBefore = await KeycardWallet.methods.keycard().call();
    assert.equal(keycardBefore, zeroAddress, "keycard should be empty");

    const setKeycard = KeycardWallet.methods.setKeycard(keycard);
    await setKeycard.send({
      from: owner
    });

    const currentKeycard = await KeycardWallet.methods.keycard().call();
    assert.equal(currentKeycard, keycard, "current keycard address is wrong");
  });

  it('requestPayment with bad signature', async () => {
    const block = await web3.eth.getBlock("latest");
    const to = merchant;
    const value = 10;

    const message = {blockNumber: block.number, blockHash: block.hash, currency: MockERC20.address, amount: value, to: to};
    // message is signed by the merchant
    const sig = await signPaymentRequest(merchant, message);
    const requestPayment = KeycardWallet.methods.requestPayment(message, sig);

    try {
      const estimatedGas = await requestPayment.estimateGas();
      await requestPayment.send({
        from: merchant,
        gas: estimatedGas
      });
      assert.fail("requestPayment should have failed");
    } catch (err) {
      assert.equal(getErrorReason(err), "signer is not the keycard");
    }
  });

  it('requestPayment with block in the future', async () => {
    const block = await web3.eth.getBlock("latest");

    const to = merchant;
    const value = 10;

    const message = {blockNumber: block.number + 1, blockHash: "0x0000000000000000000000000000000000000000000000000000000000000000", currency: MockERC20.address, amount: value, to: to};
    const sig = await signPaymentRequest(keycard, message);
    const requestPayment = KeycardWallet.methods.requestPayment(message, sig);

    try {
      const estimatedGas = await requestPayment.estimateGas();
      await requestPayment.send({
        from: merchant,
        gas: estimatedGas
      });
      assert.fail("requestPayment should have failed");
    } catch (err) {
      assert.equal(getErrorReason(err), "transaction cannot be in the future");
    }
  });

  it('requestPayment with wrong block hash', async () => {
    const block = await web3.eth.getBlock("latest");

    const to = merchant;
    const value = 10;

    const message = {blockNumber: block.number, blockHash: "0x0000000000000000000000000000000000000000000000000000000000000000", currency: MockERC20.address, amount: value, to: to};
    const sig = await signPaymentRequest(keycard, message)
    const requestPayment = KeycardWallet.methods.requestPayment(message, sig);

    try {
      const estimatedGas = await requestPayment.estimateGas();
      await requestPayment.send({
        from: merchant,
        gas: estimatedGas
      });
      assert.fail("requestPayment should have failed");
    } catch (err) {
      assert.equal(getErrorReason(err), "invalid block hash");
    }
  });

  it('requestPayment with params different from signed params', async () => {
    const block = await web3.eth.getBlock("latest");
    const to = merchant;
    const value = 10;

    const badMessage = {blockNumber: block.number, blockHash: block.hash, currency: MockERC20.address, amount: value + 1, to: to};

    const message = {blockNumber: block.number, blockHash: block.hash, currency: MockERC20.address, amount: value, to: to};
    const sig = await signPaymentRequest(keycard, message)
    const requestPayment = KeycardWallet.methods.requestPayment(badMessage, sig);

    try {
      const estimatedGas = await requestPayment.estimateGas();
      const receipt = await requestPayment.send({
        from: merchant,
        gas: estimatedGas
      });
      assert.fail("requestPayment should have failed");
    } catch (err) {
      assert.equal(getErrorReason(err), "signer is not the keycard");
    }
  });

  it('setMinBlockDistance needs to be called by the owner', async () => {
    const setMinBlockDistance = KeycardWallet.methods.setMinBlockDistance(1);
    try {
      const receipt = await setMinBlockDistance.send({
        from: merchant
      });
      assert.fail("setMinBlockDistance should have failed");
    } catch (err) {
      assert.equal(getErrorReason(err), "owner required");
    }
  });

  it('setMinBlockDistance called by the owner', async () => {
    const minBlockDistanceBefore = await KeycardWallet.methods.minBlockDistance().call();
    assert.equal(minBlockDistanceBefore, 0);

    const setMinBlockDistance = KeycardWallet.methods.setMinBlockDistance(1);
    await setMinBlockDistance.send({
      from: owner
    });

    const currentMinBlockDistance = await KeycardWallet.methods.minBlockDistance().call();
    assert.equal(currentMinBlockDistance, 1);
  });

  it('requestPayment with token not in the whitelist', async () => {
    const block = await web3.eth.getBlock("latest");
    const to = merchant;
    const value = 1;

    const message = {blockNumber: block.number, blockHash: block.hash, currency: zeroAddress, amount: value, to: to};
    const sig = await signPaymentRequest(keycard, message)
    const requestPayment = KeycardWallet.methods.requestPayment(message, sig);

    try {
      const estimatedGas = await requestPayment.estimateGas();
      const receipt = await requestPayment.send({
        from: merchant,
        gas: estimatedGas
      });
     assert.fail("requestPayment should have failed");
    } catch (err) {
      assert.equal(getErrorReason(err), "amount not allowed");
    }
  });

  it('add token to whitelist', async () => {
    const maxTxValue = 5000;

    const setTokenMaxTXAmount = KeycardWallet.methods.setTokenMaxTXAmount(MockERC20.address, maxTxValue);
    await setTokenMaxTXAmount.send({
      from: owner
    });

    const tokenMaxTxAmount = await KeycardWallet.methods.tokenMaxTxAmount(MockERC20.address).call();
    assert.equal(tokenMaxTxAmount, maxTxValue);
  });

  it('requestPayment with value greater than maxTxValue for ERC20 token', async () => {
    const block = await web3.eth.getBlock("latest");
    const to = merchant;
    const value = 5001;

    const message = {blockNumber: block.number, blockHash: block.hash, currency: MockERC20.address, amount: value, to: to};
    const sig = await signPaymentRequest(keycard, message)
    const requestPayment = KeycardWallet.methods.requestPayment(message, sig);

    try {
      const estimatedGas = await requestPayment.estimateGas();
      const receipt = await requestPayment.send({
        from: merchant,
        gas: estimatedGas
      });
     assert.fail("requestPayment should have failed");
    } catch (err) {
      assert.equal(getErrorReason(err), "amount not allowed");
    }
  }); 

  it('requestPayment with value greater than balance for ERC20', async () => {
    const block = await web3.eth.getBlock("latest");
    const to = merchant;
    const value = 1001;

    const message = {blockNumber: block.number, blockHash: block.hash, currency: MockERC20.address, amount: value, to: to};
    const sig = await signPaymentRequest(keycard, message)
    const requestPayment = KeycardWallet.methods.requestPayment(message, sig);

    try {
      const estimatedGas = await requestPayment.estimateGas();
      const receipt = await requestPayment.send({
        from: merchant,
        gas: estimatedGas
      });
     assert.fail("requestPayment should have failed");
    } catch (err) {
      assert.equal(getErrorReason(err), "balance is not enough");
    }
  });  

  it('requestPayment with ERC20', async () => {
    const block = await web3.eth.getBlock("latest");
    const to = merchant;
    const value = 10;

    const message = {blockNumber: block.number, blockHash: block.hash, currency: MockERC20.address, amount: value, to: to};
    const sig = await signPaymentRequest(keycard, message)
    const requestPayment = KeycardWallet.methods.requestPayment(message, sig);

    const estimatedGas = await requestPayment.estimateGas();
    const receipt = await requestPayment.send({
      from: merchant,
      gas: estimatedGas
    });

    const event = receipt.events.PaymentRequest;
    assert.equal(event.returnValues.blockNumber, block.number);
    assert.equal(event.returnValues.to, to);
    assert.equal(event.returnValues.amount, value);
    assert.equal(event.returnValues.currency, MockERC20.address);
  });  

  it('requestPayment without waiting for cooldown', async () => {
    const block = await web3.eth.getBlock("latest");
    const to = merchant;
    const value = 1;

    const message = {blockNumber: block.number, blockHash: block.hash, currency: MockERC20.address, amount: value, to: to};
    const sig = await signPaymentRequest(keycard, message)
    const requestPayment = KeycardWallet.methods.requestPayment(message, sig);

    try {
      const estimatedGas = await requestPayment.estimateGas();
      const receipt = await requestPayment.send({
        from: merchant,
        gas: estimatedGas
      });

      assert.fail("requestPayment should have failed");
    } catch (err) {
      assert.equal(getErrorReason(err), "cooldown period not expired yet");
    }

    // skip a block for next test
    const setMinBlockDistance = KeycardWallet.methods.setMinBlockDistance(1);
    await setMinBlockDistance.send({from: owner});
  });

  it('requestPayment with old block', async () => {
    const currentBlock = await web3.eth.getBlock("latest");
    const block = await web3.eth.getBlock(currentBlock.number - 10);
    const to = merchant;
    const value = 1;

    const message = {blockNumber: block.number, blockHash: block.hash, currency: MockERC20.address, amount: value, to: to};
    const sig = await signPaymentRequest(keycard, message)
    const requestPayment = KeycardWallet.methods.requestPayment(message, sig);

    try {
      const estimatedGas = await requestPayment.estimateGas();
      const receipt = await requestPayment.send({
        from: merchant,
        gas: estimatedGas
      });

      assert.fail("requestPayment should have failed");
    } catch (err) {
      assert.equal(getErrorReason(err), "transaction too old");
    }

    // skip a block for next test
    const setMinBlockDistance = KeycardWallet.methods.setMinBlockDistance(1);
    await setMinBlockDistance.send({from: owner});
  });    
});
