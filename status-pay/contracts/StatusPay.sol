// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/cryptography/ECDSA.sol";

import "./IBlockRelay.sol";
import "./BlockConsumer.sol";
import "./EVMUtils.sol";

contract StatusPay is BlockConsumer {
  event NewPayment(address from, address to, uint256 amount);
  event TopUp(address account, uint256 amount);
  event Withdraw(address account, uint256 amount);

  struct Payment {
    uint256 blockNumber;
    bytes32 blockHash;
    uint256 amount;
    address to;
  }

  struct Unlock {
    uint256 blockNumber;
    bytes32 blockHash;
    bytes32 code;
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
  bytes32 constant UNLOCK_TYPEHASH = keccak256("Unlock(uint256 blockNumber,bytes32 blockHash,bytes32 code)");
  bytes32 public DOMAIN_SEPARATOR;

  uint256 public maxTxDelayInBlocks;
  IERC20 public token;
  address public networkOwner;
  uint256 public nextAccount;

  mapping(address => address) public keycards;
  mapping(address => address) public owners;
  mapping(bytes32 => address) public codes;
  mapping(address => Account) public accounts;

  function initialize(address _blockRelay, address _token, uint256 _maxDelayInBlocks) public {
    require(networkOwner == address(0), "already done");

    networkOwner = msg.sender;
    _setBlockRelay(_blockRelay);
    token = IERC20(_token);
    nextAccount = 1;

    require(_maxDelayInBlocks <= blockHistorySize(), "max delay cannot be more than history size");

    maxTxDelayInBlocks = _maxDelayInBlocks;

    DOMAIN_SEPARATOR = keccak256(abi.encode(
      EIP712DOMAIN_TYPEHASH,
      keccak256("StatusPay"),
      keccak256("1"),
      EVMUtils.getChainID(),
      address(this)
    ));
  }

  function totalSupply() public view returns (uint256) {
    return token.balanceOf(address(this));
  }

  function balanceOf(address _account) public view returns (uint256) {
    (, Account memory account) = _resolveAccount(_account);
    return account.balance;
  }

  function resolveAccount(address _addressOrOwnerOrKeycard) public view returns (address) {
    (address addr, ) = _resolveAccount(_addressOrOwnerOrKeycard);
    return addr;
  }

  function _resolveAccount(address _addressOrOwnerOrKeycard) internal view returns (address, Account storage) {
    address accountAddress = _addressOrOwnerOrKeycard;
    Account storage account = accounts[accountAddress];

    if (!account.exists) {
      accountAddress = owners[_addressOrOwnerOrKeycard];
      account = accounts[accountAddress];

      if (!account.exists) {
        accountAddress = keycards[_addressOrOwnerOrKeycard];
        account = accounts[accountAddress];
      }
    }

    return (accountAddress, account);
  }

  function name() public view returns (string memory) {
    string memory sym = ERC20Detailed(address(token)).symbol();
    return string(abi.encodePacked(sym, " in Status Pay"));
  }

  function symbol() public view returns (string memory) {
    string memory sym = ERC20Detailed(address(token)).symbol();
    return string(abi.encodePacked("s", sym));
  }

  function decimals() public view returns (uint8) {
    return ERC20Detailed(address(token)).decimals();
  }

  function createAccount(address _keycard, uint256 _minBlockDistance, uint256 _maxTxAmount) public {
    require(owners[msg.sender] == address(0), "already exists");
    owners[msg.sender] = address(nextAccount);
    _createAccount(_keycard, _minBlockDistance, _maxTxAmount);
  }

  function createUnlockableAccount(address _keycard, uint256 _minBlockDistance, uint256 _maxTxAmount, bytes32 _code) public {
    require(codes[_code] == address(0), "code must be unique");
    codes[_code] = address(nextAccount);
    _createAccount(_keycard, _minBlockDistance, _maxTxAmount);
  }

  function _createAccount(address _keycard, uint256 _minBlockDistance, uint256 _maxTxAmount) internal {
    address accountAddr = address(nextAccount);
    nextAccount++;
    Account storage account = accounts[accountAddr];

    if (_keycard != address(0)) {
      _addKeycard(_keycard, accountAddr);
    }

    account.exists = true;
    account.lastUsedBlock = currentBlock() - 1;
    account.minBlockDistance = _minBlockDistance;
    account.maxTxAmount = _maxTxAmount;
  }

  function transferAccount(address _newOwner) public {
    require(owners[msg.sender] != address(0), "account to transfer does not exist");
    require(owners[_newOwner] == address(0), "the new owner already has an account");

    owners[_newOwner] = owners[msg.sender];
    owners[msg.sender] = address(0);
  }

  function setMaxTxAmount(uint256 _amount) public {
    Account storage account = accounts[owners[msg.sender]];
    require(account.exists, "no account found");
    account.maxTxAmount = _amount;
  }

  function setMinBlockDistance(uint256 _distance) public {
    Account storage account = accounts[owners[msg.sender]];
    require(account.exists, "no account found");
    account.minBlockDistance = _distance;
  }

  function addKeycard(address _keycard) public {
    address account = owners[msg.sender];
    require(account != address(0), "no account for this address");

    _addKeycard(_keycard, account);
  }

  function _addKeycard(address _keycard, address _account) internal {
    require(!accounts[keycards[_keycard]].exists, "keycard already assigned");
    keycards[_keycard] = _account;
  }

  function removeKeycard(address _keycard) public {
    require(keycards[_keycard] == owners[msg.sender], "keycard not owned");
    keycards[_keycard] = address(0);
  }

  function topupKeycard(address _keycard, uint256 _amount) public {
    _topup(keycards[_keycard], _amount);
  }

  function topup(uint256 _amount) public {
    _topup(owners[msg.sender], _amount);
  }

  function _topup(address _id, uint256 _amount) internal {
    Account storage topped = accounts[_id];
    require(topped.exists, "account does not exist");
    require(token.transferFrom(msg.sender, address(this), _amount), "transfer failed");

    topped.balance += _amount;
    emit TopUp(_id, _amount);
  }

  function withdraw(uint256 _amount) public {
    address acc = owners[msg.sender];
    Account storage exiting = accounts[acc];
    require(exiting.exists, "account does not exist");
    require(exiting.balance >= _amount, "not enough balance");

    exiting.balance -= _amount;
    require(token.transfer(msg.sender, _amount), "transfer failed");
    emit Withdraw(acc, _amount);
  }

  function unlockAccount(Unlock memory _unlock, bytes memory _signature) public {
    require(owners[msg.sender] == address(0), "this owner already has an account");
    address signer = ECDSA.recover(EVMUtils.eip712Hash(DOMAIN_SEPARATOR, hashUnlock(_unlock)), _signature);
    address accountAddress = keycards[signer];

    validateAnchorBlock(_unlock.blockNumber, _unlock.blockHash, maxTxDelayInBlocks);

    // check that a keycard is associated to this account
    require(accountAddress != address(0), "no account for this Keycard");

    // validate code
    bytes32 codeHash = keccak256(abi.encodePacked(DOMAIN_SEPARATOR, signer, _unlock.code));
    require(codes[codeHash] == accountAddress, "invalid code");

    owners[msg.sender] = accountAddress;
    codes[codeHash] = address(0);
  }

  function requestPayment(Payment memory _payment, bytes memory _signature) public {
    address signer = ECDSA.recover(EVMUtils.eip712Hash(DOMAIN_SEPARATOR, hashPayment(_payment)), _signature);
    (address payerAddress, Account storage payer) = _resolveAccount(signer);
    require(payer.exists, "payer account not found");

    (address payeeAddress, Account storage payee) = _resolveAccount(_payment.to);
    require(payee.exists, "payee account does not exist");

    // check that _payment.amount is not greater than the maxTxValue for this currency
    require(_payment.amount <= payer.maxTxAmount, "amount not allowed");

    // check that balance is enough for this payment
    require(payer.balance >= _payment.amount, "balance is not enough");

    uint256 blockNumber = validateAnchorBlock(_payment.blockNumber, _payment.blockHash, maxTxDelayInBlocks);

    // check that the block number is not too near to the last one in which a tx has been processed
    require(_payment.blockNumber >= (payer.lastUsedBlock + payer.minBlockDistance), "cooldown period not expired yet");

    // perform transfer
    payer.balance -= _payment.amount;
    payee.balance += _payment.amount;

    // set new baseline block for checks
    payer.lastUsedBlock = blockNumber;
    emit NewPayment(payerAddress, payeeAddress, _payment.amount);
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

  function hashUnlock(Unlock memory _unlock) internal pure returns (bytes32) {
    return keccak256(abi.encode(
      UNLOCK_TYPEHASH,
      _unlock.blockNumber,
      _unlock.blockHash,
      _unlock.code
    ));
  }
}