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

  function recoverSigner(bytes32 _digest, bytes memory _sig) internal pure returns (address) {
    require(_sig.length == 65, "bad signature length");

    bytes32 r;
    bytes32 s;
    uint8 v;

	  // solium-disable-next-line security/no-inline-assembly
    assembly {
      r := mload(add(_sig, 32))
      s := mload(add(_sig, 64))
      v := byte(0, mload(add(_sig, 96)))
    }

    if (v < 27) {
      v += 27;
    }

    require(v == 27 || v == 28, "signature version doesn't match");
    return ecrecover(_digest, v, r, s);
  }

  function getChainID() internal pure returns (uint256) {
    uint256 id;
    assembly {
      id := chainid()
    }

    return id;
  }
}