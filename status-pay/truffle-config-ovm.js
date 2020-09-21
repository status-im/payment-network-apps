const ganache = require('@eth-optimism/ovm-toolchain/build/src/ganache').ganache;
const mnemonic = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";

const gasPrice = process.env.OVM_DEFAULT_GAS_PRICE || 0;
const gas = process.env.OVM_DEFAULT_GAS || 1000000000;


module.exports = {
  contracts_build_directory: './build/contracts',

  networks: {
    test: {
      network_id: 108,
      networkCheckTimeout: 100000,
      provider: function() {
        return ganache.provider({mnemonic: mnemonic, network_id: 108, default_balance_ether: 100, gasLimit: gas, gasPrice: gasPrice})
      },
      gasPrice: gasPrice,
      gas: gas,
    },
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    timeout: 100000
  },

  compilers: {
    solc: {
      // Add path to the solc-transpiler
      version: "./node_modules/@eth-optimism/solc",
    }
  }
}