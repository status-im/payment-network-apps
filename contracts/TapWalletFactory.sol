pragma solidity ^0.5.0;

import './TapWallet.sol';

contract TapWalletFactory {
  mapping(address => address[]) public ownersWallets;
  mapping(address => address) public keycardsWallets;

  event NewWallet(
    TapWallet wallet,
    bytes3 name
  );

  function create(bytes3 name, address keycard, uint256 maxTxValue) public {
    TapWallet wallet = new TapWallet(name, keycard, maxTxValue);
    ownersWallets[msg.sender].push(address(wallet));
    keycardsWallets[keycard] = address(wallet);
    emit NewWallet(wallet, name);
  }

  function ownerWalletsCount(address owner) public view returns(uint256) {
    return ownersWallets[owner].length;
  }
}
