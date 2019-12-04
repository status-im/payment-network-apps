import { Dispatch } from 'redux';
import { RootState } from '../reducers';
import { Contract } from 'web3-eth-contract';
import { abi as keycardWalletFactoryABI } from '../contracts/KeycardWalletFactory';
import { abi as keycardWalletABI } from '../contracts/KeycardWallet';
import Web3 from 'web3';
import { TransactionReceipt } from 'web3-core';

export const TXS_TRANSACTION_DISCOVERED = "TXS_TRANSACTION_DISCOVERED";
export interface TxsTransactionDiscoveredAction {
  type: typeof TXS_TRANSACTION_DISCOVERED
  pending: boolean
  id: string
  transactionHash: string
  from: string | undefined
  to: string | undefined
  value: string
}

export const TXS_TRANSACTION_CONFIRMED = "TXS_TRANSACTION_CONFIRMED";
export interface TxsTransactionConfirmedAction {
  type: typeof TXS_TRANSACTION_CONFIRMED
  transactionHash: string
}

export type TxsActions =
  TxsTransactionDiscoveredAction |
  TxsTransactionConfirmedAction;

export const topUpDiscovered = (id: string, transactionHash: string, pending: boolean, from: string, to: string | undefined, value: string): TxsTransactionDiscoveredAction => ({
  type: TXS_TRANSACTION_DISCOVERED,
  id,
  transactionHash,
  pending,
  from,
  to,
  value,
});

export const transactionConfirmed = (transactionHash: string): TxsTransactionConfirmedAction => ({
  type: TXS_TRANSACTION_CONFIRMED,
  transactionHash,
});

export const watchPendingTransaction = (web3: Web3, dispatch: Dispatch, transactionHash: string) => {
  web3.eth.getTransactionReceipt(transactionHash).then((tx: TransactionReceipt) => {
    if (tx.status) {
      dispatch(transactionConfirmed(transactionHash));
      return;
    }

    window.setTimeout(() => watchPendingTransaction(web3, dispatch, transactionHash), 5000)
  }).catch((error: string) => {
    //FIXME: handle error
    console.log("error", error)
  });
}

export const loadTransactions = (web3: Web3, dispatch: Dispatch, getState: () => RootState, wallet: Contract) => {
  const state = getState();
  const walletAddress = state.wallet.walletAddress;

  wallet.getPastEvents('TopUp', {fromBlock: 0, toBlock: 'latest'}).then((events: any) => {
    //FIXME: add loading event
    //FIXME: use the right type for event
    events.forEach((event: any) => {
      const values = event.returnValues;
      dispatch(topUpDiscovered(event.id, event.transactionHash, false, values.from, walletAddress, values.value));
    });
  }).catch(error => {
    //FIXME: handle error
    console.log("error", error)
  });

  web3.eth.getBlockNumber().then((blockNumber: number) => {
    wallet.events.TopUp({fromBlock: blockNumber}).on('data', (event: any) => {
      const values = event.returnValues;
      dispatch(topUpDiscovered(event.id, event.transactionHash, true, values.from, walletAddress, values.value));
      watchPendingTransaction(web3, dispatch, event.transactionHash);
    })
  });
}
