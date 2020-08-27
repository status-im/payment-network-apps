// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.7.0;

import "./IBlockRelay.sol";

contract BlockRelay is IBlockRelay {
  uint256 public lastBlock;
  mapping (uint256 => bytes32) public hashes;
  address owner;

  uint256 constant HISTORY_SIZE = 50;

  function initialize(uint256 _firstBlock, bytes32 _firstHash) public {
    require(owner == address(0), "already done");
    owner = msg.sender;
    addBlock(_firstBlock, _firstHash);
  }

  function getLast() public view returns (uint256) {
    return lastBlock;
  }

  function getHash(uint256 num) public view returns (bytes32) {
    if ((num > lastBlock) || (lastBlock - num) >= HISTORY_SIZE) {
      return bytes32(0);
    }

    return hashes[num % HISTORY_SIZE];
  }

  function historySize() external view returns (uint256) {
    return HISTORY_SIZE;
  }

  function addBlock(uint256 num, bytes32 h) public {
    require(num > lastBlock, "You can only add newer blocks");

    hashes[num % HISTORY_SIZE] = h;
    lastBlock = num;
  }
}