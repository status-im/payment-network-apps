// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.7.0;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/StandaloneERC20.sol";

contract TestERC20 is StandaloneERC20 {
  function initialize(uint256 _initialAmount) public {
    address[] memory empty = new address[](0);
    initialize("Test ERC20", "TST", 18, _initialAmount, msg.sender, empty, empty);
  }
}
