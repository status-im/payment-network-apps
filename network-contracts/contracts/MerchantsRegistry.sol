pragma solidity ^0.5.0;

contract MerchantsRegistry {
  address public owner;
  mapping(address => bool) public merchants;

  modifier onlyOwner() {
    require(msg.sender == owner, "owner required");
    _;
  }

  function init() public {
    require(owner == address(0), "this function can only be invoked once");
    owner = msg.sender;
  }

  function setOwner(address newOwner) public onlyOwner {
    owner = newOwner;
  }

  function addMerchant(address merchantAddress) public onlyOwner {
    merchants[merchantAddress] = true;
  }

  function removeMerchant(address merchantAddress) public onlyOwner {
    merchants[merchantAddress] = false;
  }
}
