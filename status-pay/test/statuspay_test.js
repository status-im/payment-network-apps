const ERC20 = artifacts.require('ERC20');
const BlockRelay = artifacts.require('BlockRelay');
const StatusPay = artifacts.require('StatusPay');

const bip39 = require('bip39');
const { hdkey } = require('ethereumjs-wallet');
const ethSigUtil = require('eth-sig-util');

let token, block, statusPay, keycardKey;

const zeroAddress = "0x0000000000000000000000000000000000000000";

contract('StatusPay', (accounts) => {
  let owner = accounts[0];
  let keycard = accounts[1];
  let merchant = accounts[2];
  let network = accounts[3];

  before(async () => {
    const seed = bip39.mnemonicToSeedSync("candy maple cake sugar pudding cream honey rich smooth crumble sweet treat");
    const hdk = hdkey.fromMasterSeed(seed);
    const addrNode = hdk.derivePath("m/44'/60'/0'/0/1");
    const keycardAddr = addrNode.getWallet().getAddressString();
    keycardKey = addrNode.getWallet().getPrivateKey();

    assert.equal(keycardAddr.toLowerCase(), keycard.toLowerCase());

    token = await ERC20.new({from: network});
    block = await BlockRelay.new({from: network});
    statusPay = await StatusPay.new({from: network});

    await token.init(10000, {from: network});
    await block.init(500, "0xbababababaabaabaaaaaaabaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", {from: network});
    await statusPay.init(block.address, token.address, 10, {from: network});

    await token.transfer(owner, 100, {from: network});
  });

  it('creates accounts', async () => {
    await statusPay.createAccount(owner, keycard, 1, 10, {from: network});
    await statusPay.createAccount(merchant, zeroAddress, 1, 1000, {from: network});
  });

  it('topup account', async () => {
    await token.approve(statusPay.address, 100, {from: owner});
    await statusPay.topup(owner, 100);
  });

  it('requestPayment with ERC20', async () => {
    await block.addBlock(501, "0xbababababaabaabaaaacaabaaaaaaadaaadcaaadaaaaaaacaaaaaaddeaaaaaaa", {from: network});
    const blockNumber = await block.getLast.call();
    const blockHash = await block.getHash.call(blockNumber);
    await block.addBlock(502, "0xbababababaabaabaaaacaabaaaaaaaaaaaacaaaaaaaaaaacaaaaaaaaaaaaaaaa", {from: network});

    const to = merchant;
    const value = 10;

    const message = {blockNumber: blockNumber.toString(), blockHash: blockHash, currency: token.address, amount: value, to: to};
    const sig = signPaymentRequest(keycardKey, message);
    const receipt = await statusPay.requestPayment(message, sig, {from: merchant});

    const event = receipt.logs.find(element => element.event.match('NewPayment'));

    assert.equal(event.args.to, to);
    assert.equal(event.args.amount, value);
  });

  function signPaymentRequest(signer, message) {
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
      chainId: 3,
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
  }
});
