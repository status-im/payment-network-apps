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

    KeycardWallet wallet = new KeycardWallet(owner, keycard, settings, address(this));
    ownersWallets[owner] = address(wallet);
    keycardsWallets[keycard] = address(wallet);
    emit NewWallet(wallet);
  }

  function setOwner(address _oldOwner, address _newOwner) public {
    address wallet = ownersWallets[_oldOwner];

    require(wallet == msg.sender, "only the registered wallet can call this");
    require(ownersWallets[_newOwner] == address(0), "the new owner already has a wallet");

    ownersWallets[_newOwner] = wallet;
    delete ownersWallets[_oldOwner];
  }

  function setKeycard(address _oldKeycard, address _newKeycard) public {
    address wallet = keycardsWallets[_oldKeycard];

    require(wallet == msg.sender, "only the registered wallet can call this");
    require(keycardsWallets[_newKeycard] == address(0), "the keycard already has a wallet");

    keycardsWallets[_newKeycard] = wallet;
    delete keycardsWallets[_oldKeycard];
  }

  function unregister(address _keycard) public {
    address wallet = ownersWallets[msg.sender];

    require(wallet != address(0), "the sender has no wallet");
    require(wallet == keycardsWallets[_keycard], "owner required");

    delete ownersWallets[msg.sender];
    delete keycardsWallets[_keycard];
  }

  function unregister(address _owner, address _keycard) public {
    address wallet = ownersWallets[_owner];

    require(wallet == msg.sender, "only the registered wallet can call this");
    require(wallet == keycardsWallets[_keycard], "only the associated keycard can be deassociated");

    delete ownersWallets[_owner];
    delete keycardsWallets[_keycard];
  }

  function register(address _owner, address _keycard) public {
    require(ownersWallets[_owner] == address(0), "the sender already has a wallet");
    require(keycardsWallets[_keycard] == address(0), "the keycard already has a wallet");

    ownersWallets[_owner] = msg.sender;
    keycardsWallets[_keycard] = msg.sender;
  }
}
