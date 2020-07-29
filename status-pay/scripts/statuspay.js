const Account = require('./account.js');
const utils = require('./utils.js');
const parseArgs = require('minimist');
const BRIDGE_ADDRESS = '0xa9f96d8761aa05430d3ee2e7dff6b04978f13369';
const RPC_URL = `https://${BRIDGE_ADDRESS}.fly.dev`;

const argv = parseArgs(process.argv.slice(2), {string: ["token", "wallet", "blockrelay", "statuspay", "keycard", "merchant", "blockHash"], default: {"endpoint": RPC_URL, "token": "0x722dd3f80bac40c951b51bdd28dd19d435762180", maxBlockDistance: 10}});

async function loadSigner(argv, signer, passfile) {
  let account = new Account();

  if (argv[signer]) {
    if (!argv[passfile]) {
      console.error(`the --${passfile} option must be specified`);
      process.exit(1);
    }

    await account.init(argv[signer], argv[passfile]);
  } else {
    console.error(`--${signer} is required`);
    process.exit(1);
  }

  return account;
}

function getContract(argv, signer, optName, contractName) {
  if (!argv[optName]) {
    console.error(`the --{optName} option must be specified`);
    process.exit(1);
  }

  return utils.loadContract(argv[optName], contractName, signer.sender);
}

function getBlockRelayContract(argv, signer) {
  return getContract(argv, signer, "blockrelay", "BlockRelay");
}

function getERC20Contract(argv, signer) {
  return getContract(argv, signer, "token", "ERC20");
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

  await signer.sendDataTx(blockRelay.address, blockRelay.interface.functions.init.encode([opts.blockNumber, opts.blockHash]));
}

async function addBlock(argv, signer) {
  let blockRelay = getBlockRelayContract(argv, signer);
  let opts = getBlockOptions(argv);

  await signer.sendDataTx(blockRelay.address, blockRelay.interface.functions.addBlock.encode([opts.blockNumber, opts.blockHash]));
}

async function initStatusPay(argv, signer) {
  let blockRelay = getBlockRelayContract(argv, signer);
  let erc20 = getERC20Contract(argv, signer);
  let statusPay = getStatusPayContract(argv, signer);
  let maxBlockDistance = argv["maxBlockDistance"];

  await signer.sendDataTx(statusPay.address, statusPay.interface.functions.init.encode([blockRelay.address, erc20.address, maxBlockDistance]));
}

async function createWallet(argv, signer) {

}

async function topup(argv, signer) {

}

async function withdraw(argv, signer) {

}

async function payment(argv, signer) {

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
    default:
      console.log("The --cmd option is mandatory. Possible commands: init-block-relay, add-block, init-status-pay, create-wallet, topup, withdraw, payment");
      process.exit(1);
  }

  process.exit(0);
}

run();
