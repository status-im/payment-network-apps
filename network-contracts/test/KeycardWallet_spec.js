const KeycardWallet = require('Embark/contracts/KeycardWallet');

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
    { name: "nonce", type: "uint256" },
    { name: "amount", type: "uint256" },
    { name: "to", type: "address" }
  ];

  let domainData = {
    name: "KeycardWallet",
    version: "1",
    chainId: 1,
    verifyingContract: KeycardWallet.address
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

let owner,
  merchant;

config({
  contracts: {
    KeycardWallet: {
      args: ["0x000000", "0x0000000000000000000000000000000000000000", 0]
    }
  }
}, (err, _accounts) => {
  owner = _accounts[0];
  keycard = _accounts[1]
  merchant = _accounts[2];
  thief = _accounts[3];
});


const getErrorReason = (err) => {
  const errors = [];
  for (hash in err.results) {
    errors.push(err.results[hash].reason);
  }

  return errors[0];
}

contract('KeycardWallet', () => {
  const setKeycard = async () => {
    const setKeycard = KeycardWallet.methods.setKeycard(keycard);
    await setKeycard.send({
      from: owner
    });
  };

  it('add balance', async () => {
    const contractBalanceBefore = await web3.eth.getBalance(KeycardWallet.address);
    assert.equal(contractBalanceBefore, 0);

    const value = 100;
    const nonce = await web3.eth.getTransactionCount(owner);

    const tx = {
      from: owner,
      to: KeycardWallet.address,
      nonce: nonce,
      value: value,
    };

    const res = await web3.eth.sendTransaction(tx);
    const contractBalanceAfter = await web3.eth.getBalance(KeycardWallet.address);
    assert.equal(contractBalanceAfter, value);
  });

  it('requestPayment without setting a keycard address', async () => {
    const requestPayment = KeycardWallet.methods.requestPayment({nonce: 0, amount: 0, to: merchant}, "0x00");
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
    assert.equal(keycardBefore, "0x0000000000000000000000000000000000000000", "keycard should be empty");

    await setKeycard();

    const currentKeycard = await KeycardWallet.methods.keycard().call();
    assert.equal(currentKeycard, keycard, "current keycard address is wrong");
  });

  it('requestPayment with bad signature', async () => {
    const nonce = await KeycardWallet.methods.nonce().call();
    const to = merchant;
    const value = 10;

    const message = {nonce: nonce, amount: value, to: to};
    // message is signed by the merchant
    const sig = await signPaymentRequest(merchant, message)
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

    const pendingWithdrawal = await KeycardWallet.methods.pendingWithdrawals(merchant).call();
    assert.equal(pendingWithdrawal, 0);
  });

  it('requestPayment with bad nonce', async () => {
    let nonce = await KeycardWallet.methods.nonce().call();
    // increment nonce making it invalid
    nonce++;

    const to = merchant;
    const value = 10;

    const message = {nonce: nonce, amount: value, to: to};
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
      assert.equal(getErrorReason(err), "invalid nonce");
    }

    const pendingWithdrawal = await KeycardWallet.methods.pendingWithdrawals(merchant).call();
    assert.equal(pendingWithdrawal, 0);
  });

  it('requestPayment with params different from signed params', async () => {
    const nonce = await KeycardWallet.methods.nonce().call();
    const to = merchant;
    const value = 10;

    const badMessage = {nonce: nonce, amount: value + 1, to: to};

    const message = {nonce: nonce, amount: value, to: to};
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


    const pendingWithdrawal = await KeycardWallet.methods.pendingWithdrawals(merchant).call();
    assert.equal(pendingWithdrawal, 0);
  });

  it('setSettings needs to be called by the owner', async () => {
    const setSettings = KeycardWallet.methods.setSettings(1);
    try {
      const receipt = await setSettings.send({
        from: merchant
      });
      assert.fail("setSettings should have failed");
    } catch (err) {
      assert.equal(getErrorReason(err), "owner required");
    }
  });

  it('setSettings called by the owner', async () => {
    const settingsBefore = await KeycardWallet.methods.settings().call();
    assert.equal(settingsBefore, 0);

    const setSettings = KeycardWallet.methods.setSettings(999);
    await setSettings.send({
      from: owner
    });

    const currentSettings = await KeycardWallet.methods.settings().call();
    assert.equal(currentSettings, 999);
  });

  it('requestPayment with value greater than maxTxValue', async () => {
    const nonce = await KeycardWallet.methods.nonce().call();
    const to = merchant;
    const value = 1000;

    const message = {nonce: nonce, amount: value, to: to};
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

  it('requestPayment with value greater than balance', async () => {
    const nonce = await KeycardWallet.methods.nonce().call();
    const to = merchant;
    const value = 101;

    const message = {nonce: nonce, amount: value, to: to};
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

  it('requestPayment', async () => {
    const nonce = await KeycardWallet.methods.nonce().call();
    const to = merchant;
    const value = 10;

    const message = {nonce: nonce, amount: value, to: to};
    const sig = await signPaymentRequest(keycard, message)
    const requestPayment = KeycardWallet.methods.requestPayment(message, sig);

    const estimatedGas = await requestPayment.estimateGas();
    const receipt = await requestPayment.send({
      from: merchant,
      gas: estimatedGas
    });

    const event = receipt.events.NewPaymentRequest;
    assert.equal(event.returnValues.nonce, nonce);
    assert.equal(event.returnValues.to, merchant);
    assert.equal(event.returnValues.value, value);

    const pendingWithdrawal = await KeycardWallet.methods.pendingWithdrawals(merchant).call();
    assert.equal(pendingWithdrawal, value);

    const totalPendingWithdrawal = await KeycardWallet.methods.totalPendingWithdrawals().call();
    assert.equal(totalPendingWithdrawal, value);
  });

  it('requestPayment with value greater than available balance', async () => {
    const nonce = await KeycardWallet.methods.nonce().call();
    const to = merchant;
    const value = 100;

    const totalBalance = await web3.eth.getBalance(KeycardWallet.address);
    assert.equal(totalBalance, value);

    const totalPendingWithdrawal = await KeycardWallet.methods.totalPendingWithdrawals().call();
    assert.equal(totalPendingWithdrawal, 10);

    const message = {nonce: nonce, amount: value, to: to};
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

  it('withdraw from address without pendingWithdrawal', async () => {
    const withdrawalValue = 1;
    const pendingWithdrawalBefore = await KeycardWallet.methods.pendingWithdrawals(thief).call();
    assert.equal(pendingWithdrawalBefore, 0);

    const withdraw = KeycardWallet.methods.withdraw();
    try {
      const receipt = await withdraw.send({ from: thief });
      assert.fail("withdraw should have failed");
    } catch (err) {
      assert.equal(getErrorReason(err), "no pending withdrawal");
    }
  });

  it('withdraw', async () => {
    const withdrawalValue = 10;
    const merchantBalanceBefore = await web3.eth.getBalance(merchant);
    const pendingWithdrawalBefore = await KeycardWallet.methods.pendingWithdrawals(merchant).call();
    assert.equal(pendingWithdrawalBefore, withdrawalValue);

    const withdraw = KeycardWallet.methods.withdraw();
    const receipt = await withdraw.send({ from: merchant });
    const event = receipt.events.NewWithdrawal;
    assert.equal(event.returnValues.to, merchant);
    assert.equal(event.returnValues.value, withdrawalValue);

    const gasPrice = await web3.eth.getGasPrice();
    const fullTxPrice = (new web3.utils.BN(gasPrice)).mul(new web3.utils.BN(receipt.gasUsed));

    const pendingWithdrawalAfter = await KeycardWallet.methods.pendingWithdrawals(merchant).call();
    assert.equal(pendingWithdrawalAfter, 0);

    const totalPendingWithdrawalAfter = await KeycardWallet.methods.totalPendingWithdrawals().call();
    assert.equal(totalPendingWithdrawalAfter, 0);

    const expectedMerchantBalance = (new web3.utils.BN(merchantBalanceBefore)).sub(fullTxPrice).add(new web3.utils.BN(withdrawalValue));
    const merchantBalanceAfter = await web3.eth.getBalance(merchant);
    assert.deepStrictEqual(new web3.utils.BN(merchantBalanceAfter), expectedMerchantBalance);
  });

  it('withdraw error on 0 pendingWithdrawal', async () => {
    const pendingWithdrawal = await KeycardWallet.methods.pendingWithdrawals(merchant).call();
    assert.equal(pendingWithdrawal, 0);

    try {
      await KeycardWallet.methods.withdraw().send({ from: merchant });
      assert.fail("withdraw should have failed");
    } catch(err) {
      assert.equal(getErrorReason(err), "no pending withdrawal");
    }
  });
});
