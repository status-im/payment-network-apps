const Account = require('./account.js');
const { ethers } = require("ethers");

const utils = require('./utils.js');
const parseArgs = require('minimist');
const BRIDGE_ADDRESS = '0xa9f96d8761aa05430d3ee2e7dff6b04978f13369';
const RPC_URL = `https://${BRIDGE_ADDRESS}.fly.dev`;

const argv = parseArgs(process.argv.slice(2), {string: ["token", "wallet", "blockrelay", "statuspay", "keycard", "merchant", "blockHash"], default: {"endpoint": RPC_URL, "token": "0x722dd3f80bac40c951b51bdd28dd19d435762180", maxTxDelayInBlocks: 10}});

async function loadSigner(argv, signer, passfile) {
  let account = new Account(argv["endpoint"]);

  if (argv[signer]) {
    if (!argv[passfile]) {
      console.error(`the --${passfile} option must be specified`);
      process.exit(1);
    }

    await account.init(argv[signer], argv[passfile]);
  } else if (argv["cmd"] != "info") {
    console.error(`--${signer} is required`);
    process.exit(1);
  }

  return account;
}

function getContract(argv, signer, optName, contractName) {
  if (!argv[optName]) {
    console.error(`the --${optName} option must be specified`);
    process.exit(1);
  }

  return utils.loadContract(argv[optName], contractName, signer.provider);
}

function getBlockRelayContract(argv, signer) {
  return getContract(argv, signer, "blockrelay", "BlockRelay");
}

function getERC20Contract(argv, signer) {
  return getContract(argv, signer, "token", "ERC20Detailed");
}

function getStatusPayContract(argv, signer) {
  return getContract(argv, signer, "statuspay", "StatusPay");
}

function getBlockOptions(argv) {
  if (!argv["blockHash"] || !argv["blockNumber"]) {
    console.error(`the --blockHash and --blockNumber options must be specified`);
    process.exit(1);
  }

  return {blockNumber: argv["blockNumber"], blockHash: argv["blockHash"]};
}

async function initBlockRelay(argv, signer) {
  let blockRelay = getBlockRelayContract(argv, signer);
  let opts = getBlockOptions(argv);
  await signer.sendDataTx(blockRelay.address, blockRelay.interface.encodeFunctionData("init", [opts.blockNumber, opts.blockHash]));
}

async function addBlock(argv, signer) {
  let blockRelay = getBlockRelayContract(argv, signer);
  let opts = getBlockOptions(argv);

  await signer.sendDataTx(blockRelay.address, blockRelay.interface.encodeFunctionData("addBlock", [opts.blockNumber, opts.blockHash]));
}

async function initStatusPay(argv, signer) {
  let blockRelay = getBlockRelayContract(argv, signer);
  let erc20 = getERC20Contract(argv, signer);
  let statusPay = getStatusPayContract(argv, signer);
  let maxTxDelayInBlocks = argv["maxTxDelayInBlocks"];

  await signer.sendDataTx(statusPay.address, statusPay.interface.encodeFunctionData("init", [blockRelay.address, erc20.address, maxTxDelayInBlocks]));
}

async function createWallet(argv, signer) {

}

async function topup(argv, signer) {

}

async function withdraw(argv, signer) {

}

async function payment(argv, signer) {

}

async function info(argv, signer) {
  let statusPay = getStatusPayContract(argv, signer);

  console.log(`StatusPay (${statusPay.address})`);
  console.log("==");
  let networkOwner = await statusPay.networkOwner();
  if (networkOwner == ethers.constants.AddressZero) {
    console.log("This StatusPay instance has not yet been initialized");
  } else {
    let additionalInfo = ((signer.senderAddress != null) && (signer.senderAddress.toLowerCase() == networkOwner.toLowerCase())) ? " (you)" : "";
    console.log(`Network owner: ${networkOwner}${additionalInfo}`);
  }

  argv["token"] = await statusPay.token();
  let erc20 = getERC20Contract(argv, signer);

  argv["blockrelay"] = await statusPay.blockRelay();
  let blockRelay = getBlockRelayContract(argv, signer);

  let erc20Unit = await erc20.decimals();
  let ownedTokens = ethers.utils.formatUnits(await erc20.balanceOf(statusPay.address), erc20Unit);

  console.log(`Token: ${erc20.address}`);
  console.log(`Block Relay: ${blockRelay.address}`);
  console.log(`Max transaction delay in blocks: ${await statusPay.maxTxDelayInBlocks()}`);
  console.log(`Deposited token amount: ${ownedTokens}\n`);

  if (argv["keycard"]) {
    argv["wallet"] = await statusPay.keycards(argv["keycard"]);
    if (argv["wallet"] == ethers.constants.AddressZero) {
      console.log(`Keycard ${argv["wallet"]} has no associated account\n`);
      argv["wallet"] = null;
    }
  }

  if (argv["wallet"]) {
    let account = await statusPay.accounts(argv["wallet"]);

    if (!account.exists) {
      let additionalInfo = argv["keycard"] ? `, but Keycard ${argv["keycard"]} is associated to it` : "";
      console.log(`Account ${argv["wallet"]} does not exist${additionalInfo}\n`);
    } else {
      console.log(`Account (${argv["wallet"]})`);
      console.log("==");
      if (argv["keycard"]) {
        console.log(`Keycard (there can be others too): ${argv["keycard"]}`);
      }
      console.log(`Balance: ${ethers.utils.formatUnits(account.balance, erc20Unit)}`);
      console.log(`Last payment on block: ${account.lastUsedBlock}`);
      console.log(`Cool-off period in blocks: ${account.minBlockDistance}`);
      console.log(`Max transaction amount: ${ethers.utils.formatUnits(account.maxTxAmount, erc20Unit)}\n`);
    }
  }

  console.log(`Token (${erc20.address})`);
  console.log("==");
  console.log(`Name: ${await erc20.name()}`);
  console.log(`Symbol: ${await erc20.symbol()}`);
  console.log(`Total supply: ${ethers.utils.formatUnits(await erc20.totalSupply(), erc20Unit)}\n`);

  let lastBlock = await blockRelay.getLast();
  console.log(`BlockRelay (${blockRelay.address})`);
  console.log("==");
  console.log(`Last block: ${lastBlock}`);
  console.log(`Last hash: ${await blockRelay.getHash(lastBlock)}`);
}

async function run() {
  let signer = await loadSigner(argv, "signer", "passfile");

  switch(argv["cmd"]) {
    case "init-block-relay":
      await initBlockRelay(argv, signer);
      break;
    case "add-block":
      await addBlock(argv, signer);
      break;
    case "init-status-pay":
      await initStatusPay(argv, signer);
      break;
    case "create-wallet":
      await createWallet(argv, signer);
      break;
    case "topup":
      await topup(argv, signer);
      break;
    case "withdraw":
      await withdraw(argv, signer);
      break;
    case "payment":
      await payment(argv, signer);
      break;
    case "info":
      await info(argv, signer);
      break;
    default:
      console.log("The --cmd option is mandatory. Possible commands: init-block-relay, add-block, init-status-pay, create-wallet, topup, withdraw, payment");
      process.exit(1);
  }

  process.exit(0);
}

run();
