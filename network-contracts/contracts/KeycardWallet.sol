pragma solidity >=0.5.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "./KeycardRegistry.sol";
import "./IERC20.sol";
import "./IBlockRelay.sol";

contract KeycardWallet {
  event NewPayment(uint256 blockNumber, address to, address currency, uint256 amount);

  //TODO: replace with chainid opcode
  // uint256 constant chainId = 1;
  uint256 constant chainId = 3;
  // uint256 constant chainId = 5;
  // uint256 constant chainId = 1337;

  // must be less than 256, because the hash of older blocks cannot be retrieved
  uint256 constant maxTxDelayInBlocks = 10;

  struct Payment {
    uint256 blockNumber;
    bytes32 blockHash;
    address currency;
    uint256 amount;
    address to;
  }

  bytes32 constant EIP712DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
  bytes32 constant PAYMENT_TYPEHASH = keccak256("Payment(uint256 blockNumber,bytes32 blockHash,address currency,uint256 amount,address to)");
  bytes32 DOMAIN_SEPARATOR;

  address public register;
  address public blockRelay;
  address public owner;
  address public keycard;
  mapping(address => uint) public tokenMaxTxAmount;
  uint256 public lastUsedBlockNum;
  uint256 public minBlockDistance;

  modifier onlyOwner() {
    require(msg.sender == owner, "owner required");
    _;
  }

  constructor(address _owner, address _keycard, address _register, address _blockRelay, uint256 _minBlockDistance, address _token, uint256 _tokenMaxTxAmount) public {
    owner = _owner == address(0) ? msg.sender : _owner;
    keycard = _keycard;
    register = address(0);
    blockRelay = _blockRelay;

    minBlockDistance = _minBlockDistance;
    _setRegister(_register);
    lastUsedBlockNum = IBlockRelay(blockRelay).getNumber();
    tokenMaxTxAmount[_token] = _tokenMaxTxAmount;
  }

  function _setRegister(address _register) internal {
    if (register != address(0)) {
      KeycardRegistry(register).unregister(owner, keycard);
    }

    if (_register != address(0) && msg.sender != _register) {
      KeycardRegistry(_register).register(owner, keycard);
    }

    register = _register;

    DOMAIN_SEPARATOR = keccak256(abi.encode(
      EIP712DOMAIN_TYPEHASH,
      keccak256("KeycardWallet"),
      keccak256("1"),
      chainId,
      register
    ));
  }

  function setRegister(address _register) public onlyOwner {
    _setRegister(_register);
  }

  function setOwner(address _owner) public onlyOwner {
    if (register != address(0)) {
      KeycardRegistry(register).setOwner(owner, _owner);
    }

    owner = _owner;
  }

  function setKeycard(address _keycard) public onlyOwner {
    if (register != address(0)) {
      KeycardRegistry(register).setKeycard(keycard, _keycard);
    }

    keycard = _keycard;
  }

  function setMinBlockDistance(uint256 _minBlockDistance) public onlyOwner {
    minBlockDistance = _minBlockDistance;
  }

  function setTokenMaxTXAmount(address _token, uint256 _maxTxAmount) public onlyOwner {
    tokenMaxTxAmount[_token] = _maxTxAmount;
  }

  function hash(Payment memory _payment) internal pure returns (bytes32) {
    return keccak256(abi.encode(
      PAYMENT_TYPEHASH,
      _payment.blockNumber,
      _payment.blockHash,
      _payment.currency,
      _payment.amount,
      _payment.to
    ));
  }

  function verify(Payment memory _payment, bytes memory _sig) internal view returns (bool) {
    require(_sig.length == 65, "bad signature length");

    bytes32 r;
    bytes32 s;
    uint8 v;

    assembly {
      r := mload(add(_sig, 32))
      s := mload(add(_sig, 64))
      v := byte(0, mload(add(_sig, 96)))
    }

    if (v < 27) {
      v += 27;
    }

    require(v == 27 || v == 28, "signature version doesn't match");

    bytes32 digest = keccak256(abi.encodePacked(
        "\x19\x01",
        DOMAIN_SEPARATOR,
        hash(_payment)
    ));

    return ecrecover(digest, v, r, s) == keycard;
  }

  function requestPayment(Payment memory _payment, bytes memory _signature) public {
    // check that a keycard address has been set
    require(keycard != address(0), "keycard address not set");

    // verify the signer
    require(verify(_payment, _signature), "signer is not the keycard");

    // check that the block number used for signing is less than the block number
    require(_payment.blockNumber < IBlockRelay(blockRelay).getNumber(), "transaction cannot be in the future");

    // check that the block number used is not too old
    require(_payment.blockNumber >= (IBlockRelay(blockRelay).getNumber() - maxTxDelayInBlocks), "transaction too old");

    // check that the block number is not too near to the last one in which a tx has been processed
    require(_payment.blockNumber >= (lastUsedBlockNum + minBlockDistance), "cooldown period not expired yet");

    // check that the blockHash is valid
    require(_payment.blockHash == IBlockRelay(blockRelay).getHash(_payment.blockNumber), "invalid block hash");

    // check that _payment.amount is not greater than the maxTxValue for this currency
    require(_payment.amount <= tokenMaxTxAmount[_payment.currency], "amount not allowed");

    // check that balance is enough for this payment
    require(IERC20(_payment.currency).balanceOf(address(this)) >= _payment.amount, "balance is not enough");

    // transfer token
    require(IERC20(_payment.currency).transfer(_payment.to, _payment.amount), "transfer failed");

    // set new baseline block for checks
    lastUsedBlockNum = IBlockRelay(blockRelay).getNumber();
    emit NewPayment(_payment.blockNumber, _payment.to, _payment.currency, _payment.amount);
  }
}
