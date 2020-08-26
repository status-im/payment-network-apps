const ERC20 = artifacts.require('TestERC20');
const BlockRelay = artifacts.require('BlockRelay');
const StatusPay = artifacts.require('StatusPay');

const bip39 = require('bip39');
const { hdkey } = require('ethereumjs-wallet');
const ethSigUtil = require('eth-sig-util');

let token, block, statusPay, keycardKey;

const zeroAddress = "0x0000000000000000000000000000000000000000";
const seed = bip39.mnemonicToSeedSync("candy maple cake sugar pudding cream honey rich smooth crumble sweet treat");
const hdk = hdkey.fromMasterSeed(seed);

const CHAIN_ID = 1; //for now 1

contract('StatusPay', (accounts) => {
  const owner = accounts[0];
  const keycard = accounts[1];
  const merchant = accounts[2];
  const network = accounts[3];

  before(async () => {
    keycardKey = deriveKey(1, keycard);

    token = await ERC20.new({from: network});
    block = await BlockRelay.new({from: network});
    statusPay = await StatusPay.new({from: network});

    await token.init(10000, {from: network});
    await block.init(500, "0xbababababaabaabaaaaaaabaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", {from: network});
    await statusPay.init(block.address, token.address, 10, {from: network});

    await token.transfer(owner, 100, {from: network});
  });

  it('requestPayment with inexistant account', async () => {
    try {
      await requestPaymentTest(10);
      assert.fail("requestPayment should have failed");
    } catch (err) {
      assert.equal(err.reason, "no account for this Keycard");
    }
  });

  it('creates buyer account', async () => {
    await statusPay.createAccount(owner, keycard, 1, 10, {from: network});
    assert.equal((await statusPay.accounts.call(owner)).balance.toNumber(), 0);
  });

  it('requestPayment with inexisting merchant', async () => {
    try {
      await requestPaymentTest(10);
      assert.fail("requestPayment should have failed");
    } catch (err) {
      assert.equal(err.reason, "payee account does not exist");
    }
  });

  it('creates merchant account', async () => {
    await statusPay.createAccount(merchant, zeroAddress, 1, 1000, {from: network});
    assert.equal((await statusPay.accounts.call(merchant)).balance.toNumber(), 0);
  });

  it('requestPayment with insufficient balance', async () => {
    try {
      await requestPaymentTest(10);
      assert.fail("requestPayment should have failed");
    } catch (err) {
      assert.equal(err.reason, "balance is not enough");
    }
  });

  it('topup account', async () => {
    await token.approve(statusPay.address, 100, {from: owner});
    await statusPay.topup(owner, 100, {from: owner});
    await block.addBlock(501, "0xbababababaabaabaaaacaabaaaaaaadaaadcaaadaaaaaaacaaaaaaddeaaaaaaa", {from: network});

    assert.equal((await token.balanceOf.call(owner)).toNumber(), 0);
    assert.equal((await statusPay.accounts.call(owner)).balance.toNumber(), 100);
  });

  it('topup exceed ERC20 balance', async () => {
    await token.approve(statusPay.address, 100, {from: owner});

    try {
      await statusPay.topup(owner, 100, {from: owner});
      assert.fail("topup should have failed");
    } catch (err) {
      assert(err.reason == "transfer failed" || err.reason == "ERC20: transfer amount exceeds balance");
    }

    assert.equal((await token.balanceOf.call(owner)).toNumber(), 0);
    assert.equal((await statusPay.accounts.call(owner)).balance.toNumber(), 100);
  });

  it('topup account non-existing account', async () => {
    try {
      await statusPay.topup(network, 100, {from: network});
      assert.fail("topup should have failed");
    } catch (err) {
      assert.equal(err.reason, "account does not exist");
    }
  });

  it('requestPayment over limit', async () => {
    try {
      await requestPaymentTest(11);
      assert.fail("requestPayment should have failed");
    } catch (err) {
      assert.equal(err.reason, "amount not allowed");
    }
  });

  it('requestPayment with block too old', async () => {
    try {
      await requestPaymentTest(10, (await block.getLast.call()).toNumber() - 10);
      assert.fail("requestPayment should have failed");
    } catch (err) {
      assert.equal(err.reason, "transaction too old");
    }
  });

  it('requestPayment with invalid hash', async () => {
    try {
      await requestPaymentTest(10, undefined, "0xbababababaabaabaaaaaaabaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
      assert.fail("requestPayment should have failed");
    } catch (err) {
      assert.equal(err.reason, "invalid block hash");
    }
  });

  it('requestPayment', async () => {
    const receipt = await requestPaymentTest(10);

    const event = receipt.logs.find(element => element.event.match('NewPayment'));

    assert.equal(event.args.to, merchant);
    assert.equal(event.args.amount, 10);

    assert.equal((await statusPay.accounts.call(owner)).balance.toNumber(), 90);
    assert.equal((await statusPay.accounts.call(merchant)).balance.toNumber(), 10);
  });

  it('requestPayment without waiting for cooldown', async () => {
    try {
      await requestPaymentTest(10);
      assert.fail("requestPayment should have failed");
    } catch (err) {
      assert.equal(err.reason, "cooldown period not expired yet");
    }
  });

  it('requestPayment with block in the future', async () => {
    try {
      await requestPaymentTest(10, (await block.getLast.call()).toNumber() + 1);
      assert.fail("requestPayment should have failed");
    } catch (err) {
      assert.equal(err.reason, "transaction cannot be in the future");
    }
  });


  it('withdraw', async () => {
    await statusPay.withdraw(owner, 80, {from: owner});

    assert.equal((await token.balanceOf.call(owner)).toNumber(), 80);
    assert.equal((await statusPay.accounts.call(owner)).balance.toNumber(), 10);
  });

  it('withdraw more than balance allows', async () => {
    try {
      await statusPay.withdraw(owner, 11, {from: owner});
      assert.fail("withdraw should have failed");
    } catch (err) {
      assert.equal(err.reason, "not enough balance");
    }

    assert.equal((await token.balanceOf.call(owner)).toNumber(), 80);
    assert.equal((await statusPay.accounts.call(owner)).balance.toNumber(), 10);
  });

  it('withdraw non existing account', async () => {
    try {
      await statusPay.withdraw(network, 10, {from: network});
      assert.fail("withdraw should have failed");
    } catch (err) {
      assert.equal(err.reason, "account does not exist");
    }
  });

  requestPaymentTest = async (value, blockNum, blockH) => {
    const blockNumber = blockNum || (await block.getLast.call()).toNumber();
    const blockHash = blockH || await block.getHash.call(blockNumber);

    const message = {blockNumber: blockNumber, blockHash: blockHash, amount: value, to: merchant};
    const sig = signPaymentRequest(keycardKey, message);
    return await statusPay.requestPayment(message, sig, {from: merchant});
  };

  deriveKey = (index, expectedAddr) => {
    const addrNode = hdk.derivePath("m/44'/60'/0'/0/" + index);
    const generatedAddr = addrNode.getWallet().getAddressString();
    assert.equal(generatedAddr.toLowerCase(), expectedAddr.toLowerCase());

    return addrNode.getWallet().getPrivateKey();
  };

  signPaymentRequest = (signer, message) => {
    let domain = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" }
    ];

    let payment = [
      { name: "blockNumber", type: "uint256" },
      { name: "blockHash", type: "bytes32" },
      { name: "amount", type: "uint256" },
      { name: "to", type: "address" }
    ];

    let domainData = {
      name: "StatusPay",
      version: "1",
      chainId: CHAIN_ID,
      verifyingContract: statusPay.address
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

    return ethSigUtil.signTypedData(signer, { data: data });
  };
});
