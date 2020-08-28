// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "./IBlockRelay.sol";
import "./EVMUtils.sol";

contract StatusPay {
  event NewPayment(address to, uint256 amount);

  struct Payment {
    uint256 blockNumber;
    bytes32 blockHash;
    uint256 amount;
    address to;
  }

  struct Account {
    bool exists;
    uint256 balance;
    uint256 lastUsedBlock;
    uint256 minBlockDistance;
    uint256 maxTxAmount;
  }

  bytes32 constant EIP712DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
  bytes32 constant PAYMENT_TYPEHASH = keccak256("Payment(uint256 blockNumber,bytes32 blockHash,uint256 amount,address to)");
  bytes32 DOMAIN_SEPARATOR;

  uint256 public maxTxDelayInBlocks;
  IBlockRelay public blockRelay;
  IERC20 public token;
  address public networkOwner;
  uint256 public nextAccount;

  mapping(address => address) public keycards;
  mapping(address => address) public owners;
  mapping(address => Account) public accounts;

  function initialize(address _blockRelay, address _token, uint256 _maxDelayInBlocks) public {
    require(networkOwner == address(0), "already done");

    networkOwner = msg.sender;
    blockRelay = IBlockRelay(_blockRelay);
    token = IERC20(_token);
    nextAccount = 1;

    require(_maxDelayInBlocks <= blockRelay.historySize(), "max delay cannot be more than history size");

    maxTxDelayInBlocks = _maxDelayInBlocks;

    DOMAIN_SEPARATOR = keccak256(abi.encode(
      EIP712DOMAIN_TYPEHASH,
      keccak256("StatusPay"),
      keccak256("1"),
      EVMUtils.getChainID(),
      address(this)
    ));
  }

  function createAccount(address _owner, address _keycard, uint256 _minBlockDistance, uint256 _maxTxAmount) public {
    require(owners[_owner] == address(0), "already exists");

    Account storage account = accounts[address(nextAccount)];
    owners[_owner] = address(nextAccount);
    nextAccount++;

    if (_keycard != address(0)) {
      _addKeycard(_keycard, _owner);
    }

    account.exists = true;
    account.lastUsedBlock = blockRelay.getLast();
    account.minBlockDistance = _minBlockDistance;
    account.maxTxAmount = _maxTxAmount;
  }

  function transferAccount(address _newOwner) public {
    require(owners[msg.sender] != address(0), "account to transfer does not exist");
    require(owners[_newOwner] == address(0), "the new owner already has an account");

    owners[_newOwner] = owners[msg.sender];
    owners[msg.sender] = address(0);
  }

  function addKeycard(address _keycard) public {
    _addKeycard(_keycard, msg.sender);
  }

  function _addKeycard(address _keycard, address _owner) internal {
    require(!accounts[keycards[_keycard]].exists, "keycard already assigned");
    keycards[_keycard] = owners[_owner];
  }

  function removeKeycard(address _keycard) public {
    require(keycards[_keycard] == owners[msg.sender], "keycard not owned");
    keycards[_keycard] = address(0);
  }

  function topup(address _to, uint256 _amount) public {
    Account storage topped = accounts[owners[_to]];
    require(topped.exists, "account does not exist");
    require(token.transferFrom(msg.sender, address(this), _amount), "transfer failed");

    topped.balance += _amount;
  }

  function withdraw(address _to, uint256 _amount) public {
    Account storage exiting = accounts[owners[msg.sender]];
    require(exiting.exists, "account does not exist");
    require(exiting.balance >= _amount, "not enough balance");

    exiting.balance -= _amount;
    require(token.transfer(_to, _amount), "transfer failed");
  }

  function requestPayment(Payment memory _payment, bytes memory _signature) public {
    address signer = EVMUtils.recoverSigner(EVMUtils.eip712Hash(DOMAIN_SEPARATOR, hashPayment(_payment)), _signature);
    Account storage payer = accounts[keycards[signer]];

    // allow direct payment without Keycard from owner
    if (!payer.exists) {
      payer = accounts[owners[signer]];
    }

    // check that a keycard is associated to this account
    require(payer.exists, "no account for this Keycard");

    // check that the payee exists
    Account storage payee = accounts[_payment.to];

    // allow payment through owner address
    if (!payee.exists) {
      payee = accounts[owners[_payment.to]];
    }

    require(payee.exists, "payee account does not exist");

    // check that _payment.amount is not greater than the maxTxValue for this currency
    require(_payment.amount <= payer.maxTxAmount, "amount not allowed");

    // check that balance is enough for this payment
    require(payer.balance >= _payment.amount, "balance is not enough");

    uint256 blockNumber = blockRelay.getLast();

    // check that the block number used for signing is not newer than the block number
    require(_payment.blockNumber <= blockNumber, "transaction cannot be in the future");

    // check that the block number used is not too old
    require(_payment.blockNumber > (blockNumber - maxTxDelayInBlocks), "transaction too old");

    // check that the block number is not too near to the last one in which a tx has been processed
    require(_payment.blockNumber >= (payer.lastUsedBlock + payer.minBlockDistance), "cooldown period not expired yet");

    // check that the blockHash is valid
    require(_payment.blockHash == blockRelay.getHash(_payment.blockNumber), "invalid block hash");
    // this check is redundant but provideds a safety net if the oracle returns a 0 hash
    require(_payment.blockHash != bytes32(0), "invalid block hash");

    // perform transfer
    payer.balance -= _payment.amount;
    payee.balance += _payment.amount;

    // set new baseline block for checks
    payer.lastUsedBlock = blockNumber;
    emit NewPayment(_payment.to, _payment.amount);
  }

  function hashPayment(Payment memory _payment) internal pure returns (bytes32) {
    return keccak256(abi.encode(
      PAYMENT_TYPEHASH,
      _payment.blockNumber,
      _payment.blockHash,
      _payment.amount,
      _payment.to
    ));
  }
}