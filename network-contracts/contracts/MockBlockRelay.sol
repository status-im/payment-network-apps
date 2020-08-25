pragma solidity >=0.5.0 <0.7.0;

import "./IBlockRelay.sol";

contract MockBlockRelay is IBlockRelay {
  uint256 public lastBlock;
  mapping (uint256 => bytes32) public hashes;

  function getNumber() public override view returns (uint256) {
    return lastBlock;
  }

  function getHash(uint256 num) public override view returns (bytes32) {
    if ((num > lastBlock) || (lastBlock - num) > 255) {
      return bytes32(0);
    }

    return hashes[num % 256];
  }

  function addBlock(uint256 num, bytes32 h) external {
    require(num > lastBlock, "You can only add newer blocks");
    hashes[num % 255] = h;
    lastBlock = num;
  }
}