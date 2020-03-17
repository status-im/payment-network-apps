pragma solidity >=0.5.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "./KeycardWallet.sol";
import "./KeycardRegistry.sol";

contract KeycardWalletFactory is KeycardRegistry {
  mapping(address => address) public keycardsWallets;
  address public currency;

  event NewWallet(KeycardWallet wallet);

  constructor(address _currency) public {
    currency = _currency;
  }

  function create(address _keycard, bool _keycardIsOwner, uint256 _minBlockDistance, uint256 _txMaxAmount) public {
    address owner = _keycardIsOwner ? _keycard : msg.sender;

    require(keycardsWallets[_keycard] == address(0), "the keycard is already associated to a wallet");

    KeycardWallet wallet = new KeycardWallet(owner, _keycard, address(this), _minBlockDistance, currency, _txMaxAmount);
    keycardsWallets[_keycard] = address(wallet);
    emit NewWallet(wallet);
  }

  function setKeycard(address _oldKeycard, address _newKeycard) public {
    address wallet = keycardsWallets[_oldKeycard];

    require(wallet == msg.sender, "only the registered wallet can call this");
    require(keycardsWallets[_newKeycard] == address(0), "the keycard already has a wallet");

    keycardsWallets[_newKeycard] = wallet;
    delete keycardsWallets[_oldKeycard];
  }

  function unregister(address _keycard) public {
    require(msg.sender == keycardsWallets[_keycard], "only the associated keycard can be deassociated");
    delete keycardsWallets[_keycard];
  }

  function register(address _keycard) public {
    require(keycardsWallets[_keycard] == address(0), "the keycard already has a wallet");
    keycardsWallets[_keycard] = msg.sender;
  }
}
