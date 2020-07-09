pragma solidity >=0.5.0 <0.7.0;

contract IBlockRelay {
  function getNumber() external view returns (uint256);
  function getHash(uint256) external view returns (bytes32);
}