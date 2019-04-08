pragma solidity ^0.5.0;

import './TapWallet.sol';

contract TapWalletFactory {
  mapping(address => address[]) public ownersWallets;

  event NewWallet(
    TapWallet wallet,
    bytes3 name
  );

  function create(bytes3 name) public {
    TapWallet wallet = new TapWallet(name);
    ownersWallets[msg.sender].push(address(wallet));
    emit NewWallet(wallet, name);
  }

  function ownerWalletsCount(address owner) public view returns(uint256) {
    return ownersWallets[owner].length;
  }
}
