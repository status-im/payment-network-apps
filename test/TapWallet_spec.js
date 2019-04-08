const TapWallet = require('Embark/contracts/TapWallet');

let owner,
  merchant;

config({
  contracts: {
    TapWallet: {
      args: ["0x000000"]
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

contract('TapWallet', () => {
  const setKeycard = async () => {
    const setKeycard = TapWallet.methods.setKeycard(keycard);
    await setKeycard.send({
      from: owner
    });
  };

  it ('recover', async () => {
    const message = "hello world";
    const sig = await web3.eth.sign(message, owner);
    const prefixedHash = await web3.eth.accounts.hashMessage(message);

    const contractResult = await TapWallet.methods.recover(prefixedHash, sig).call();
    assert.equal(contractResult, owner, "contractResult == owner");
  });

  it('add balance', async () => {
    const contractBalanceBefore = await web3.eth.getBalance(TapWallet.address);
    assert.equal(contractBalanceBefore, 0);

    const value = 100;
    const nonce = await web3.eth.getTransactionCount(owner);

    const tx = {
      from: owner,
      to: TapWallet.address,
      nonce: nonce,
      value: value,
    };

    const res = await web3.eth.sendTransaction(tx);
    const contractBalanceAfter = await web3.eth.getBalance(TapWallet.address);
    assert.equal(contractBalanceAfter, value);
  });

  it('requestPayment without setting a keycard address', async () => {
    const message = await web3.utils.soliditySha3(0, "0x00", 0);
    const requestPayment = TapWallet.methods.requestPayment("0x00", "0x00", 0, merchant, 0);
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
    const setKeycard = TapWallet.methods.setKeycard(keycard);
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
    const keycardBefore = await TapWallet.methods.keycard().call();
    assert.equal(keycardBefore, "0x0000000000000000000000000000000000000000", "keycard should be empty");

    await setKeycard();

    const currentKeycard = await TapWallet.methods.keycard().call();
    assert.equal(currentKeycard, keycard, "current keycard address is wrong");
  });

  it('requestPayment with bad signature', async () => {
    const nonce = await TapWallet.methods.nonce().call();
    const to = merchant;
    const value = 10;

    const message = await web3.utils.soliditySha3(nonce, to, value);
    // message is signed by the merchant
    const sig = await web3.eth.sign(message, merchant);
    const hashToSign = await web3.eth.accounts.hashMessage(message);

    const requestPayment = TapWallet.methods.requestPayment(hashToSign, sig, nonce, to, value);
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

    const pendingWithdrawal = await TapWallet.methods.pendingWithdrawals(merchant).call();
    assert.equal(pendingWithdrawal, 0);
  });

  it('requestPayment with bad nonce', async () => {
    let nonce = await TapWallet.methods.nonce().call();
    // increment nonce making it invalid
    nonce++;

    const to = merchant;
    const value = 10;

    const message = await web3.utils.soliditySha3(nonce, to, value);
    const sig = await web3.eth.sign(message, keycard);
    const hashToSign = await web3.eth.accounts.hashMessage(message);

    const requestPayment = TapWallet.methods.requestPayment(hashToSign, sig, nonce, to, value);
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

    const pendingWithdrawal = await TapWallet.methods.pendingWithdrawals(merchant).call();
    assert.equal(pendingWithdrawal, 0);
  });

  it('requestPayment with params different from signed params', async () => {
    const nonce = await TapWallet.methods.nonce().call();
    const to = merchant;
    const value = 10;

    const message = await web3.utils.soliditySha3(nonce, to, value);
    const sig = await web3.eth.sign(message, keycard);

    const badMessage = await web3.utils.soliditySha3(nonce, to, value + 100);
    const hashFromBadParams = await web3.eth.accounts.hashMessage(badMessage);

    const requestPayment = TapWallet.methods.requestPayment(hashFromBadParams, sig, nonce, to, value);
    try {
      const estimatedGas = await requestPayment.estimateGas();
      const receipt = await requestPayment.send({
        from: merchant,
        gas: estimatedGas
      });
      assert.fail("requestPayment should have failed");
    } catch (err) {
      assert.equal(getErrorReason(err), "signed params are different");
    }


    const pendingWithdrawal = await TapWallet.methods.pendingWithdrawals(merchant).call();
    assert.equal(pendingWithdrawal, 0);
  });

  it('setSettings needs to be called by the owner', async () => {
    const setSettings = TapWallet.methods.setSettings(1);
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
    const settingsBefore = await TapWallet.methods.settings().call();
    assert.equal(settingsBefore, 0);

    const setSettings = TapWallet.methods.setSettings(100);
    await setSettings.send({
      from: owner
    });

    const currentSettings = await TapWallet.methods.settings().call();
    assert.equal(currentSettings, 100);
  });

  it('requestPayment with value greater than maxTxValue', async () => {
    const nonce = await TapWallet.methods.nonce().call();
    const to = merchant;
    const value = 1000;

    const message = await web3.utils.soliditySha3(nonce, to, value);
    const sig = await web3.eth.sign(message, keycard);
    const hashToSign = await web3.eth.accounts.hashMessage(message);

    const requestPayment = TapWallet.methods.requestPayment(hashToSign, sig, nonce, to, value);
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

  it('requestPayment', async () => {
    const nonce = await TapWallet.methods.nonce().call();
    const to = merchant;
    const value = 10;

    const message = await web3.utils.soliditySha3(nonce, to, value);
    const sig = await web3.eth.sign(message, keycard);
    const hashToSign = await web3.eth.accounts.hashMessage(message);

    const requestPayment = TapWallet.methods.requestPayment(hashToSign, sig, nonce, to, value);
    const estimatedGas = await requestPayment.estimateGas();
    const receipt = await requestPayment.send({
      from: merchant,
      gas: estimatedGas
    });

    const event = receipt.events.NewPaymentRequest;
    assert.equal(event.returnValues.nonce, nonce);
    assert.equal(event.returnValues.to, merchant);
    assert.equal(event.returnValues.value, value);

    const pendingWithdrawal = await TapWallet.methods.pendingWithdrawals(merchant).call();
    assert.equal(pendingWithdrawal, value);
  });

  it('withdraw from address without pendingWithdrawal', async () => {
    const withdrawalValue = 1;
    const pendingWithdrawalBefore = await TapWallet.methods.pendingWithdrawals(thief).call();
    assert.equal(pendingWithdrawalBefore, 0);

    const withdraw = TapWallet.methods.withdraw();
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
    const pendingWithdrawalBefore = await TapWallet.methods.pendingWithdrawals(merchant).call();
    assert.equal(pendingWithdrawalBefore, withdrawalValue);

    const withdraw = TapWallet.methods.withdraw();
    const receipt = await withdraw.send({ from: merchant });
    const event = receipt.events.NewWithdrawal;
    assert.equal(event.returnValues.to, merchant);
    assert.equal(event.returnValues.value, withdrawalValue);

    const gasPrice = await web3.eth.getGasPrice();
    const fullTxPrice = (new web3.utils.BN(gasPrice)).mul(new web3.utils.BN(receipt.gasUsed));

    const pendingWithdrawalAfter = await TapWallet.methods.pendingWithdrawals(merchant).call();
    assert.equal(pendingWithdrawalAfter, 0);

    const expectedMerchantBalance = (new web3.utils.BN(merchantBalanceBefore)).sub(fullTxPrice).add(new web3.utils.BN(withdrawalValue));
    const merchantBalanceAfter = await web3.eth.getBalance(merchant);
    assert.deepStrictEqual(new web3.utils.BN(merchantBalanceAfter), expectedMerchantBalance);
  });

  it('withdraw error on 0 pendingWithdrawal', async () => {
    const pendingWithdrawal = await TapWallet.methods.pendingWithdrawals(merchant).call();
    assert.equal(pendingWithdrawal, 0);

    try {
      await TapWallet.methods.withdraw().send({ from: merchant });
      assert.fail("withdraw should have failed");
    } catch(err) {
      assert.equal(getErrorReason(err), "no pending withdrawal");
    }
  });
});
