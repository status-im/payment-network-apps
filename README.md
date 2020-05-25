# Keycard Payment Network

This repository contains the dApps and SmartContract used for the Keycard Payment Network. This project is still work in progress, however developers can already try it out.

The goal of the project itself is to provide the means for using the Keycard as a payment method in retail stores or other non-remote scenarios (i.e: both merchant and buyer are in the same place). The aim is to make purchases using cryptocurrencies as easy and familiar as tapping your card to POS. Note that there is no crypto-to-fiat conversion involved so the scenario we are addressing is where all parties want to use crypto. Beside convenience, the network we are building will have several mitigation measures for unauthorized transactions. While some of these measures are already in place, more are in the works.

A guide on how to test the currently deployed version is at https://gist.github.com/gravityblast/49ea0782817ee20ba60af17bbca7b0db

## Network components

Currently the network is made of the following components:

* **Keycard Wallet**: This smartcontract is the buyer-side contract which holds fund, performs security checks and approves payment requests from merchant. The owner of the contract can configure the Keycard authorized for signing, the max tx amount, etc. Payment requests are meta-transactions which must be signed by the authorized Keycard. Only ERC20 tokens are supported for payments.
* **Keycard Wallet Factory**: This smartcontract is both a factory to create new wallets and a registry keeping the association between Keycards and Wallets. This is needed during payment to lookup the address of the wallet by having the address of the Keycard.
* **Keycard Cash**: This is an applet running on the Keycard which is completely independent from the hardware wallet applet. This applet simply generates a random keypair on install which cannot be exported and signs any hash presented to it. This is used as an authorization factor for payments proving the physical presence of the card (and supposedly its owner) at the moment of the transaction.
* **Merchant wallet**: The merchant wallet is the final recipient of a payment transaction. At the moment simple EOA are used for merchant wallets. However the plain is to first introduce a merchant registry and secondly a merchant wallet contract in order to implement merchant-related fraud mitigation strategies. Since one of the goal is to keep the system as open as possible and to have anybody be possibly a merchant, a lot of work will be needed to strike a balance between security, openess and convenience.
* **POS**: A (d)App which the merchant uses to perform transactions. It must be able to communicate with the Keycard using NFC and send payment request to the wallets. Our implementation is a dApp using a Keycard-specific API, currently only supported in Status.
* **Wallet manager**: An app which allows an user to monitor transactions, funds but also configure the wallet contract settings (like the authorized keycard). At the moment we have two dApps, one which does not require a web3 browser but is "read-only" and the other requiring a web3 browser which can do more. However we plan to merge these.

## Anatomy of the repository

* apps
    * pos: a dApp implementation of the POS, requires Status to work
    * simple-wallet: an webapp not requiring a web3 browser used to check balance and transactions
    * wallet: used to create wallets/set limits. Will probably be merged with simple-wallet
    * wallet-creation: used to deploy wallets from the command line, especially in batches. It can also deploy the Keycard Wallet Factory cotnracts.
* network-contracts: contains all contracts mentioned above. A MerchantsRegistry is also already there but is not yet used by other components.

## Smartcontract API

### KeycardWalletFactory

`constructor(address _currency)`

Instantiates the KeycardWalletFactory. The _currency parameter is the address of an ERC20 token.

`create(address _keycard, bool _keycardIsOwner, uint256 _minBlockDistance, uint256 _txMaxAmount)`

Creates a KeycardWallet and associates it with this register. The arguments are basically forwarded to the KeycardWallet constructor. The first argument is the address derived from the public key retruned by the Keycard Cash applet (i.e. the Keycard Cash address). The second arguments tells whether the owner of the created wallet is the caller of the method (false) or the Keycard itself. The third argument is the minimum amount of blocks which must elapse between two subsequent transactions. This is used to have a cooldown between transactions. Knowing how frequently blocks are mined this can be used to set a minimum time limit between transactions. The last parameter is the maximum amount, in tokens, of each transaction.

All other functions are called by the KeycardWallet itself so they will not documented here at this stage.

### KeycardWallet

`constructor(address _owner, address _keycard, address _register, uint256 _minBlockDistance, address _token, uint256 _tokenMaxTxAmount)`

Creates KeycardWallet. This is usually done through the KeycardWalletFactory.

`requestPayment(Payment memory _payment, bytes memory _signature)`

This function performs payments from this wallet to a merchant. The Ethereum transaction itself can be signed by any party, but the _signature field must be the signature of the _payment structure generated by the associated Keycard Cash instance. The transaction will fail if the signature does not match, the amount is over the maximum transaction amount or the balance is not enough. Additionally, the blockNumber cannot be older than 10 blocks before this transaction is processed and must be at least minBlockDistance away from the last accepted payment. The blockHash is verified to correspond to the blockNumber. This prevents sending multiple transactions at once and/or caching signed meta-transactions to be sent later thus reducing the attack venues.

The signature is calculated according to ERC-712. The Payment structure is as follow

```
  struct Payment {
    uint256 blockNumber; // The latest block number at the moment of signing this tx
    bytes32 blockHash; // The hash of the block referred by the blockNumber field
    address currency; // The ERC20 currency address used for payment
    uint256 amount; // The amount to be transferred
    address to; // The address of the recipient (merchant)
  }
```

The domain separator is as follow

```
    DOMAIN_SEPARATOR = keccak256(abi.encode(
      EIP712DOMAIN_TYPEHASH, // keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
      keccak256("KeycardWallet"),
      keccak256("1"),
      chainId,
      register // the register associated to this wallet. This makes sure that a transaction can only be submitted to a single network.
    ));
```

`setTokenMaxTXAmount(address _token, uint256 _maxTxAmount)`

Set the maximum transaction amount for the specified token. If the token had a different maximum amount this will be updated, otherwise a new entry will be created. The wallet can perform transactions with any ERC20 token for which a maximum amount has been set through this function and at wallet creation time. If a token does not have a specified maximum transaction amount it is assumed to be 0 when processing payment requests. Must be called by the owner.

`setRegister(address _register)`

Changes the registry associated to this wallet. This can be used to move the wallet to a different network. The address must refer to a smartcontract implementing the `KeycardRegistry` interface. Can only be called by the owner.

`setOwner(address _owner)`

Changes the owner of this wallet. Must be called by the current owner.

`setKeycard(address _keycard)`

Changes the keycard authorized to sign payment requests for this wallet. Must be called by the owner.

`setMinBlockDistance(uint256 _minBlockDistance)`

Changes the minimum block distance. Must be called by the owner.