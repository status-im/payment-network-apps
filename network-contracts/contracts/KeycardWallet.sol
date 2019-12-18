pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract KeycardWallet {
  event TopUp(address from, uint256 value);
  event NewPaymentRequest(uint256 blockNumber, address to, uint256 amount);
  event NewWithdrawal(address to, uint256 value);

  //TODO: replace with chainid opcode
  uint256 constant chainId = 1;

  // must be less than 256, because the hash of older blocks cannot be retrieved
  uint256 constant maxTxDelayInBlocks = 10;

  struct Payment {
    uint256 blockNumber;
    bytes32 blockHash;
    uint256 amount;
    address to;
  }

  bytes32 constant EIP712DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
  bytes32 constant PAYMENT_TYPEHASH = keccak256("Payment(uint256 blockNumber,bytes32 blockHash,uint256 amount,address to)");
  bytes32 DOMAIN_SEPARATOR;

  address public factory;
  address public owner;
  bytes3 public name;
  address public keycard;
  Settings public settings;
  mapping(address => uint) public pendingWithdrawals;
  uint256 public totalPendingWithdrawals;
  uint256 public lastUsedBlockNum;

  struct Settings {
    uint256 maxTxValue;
    uint256 minBlockDistance;
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "owner required");
    _;
  }

  // anyone can add funds to the wallet
  function () external payable {
    emit TopUp(msg.sender, msg.value);
  }

  constructor(bytes3 _name, address _keycard, uint256 _maxTxValue, address _factory) public {
    DOMAIN_SEPARATOR = keccak256(abi.encode(
      EIP712DOMAIN_TYPEHASH,
      keccak256("KeycardWallet"),
      keccak256("1"),
      chainId,
      _factory
    ));

    owner = msg.sender;
    name = _name;
    keycard = _keycard;
    factory = _factory;
    settings.maxTxValue = _maxTxValue;
    settings.minBlockDistance = 1;
    totalPendingWithdrawals = 0;
    lastUsedBlockNum = block.number;
  }

  function setKeycard(address _keycard) public onlyOwner {
    keycard = _keycard;
  }

  function setSettings(uint256 _maxTxValue) public onlyOwner {
    settings.maxTxValue = _maxTxValue;
  }

  function hash(Payment memory _payment) internal pure returns (bytes32) {
    return keccak256(abi.encode(
      PAYMENT_TYPEHASH,
      _payment.blockNumber,
      _payment.blockHash,
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
    require(_payment.blockNumber < block.number, "transaction cannot be in the future");

    // check that the block number used is not too old
    require(_payment.blockNumber >= (block.number - maxTxDelayInBlocks), "transaction too old");

    // check that the block number is not too near to the last one in which a tx has been processed
    require(_payment.blockNumber >= (lastUsedBlockNum + settings.minBlockDistance), "cooldown period not expired yet");

    // check that the blockHash is valid
    require(_payment.blockHash == blockhash(_payment.blockNumber), "invalid block hash");

    // check that _payment.amount is not greater than settings.maxTxValue
    require(_payment.amount <= settings.maxTxValue, "amount not allowed");

    int256 availableBalance = int256(address(this).balance - totalPendingWithdrawals - _payment.amount);
    // check that balance is enough for this payment
    require(availableBalance >= 0, "balance is not enough");

    // set new baseline block for checks
    lastUsedBlockNum = block.number;

    // add pendingWithdrawal
    totalPendingWithdrawals += _payment.amount;
    pendingWithdrawals[_payment.to] += _payment.amount;

    emit NewPaymentRequest(_payment.blockNumber, _payment.to, _payment.amount);
  }

  function withdraw() public {
    uint256 amount = pendingWithdrawals[msg.sender];
    require(amount > 0, "no pending withdrawal");

    pendingWithdrawals[msg.sender] = 0;
    totalPendingWithdrawals -= amount;

    msg.sender.transfer(amount);
    emit NewWithdrawal(msg.sender, amount);
  }
}
