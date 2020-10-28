const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');

const TestERC20 = artifacts.require('TestERC20');
const BlockRelay = artifacts.require('BlockRelay');
const StatusPay = artifacts.require('StatusPay');
const StatusPayBucket = artifacts.require('StatusPayBucket');

const bip39 = require('bip39');
const { hdkey } = require('ethereumjs-wallet');
const ethSigUtil = require('eth-sig-util');

let token, block, statusPay, bucket, keycardKey, keycardKey2;

const zeroAddress = "0x0000000000000000000000000000000000000000";
const seed = bip39.mnemonicToSeedSync("candy maple cake sugar pudding cream honey rich smooth crumble sweet treat");
const hdk = hdkey.fromMasterSeed(seed);

const CHAIN_ID = 1; //for now 1
const NO_PROXIES = false;
const NO_RELAY = true;

const NOW = Math.round(new Date().getTime() / 1000);
const START_TIME = NOW - 1;
const EXPIRATION_TIME = NOW + 60 * 60 * 24;
const MAX_TX_DELAY_BLOCKS = 10;
const REDEEM_CODE = web3.utils.sha3("Should be a randomly generated code to redeem the account and tokens");
const UNLOCK_CODE = web3.utils.sha3("This too, should be a random code and is used to take ownership of the account");

let STATUSPAY_DOMAIN, BUCKET_DOMAIN;

contract('StatusPay', (accounts) => {
  const network = accounts[0];
  const keycard = accounts[1];
  const merchant = accounts[2];
  const owner = accounts[3];
  const keycard2 = accounts[4];
  const owner2 = accounts[5];

  before(async () => {
    keycardKey = deriveKey(1, keycard);
    keycardKey2 = deriveKey(4, keycard2);

    if (NO_PROXIES) {
      token = await TestERC20.new({from: network});
      block = await BlockRelay.new({from: network});
      statusPay = await StatusPay.new({from: network});
      bucket = await StatusPayBucket.new({from: network});

      // Truffle does not handle overridden methods, using web3 directly
      let tokenInit = token.contract.methods['initialize(uint256)'](10000);
      let tokenGas = await tokenInit.estimateGas();
      await tokenInit.send({from: network, gas: tokenGas});

      await block.initialize(500, "0xbababababaabaabaaaaaaabaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", {from: network});
      await statusPay.initialize(NO_RELAY ? zeroAddress : block.address, token.address, MAX_TX_DELAY_BLOCKS, {from: network});
      await bucket.initialize(statusPay.address, NO_RELAY ? zeroAddress : block.address, START_TIME, EXPIRATION_TIME, MAX_TX_DELAY_BLOCKS, 1, 1000, {from: network});
    } else {
      token = await deployProxy(TestERC20, [10000]);
      block = await deployProxy(BlockRelay, [500, "0xbababababaabaabaaaaaaabaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"]);
      statusPay = await deployProxy(StatusPay, [NO_RELAY ? zeroAddress : block.address, token.address, MAX_TX_DELAY_BLOCKS], {unsafeAllowCustomTypes: true});
      bucket = await deployProxy(StatusPayBucket, [statusPay.address, NO_RELAY ? zeroAddress : block.address, START_TIME, EXPIRATION_TIME, MAX_TX_DELAY_BLOCKS, 1, 1000], {unsafeAllowCustomTypes: true});
    }

    await token.transfer(owner, 100, {from: network});
    await token.transfer(bucket.address, 1000, {from: network});

    STATUSPAY_DOMAIN = await statusPay.DOMAIN_SEPARATOR.call();
    BUCKET_DOMAIN = await bucket.DOMAIN_SEPARATOR.call();
  });

  it('requestPayment with inexistant account', async () => {
    try {
      await requestPaymentTest(10);
      assert.fail("requestPayment should have failed");
    } catch (err) {
      assert.equal(err.reason, "payer account not found");
    }
  });

  it('creates buyer account', async () => {
    await statusPay.createAccount(keycard, 1, 10, {from: owner});
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
    await statusPay.createAccount(zeroAddress, 1, 1000, {from: merchant});
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
    await token.approve(statusPay.address, 50, {from: owner});
    await statusPay.topup(50, {from: owner});
    await block.addBlock(501, "0xbababababaabaabaaaacaabaaaaaaadaaadcaaadaaaaaaacaaaaaaddeaaaaaaa", {from: network});

    let account = await statusPay.owners.call(owner);
    assert.equal((await token.balanceOf.call(owner)).toNumber(), 50);
    assert.equal((await statusPay.accounts.call(account)).balance.toNumber(), 50);
  });

  it('topup account via Keycard', async () => {
    await token.approve(statusPay.address, 50, {from: owner});
    await statusPay.topupKeycard(keycard, 50, {from: owner});

    let account = await statusPay.owners.call(owner);
    assert.equal((await token.balanceOf.call(owner)).toNumber(), 0);
    assert.equal((await statusPay.accounts.call(account)).balance.toNumber(), 100);
  });

  it('topup exceed ERC20 balance', async () => {
    await token.approve(statusPay.address, 100, {from: owner});

    try {
      await statusPay.topup(100, {from: owner});
      assert.fail("topup should have failed");
    } catch (err) {
      assert(err.reason == "transfer failed" || err.reason == "ERC20: transfer amount exceeds balance");
    }

    let account = await statusPay.owners.call(owner);
    assert.equal((await token.balanceOf.call(owner)).toNumber(), 0);
    assert.equal((await statusPay.accounts.call(account)).balance.toNumber(), 100);
  });

  it('topup account non-existing account', async () => {
    try {
      await statusPay.topup(100, {from: network});
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
      const reqBlock = await blockInfo();
      await requestPaymentTest(10, (reqBlock.number - 10));
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

    let buyerAcc = await statusPay.owners.call(owner);
    let merchantAcc = await statusPay.owners.call(merchant);

    assert.equal(event.args.from, buyerAcc);
    assert.equal(event.args.to, merchantAcc);
    assert.equal(event.args.amount, 10);

    assert.equal((await statusPay.accounts.call(buyerAcc)).balance.toNumber(), 90);
    assert.equal((await statusPay.accounts.call(merchantAcc)).balance.toNumber(), 10);
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
      const reqBlock = await blockInfo();
      await requestPaymentTest(10, (reqBlock.number + 1));
      assert.fail("requestPayment should have failed");
    } catch (err) {
      assert.equal(err.reason, "transaction cannot be in the future");
    }
  });


  it('withdraw', async () => {
    await statusPay.withdraw(80, {from: owner});

    let account = await statusPay.owners.call(owner);
    assert.equal((await token.balanceOf.call(owner)).toNumber(), 80);
    assert.equal((await statusPay.accounts.call(account)).balance.toNumber(), 10);
  });

  it('withdraw more than balance allows', async () => {
    try {
      await statusPay.withdraw(11, {from: owner});
      assert.fail("withdraw should have failed");
    } catch (err) {
      assert.equal(err.reason, "not enough balance");
    }

    let account = await statusPay.owners.call(owner);
    assert.equal((await token.balanceOf.call(owner)).toNumber(), 80);
    assert.equal((await statusPay.accounts.call(account)).balance.toNumber(), 10);
  });

  it('withdraw non existing account', async () => {
    try {
      await statusPay.withdraw(10, {from: network});
      assert.fail("withdraw should have failed");
    } catch (err) {
      assert.equal(err.reason, "account does not exist");
    }
  });

  it('create redeemable', async () => {
    await bucket.createRedeemable(keycard2, 200, web3.utils.soliditySha3(BUCKET_DOMAIN, keycard2, REDEEM_CODE), web3.utils.soliditySha3(STATUSPAY_DOMAIN, keycard2, UNLOCK_CODE));
    let availableSupply = await bucket.availableSupply.call();
    assert.equal(parseInt(availableSupply), 800);
  });

  it('create redeemable with more than total supply', async () => {
    try {
      await bucket.createRedeemable(keycard, 900, web3.utils.soliditySha3(BUCKET_DOMAIN, keycard, REDEEM_CODE), web3.utils.soliditySha3(STATUSPAY_DOMAIN, keycard, UNLOCK_CODE));
      assert.fail("create redeemable should have failed");
    } catch (err) {
      assert.equal(err.reason, "low supply");
    }
  });

  it('redeem account', async () => {
    const reqBlock = await blockInfo();

    const message = {blockNumber: reqBlock.number, blockHash: reqBlock.hash, code: REDEEM_CODE};
    const sig = signRedeem(keycardKey2, message);
    await bucket.redeem(message, sig, {from: merchant});
    const account = await statusPay.keycards.call(keycard2);
    assert.equal((await statusPay.accounts.call(account)).balance.toNumber(), 200);
  });

  it('unlock account', async () => {
    const reqBlock = await blockInfo();

    const message = {blockNumber: reqBlock.number, blockHash: reqBlock.hash, code: UNLOCK_CODE};
    const sig = signUnlock(keycardKey2, message);
    await statusPay.unlockAccount(message, sig, {from: owner2});
    const account = await statusPay.owners.call(owner2);
    assert.equal((await statusPay.accounts.call(account)).balance.toNumber(), 200);
  });

  requestPaymentTest = async (value, blockNum, blockH) => {
    const reqBlock = await blockInfo(blockNum);
    const blockHash = blockH || reqBlock.hash;

    const message = {blockNumber: reqBlock.number, blockHash: blockHash, amount: value, to: merchant};
    const sig = signPaymentRequest(keycardKey, message);
    return await statusPay.requestPayment(message, sig, {from: merchant});
  };

  deriveKey = (index, expectedAddr) => {
    const addrNode = hdk.derivePath("m/44'/60'/0'/0/" + index);
    const generatedAddr = addrNode.getWallet().getAddressString();
    assert.equal(generatedAddr.toLowerCase(), expectedAddr.toLowerCase());

    return addrNode.getWallet().getPrivateKey();
  };

  blockInfo = async (number) => {
    if (NO_RELAY) {
      try {
        const block = await web3.eth.getBlock(number || "latest");
        return {number: block.number, hash: block.hash};
      } catch(err) {
        return {number: number, hash: "0x0000000000000000000000000000000000000000000000000000000000000000"};
      }
    } else {
      const blockNumber = number || (await block.getLast.call()).toNumber();
      const blockHash = await block.getHash.call(blockNumber);
      return {number: blockNumber, hash: blockHash};
    }
  }

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

  signUnlock = (signer, message) => {
    let domain = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" }
    ];

    let unlock = [
      { name: "blockNumber", type: "uint256" },
      { name: "blockHash", type: "bytes32" },
      { name: "code", type: "bytes32" }
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
        Unlock: unlock
      },
      primaryType: "Unlock",
      domain: domainData,
      message: message
    };

    return ethSigUtil.signTypedData(signer, { data: data });
  };

  signRedeem = (signer, message) => {
    let domain = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" }
    ];

    let redeem = [
      { name: "blockNumber", type: "uint256" },
      { name: "blockHash", type: "bytes32" },
      { name: "code", type: "bytes32" }
    ];

    let domainData = {
      name: "StatusPayBucket",
      version: "1",
      chainId: CHAIN_ID,
      verifyingContract: bucket.address
    };

    let data = {
      types: {
        EIP712Domain: domain,
        Redeem: redeem
      },
      primaryType: "Redeem",
      domain: domainData,
      message: message
    };

    return ethSigUtil.signTypedData(signer, { data: data });
  };
});
