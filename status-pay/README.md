# Status Pay

This repository contains the dApps and SmartContract used for Status Pay. This project is still work in progress, however developers can already try it out.

The goal of the project itself is to provide the means for using the Keycard as a payment method in retail stores or other non-remote scenarios (i.e: both merchant and buyer are in the same place). The aim is to make purchases using cryptocurrencies as easy and familiar as tapping your card to POS. Note that there is no crypto-to-fiat conversion involved so the scenario we are addressing is where all parties want to use crypto. Beside convenience, the network we are building will have several mitigation measures for unauthorized transactions. While some of these measures are already in place, more are in the works.

## Network components

Currently the network is made of the following components:

* **StatusPay**: This smartcontract holds both the buyer's and merchant wallets. A single contract handles all accounts, reducing deployment overhead and simplifying upgradability. The totality of funds held by the contract are backed by an ERC-20 token specified at deployment time.
* **StatusPayBucket**: This smartcontract can be used to issue pre-paid cards which will be activated and provisioned with tokens upon purchase. This contract creates and does the initial top-up of a StatusPay account in this scenario.
* **BlockRelay**: This is used only if deployment is done on L2 networks not supporting or without meaningful block.number, blockhash and block.timestamp definition.

## Anatomy of the repository

* dapps
    * pos: a dApp implementation of the POS, requires Status to work
    * simple-wallet: an webapp not requiring a web3 browser used to check balance and transactions
* contracts: the contracts involved

## StatusPay Contract

The StatusPay contract is the core of the network. All wallets are held there, all payments within buyer and merchant happen there. Infact, there is no real distinction between merchant and buyer accounts, any account can perform both roles. The accounts are identified by number assigned upon creation. Each account holds a balance, settings (max tx amount, etc) and info needed to implement security measure like cool-down periods. Associated to each account you can have one or more keycards and either one owner (usually an EOA) or a redeem code (more details later). Each keycard, owner, redeem code can only be associated to 1 account at any given time. An account can also have no associated Keycard (especially useful for pure merchant accounts).

Using an associated Keycard it is possible to spend funds on balance. Since for payments we foresee a card/POS scenario where the entity submitting the transaction will be either the merchant or a 3rd-party relay, the payment happens using an EIP-712 messaged signed by the actual payer and containing all information required for the payment. The tx sender is ignored. Payments on StatusPay transfer the internal balance between accounts. The backing ERC-20 token is not transfered and remains owned by the StatusPay contract itself.

The owner of the wallet can additionally call methods to add/removes keycards, transfer ownership, withdraw, change settings, etc. It can also perform payments using the same mechanism as described above.

Accounts with a redeem code instead have no associated owner. They can be used normally for payments and be topped up. They cannot however perform any owner action (listed above). These accounts are created when activating a prepaid card using the `StatusPayBucket` contract. The idea is that you can activate the card for payment using any booth/3rd-party facility without compromising security of the account. This simplifies on-boarding and makes the card immediately useful. You can the later, using a secret code you received with the card, redeem the ownership of the account to an EOA you own. After doing this step the account will be become a regular account with all admin functions unlocked.

Topping up an account is a two step procedure. First an `approve` transaction for the amount to be topped-up must be sent by the topper to the backing ERC-20 token. Then a topup transaction must be sent to the StatusPay contract. This can be done either by the owner of the wallet or, by knowning the associated Keycard address, by anybody owning the used ERC-20 token (even if they don't have a StatusPay account). During the topup tx the ERC-20 tokens will be transferred to the StatusPay contract and an equivalent credit will be added to the topped account.

Withdrawing can only be done to the owner and involved a single transaction. The amount to be withdrawn is subtracted from the account's balance and the equivalent amount of ERC-20 tokens is sent to the owner.

Needless to say, payments and withdrawal are allowed up to the amount on balance. Account balance can never be negative.

An account can be created by invoking the `createAccount` method of the StatusPay contract or through the `StatusPayBucket` for prepaid cards.

Although we currently use ERC-20, we could switch to ERC-777 to avoid the need of having 2 transactions for topping up or even to the chain's native currency for cost efficiency. The fundamental structure of the contract wouldn't change and the differences would only concern topup/withdrawal.

## StatusPayBucket Contract

This contract is used for scenario where Keycards are sold/distributed with an associated amount of funds and can be immediately used on the StatusPay network. Since actually preloading accounts would lead to waste of funds in case of lost/unsold/destroyed cards, this contract allows the owner to retrieve the funds of all non-activated cards after an expiry date specified upon contract creation.

The bucket creator setups a list of redeemables, each associated to a Keycard. Each redeemable has an amount of redeemable assets, activation code and redeem code. The activation code is used to actually create the account on StatusPay and transfer the associated assets to the StatusPay's account balance. The created account will not be associated to any externally owned account but will instead be associated to the redeem code. This redeem code can than be later used to associate this account to an EOA. Consequently, the card can be bought and activated immediately in store, without revealing the redeem code to the merchant and without needing to have an EOA at hand. Indeed the card could be the user's very first approach to Ethereum and cryptocurrency in general.

At the moment the redeemables are stored completely on chain. While very secure, this presents some scalability issues. A rewrite storing on chain only a MerkleRoot with the actual data being stored off-chain is in progress.