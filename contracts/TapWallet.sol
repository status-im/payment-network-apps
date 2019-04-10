pragma solidity ^0.5.0;

contract TapWallet {
  event NewPaymentRequest(uint256 nonce, address to, uint256 value);
  event NewWithdrawal(address to, uint256 value);

  address public owner;
  bytes3 public name;
  address public keycard;
  uint256 public nonce;
  Settings public settings;
  mapping(address => uint) public pendingWithdrawals;

  struct Settings {
    uint256 maxTxValue;
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "owner required");
    _;
  }

  // anyone can add funds to the wallet
  function () external payable {}

  constructor(bytes3 _name, address _keycard, uint256 _maxTxValue) public {
    owner = msg.sender;
    name = _name;
    keycard = _keycard;
    settings.maxTxValue = _maxTxValue;
    nonce = 0;
  }

  function setKeycard(address _keycard) public onlyOwner {
    keycard = _keycard;
  }

  function setSettings(uint256 _maxTxValue) public onlyOwner {
    settings.maxTxValue = _maxTxValue;
  }

  function recover(bytes32 hash, bytes memory sig) public pure returns(address) {
    require(sig.length == 65, "bad signature length");

    bytes32 r;
    bytes32 s;
    uint8 v;

    assembly {
      r := mload(add(sig, 32))
      s := mload(add(sig, 64))
      v := byte(0, mload(add(sig, 96)))
    }

    if (v < 27) {
      v += 27;
    }

    require(v == 27 || v == 28, "signature version doesn't match");

    return ecrecover(hash, v, r, s);
  }

  function requestPayment(bytes32 _hashToSign, bytes memory _signature, uint256 _nonce, address payable _to, uint256 _value) public {
    // check that a keycard address has been set
    require(keycard != address(0), "keycard address not set");

    // check that the _hashToSign has been produced with the nonce, to, and value
    bytes32 message = keccak256(abi.encodePacked(_nonce, _to, _value));
    bytes memory prefix = "\x19Ethereum Signed Message:\n32";
    bytes32 expectedHash = keccak256(abi.encodePacked(prefix, message));
    require(expectedHash == _hashToSign, "signed params are different");

    // check that the _hashToSign has been signed by the keycard
    address signer = recover(_hashToSign, _signature);
    require(signer == keycard, "signer is not the keycard");

    // check that the nonce is valid
    require(nonce == _nonce, "invalid nonce");

    // check that balance is enough for this payment
    require((address(this).balance - _value) >= 0, "balance is not enough");

    // check that _value is not greater than settings.maxTxValue
    require(_value <= settings.maxTxValue, "amount not allowed");

    // increment nonce
    nonce++;

    // add pendingWithdrawal
    pendingWithdrawals[_to] += _value;

    emit NewPaymentRequest(_nonce, _to, _value);
  }

  function withdraw() public {
    uint256 amount = pendingWithdrawals[msg.sender];
    require(amount > 0, "no pending withdrawal");

    pendingWithdrawals[msg.sender] = 0;
    msg.sender.transfer(amount);
    emit NewWithdrawal(msg.sender, amount);
  }
}
