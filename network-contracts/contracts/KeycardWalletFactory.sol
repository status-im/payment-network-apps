pragma solidity ^0.5.0;

import './KeycardWallet.sol';

contract KeycardWalletFactory {
  mapping(address => address[]) public ownersWallets;
  mapping(address => address) public keycardsWallets;

  event NewWallet(
    KeycardWallet wallet,
    bytes3 name
  );

  function create(bytes3 name, address keycard, uint256 maxTxValue) public {
    KeycardWallet wallet = new KeycardWallet(name, keycard, maxTxValue);
    ownersWallets[msg.sender].push(address(wallet));
    keycardsWallets[keycard] = address(wallet);
    emit NewWallet(wallet, name);
  }

  function ownerWalletsCount(address owner) public view returns(uint256) {
    return ownersWallets[owner].length;
  }
}
