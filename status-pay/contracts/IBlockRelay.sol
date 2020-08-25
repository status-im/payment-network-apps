// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.7.0;

interface IBlockRelay {
  function getLast() external view returns (uint256);
  function getHash(uint256 /*blockNum*/) external view returns (bytes32);
  function historySize() external view returns (uint256);
}