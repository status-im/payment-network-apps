const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
const CONTRACTS_PATH="../build/contracts";

module.exports.loadContractFile = (fileName) => {
  let content = fs.readFileSync(path.join(__dirname, CONTRACTS_PATH, fileName), "utf-8");
  return content;
};

module.exports.loadContract = (address, contractName, signerOrProvider) => {
  let content = this.loadContractFile(`${contractName}.json`);
  let contract = JSON.parse(content);
  return new ethers.Contract(address, contract.abi, signerOrProvider);
};