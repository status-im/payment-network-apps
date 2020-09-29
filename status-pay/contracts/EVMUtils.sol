// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.7.0;

import "./IBlockRelay.sol";

library EVMUtils {
  function eip712Hash(bytes32 _domainSeparator, bytes32 _messageHash) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked(
      "\x19\x01",
      _domainSeparator,
      _messageHash
    ));
  }

  function getChainID() internal pure returns (uint256) {
    uint256 id;
    assembly {
      id := chainid()
    }

    return id;
  }
}