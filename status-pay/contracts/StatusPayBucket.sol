// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "./StatusPay.sol";
import "./EVMUtils.sol";

contract StatusPayBucket {
  address payable public owner;
  uint256 public redeemableSupply;
  StatusPay public statusPay;
  uint256 public expirationTime;
  uint256 public startTime;
  uint256 public maxTxDelayInBlocks;
  uint256 public minBlockDistance;
  uint256 public maxTxAmount;
  bool public destroyed;

  bytes32 constant REDEEM_TYPEHASH = keccak256("Redeem(uint256 blockNumber,bytes32 blockHash,address receiver,bytes32 code)");
  bytes32 constant EIP712DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
  bytes32 DOMAIN_SEPARATOR;

  struct Redeemable {
    address recipient;
    bytes32 code;
    uint256 data;
  }

  struct Redeem {
    uint256 blockNumber;
    bytes32 blockHash;
    address receiver;
    bytes32 code;
  }

  event Redeemed(address indexed recipient, uint256 indexed data);

  mapping(address => Redeemable) public redeemables;

  modifier onlyOwner() {
    require(msg.sender == owner, "owner required");
    require(!destroyed, "destroyed");
    _;
  }

  function initialize(address _statusPay, uint256 _startTime, uint256 _expirationTime, uint256 _maxTxDelayInBlocks, uint256 _minBlockDistance, uint256 _maxTxAmount) public {
    require(owner == address(0), "already done");
    require(_maxTxDelayInBlocks > 0 && _maxTxDelayInBlocks < 256, "the valid range is 1 to 255");
    require(_expirationTime > block.timestamp, "expiration can't be in the past");

    statusPay = StatusPay(_statusPay);
    startTime = _startTime;
    expirationTime = _expirationTime;
    maxTxDelayInBlocks = _maxTxDelayInBlocks;
    minBlockDistance = _minBlockDistance;
    maxTxAmount = _maxTxAmount;
    owner = msg.sender;

    DOMAIN_SEPARATOR = keccak256(abi.encode(
      EIP712DOMAIN_TYPEHASH,
      keccak256("StatusPayBucket"),
      keccak256("1"),
      EVMUtils.getChainID(),
      address(this)
    ));
  }

  function redeem(Redeem calldata _redeem, bytes calldata _sig) external {
    // validate Redeem
    require(_redeem.blockNumber < block.number, "transaction cannot be in the future");
    require(_redeem.blockNumber >= (block.number - maxTxDelayInBlocks), "transaction too old");
    require(_redeem.blockHash == blockhash(_redeem.blockNumber), "invalid block hash");
    require(block.timestamp < expirationTime, "expired redeemable");
    require(block.timestamp > startTime, "reedeming not yet started");

    address recipient =  EVMUtils.recoverSigner(EVMUtils.eip712Hash(DOMAIN_SEPARATOR, hashRedeem(_redeem)), _sig);

    Redeemable storage redeemable = redeemables[recipient];
    require(redeemable.recipient == recipient, "not found");

    // validate code
    bytes32 codeHash = keccak256(abi.encodePacked(_redeem.code));
    require(codeHash == redeemable.code, "invalid code");

    transferRedeemable(redeemable, _redeem);

    emit Redeemed(recipient, redeemable.data);

    redeemable.recipient = address(0);
    redeemable.code = 0;
    redeemable.data = 0;
  }

  function kill() external onlyOwner {
    require(block.timestamp >= expirationTime, "not expired yet");
    transferRedeemablesToOwner();
    // selfdestruct shouldnt be used in upgradable contracts: https://docs.openzeppelin.com/upgrades/2.8/writing-upgradeable#potentially-unsafe-operations
    destroyed = true;
  }

  function hashRedeem(Redeem memory _redeem) internal pure returns (bytes32) {
    return keccak256(abi.encode(
      REDEEM_TYPEHASH,
      _redeem.blockNumber,
      _redeem.blockHash,
      _redeem.receiver,
      _redeem.code
    ));
  }

  function totalSupply() public view returns(uint256) {
    return statusPay.token().balanceOf(address(this));
  }

  function availableSupply() public view returns(uint256) {
    uint256 _totalSupply = this.totalSupply();
    require(_totalSupply >= redeemableSupply, "redeemableSupply is greater than redeemableSupply");

    return _totalSupply - redeemableSupply;
  }

  function createRedeemable(address _recipient, uint256 _amount, bytes32 _code) external onlyOwner {
    require(_amount > 0, "invalid amount");

    uint256 _availableSupply = this.availableSupply();
    require(_availableSupply >= _amount, "low supply");

    Redeemable storage redeemable = redeemables[_recipient];
    require(redeemable.recipient == address(0), "recipient already used");

    redeemable.recipient = _recipient;
    redeemable.code = _code;
    redeemable.data = _amount;

    require(redeemableSupply + _amount > redeemableSupply, "addition overflow");
    redeemableSupply += _amount;
  }

  function transferRedeemable(Redeemable memory _redeemable, Redeem memory _redeem) internal {
    require(redeemableSupply >= _redeemable.data, "not enough redeemable supply");
    redeemableSupply -= _redeemable.data;

    if (statusPay.owners(_redeem.receiver) == address(0)) {
      statusPay.createAccount(_redeem.receiver, _redeemable.recipient, minBlockDistance, maxTxAmount);
    }

    statusPay.token().approve(address(statusPay), _redeemable.data);
    statusPay.topup(_redeem.receiver, _redeemable.data);
  }

  function transferRedeemablesToOwner() internal {
    require(statusPay.token().transfer(owner, this.totalSupply()), "transfer failed");
  }
}