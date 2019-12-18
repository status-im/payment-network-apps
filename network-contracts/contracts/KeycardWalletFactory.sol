pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './KeycardWallet.sol';

contract KeycardWalletFactory {
  mapping(address => address[]) public ownersWallets;
  mapping(address => address) public keycardsWallets;

  event NewWallet(
    KeycardWallet wallet
  );

  function create(address keycard, KeycardWallet.Settings memory settings) public {
    KeycardWallet wallet = new KeycardWallet(keycard, settings, address(this));
    ownersWallets[msg.sender].push(address(wallet));
    keycardsWallets[keycard] = address(wallet);
    emit NewWallet(wallet);
  }

  function ownerWalletsCount(address owner) public view returns(uint256) {
    return ownersWallets[owner].length;
  }
}
