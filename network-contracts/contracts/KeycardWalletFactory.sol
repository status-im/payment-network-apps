pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './KeycardWallet.sol';

contract KeycardWalletFactory {
  mapping(address => address) public ownersWallets;
  mapping(address => address) public keycardsWallets;

  event NewWallet(
    KeycardWallet wallet
  );

  function create(address keycard, KeycardWallet.Settings memory settings, bool keycardIsOwner) public {
    address owner = keycardIsOwner ? keycard : msg.sender;

    require(ownersWallets[owner] == address(0), "the owner already has a wallet");
    require(keycardsWallets[keycard] == address(0), "the keycard is already associated to a wallet");

    KeycardWallet wallet = new KeycardWallet(keycard, settings, address(this));
    ownersWallets[owner] = address(wallet);
    keycardsWallets[keycard] = address(wallet);
    emit NewWallet(wallet);
  }

  function setOwner(address _owner) public {
    address wallet = ownersWallets[msg.sender];

    require(wallet != address(0), "the sender has no wallet");
    require(ownersWallets[_owner] == address(0), "the new owner already has a wallet");
    require(KeycardWallet(uint160(wallet)).setOwner(_owner), "wallet call failed");

    ownersWallets[_owner] = wallet;
    delete ownersWallets[msg.sender];
  }

  function setKeycard(address _oldKeycard, address _newKeycard) public {
    address wallet = ownersWallets[msg.sender];

    require(wallet != address(0), "the sender has no wallet");
    require(keycardsWallets[_newKeycard] == address(0), "the keycard already has a wallet");
    require(wallet == keycardsWallets[_oldKeycard], "only the owner can change the associated keycard");
    require(KeycardWallet(uint160(wallet)).setKeycard(_newKeycard), "wallet call failed");

    keycardsWallets[_newKeycard] = ownersWallets[msg.sender];
    delete keycardsWallets[_oldKeycard];
  }

  function unregister(address _keycard) public {
    address wallet = ownersWallets[msg.sender];

    require(wallet != address(0), "the sender has no wallet");
    require(wallet == keycardsWallets[_keycard], "owner required");

    delete ownersWallets[msg.sender];
    delete keycardsWallets[_keycard];
  }
}
