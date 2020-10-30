import { Dispatch } from 'redux';
import { RootState } from '../reducers';
import { Contract } from 'web3-eth-contract';
import Web3 from 'web3';
import { TransactionReceipt } from 'web3-core';
import { loadWalletBalance } from './wallet';
import { loadBlock } from './blocks';

type ToOrFrom = "to" | "from";

export const TXS_LOADING = "TXS_LOADING";
export interface TxsLoadingAction {
  type: typeof TXS_LOADING
}

export const TXS_LOADED = "TXS_LOADED";
export interface TxsLoadedAction {
  type: typeof TXS_LOADED
}

export const TXS_TRANSACTION_DISCOVERED = "TXS_TRANSACTION_DISCOVERED";
export interface TxsTransactionDiscoveredAction {
  type: typeof TXS_TRANSACTION_DISCOVERED
  direction: ToOrFrom
  event: string
  pending: boolean
  id: string
  blockNumber: number
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
  TxsLoadingAction |
  TxsLoadedAction |
  TxsTransactionDiscoveredAction |
  TxsTransactionConfirmedAction;

export const transactionDiscovered = (direction: ToOrFrom, event: string, id: string, blockNumber: number, transactionHash: string, pending: boolean, from: string | undefined, to: string | undefined, value: string): TxsTransactionDiscoveredAction => ({
  type: TXS_TRANSACTION_DISCOVERED,
  direction,
  event,
  id,
  blockNumber,
  transactionHash,
  pending,
  from,
  to,
  value,
});

export const loadingTransactions = (): TxsLoadingAction => ({
  type: TXS_LOADING,
});

export const transactionsLoaded = (): TxsLoadedAction => ({
  type: TXS_LOADED,
});

export const transactionConfirmed = (transactionHash: string): TxsTransactionConfirmedAction => ({
  type: TXS_TRANSACTION_CONFIRMED,
  transactionHash,
});

export const loadTransactions = (web3: Web3, statusPay: Contract) => {
  return (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const walletAddress = state.wallet.walletAddress;
    if (walletAddress === undefined) {
      return;
    }

    web3.eth.getBlockNumber().then((blockNumber: number) => {
      dispatch<any>(getPastTransactions(web3, statusPay, walletAddress, blockNumber, "to"))
      dispatch<any>(getPastTransactions(web3, statusPay, walletAddress, blockNumber, "from"))

      dispatch<any>(subscribeToTransactions(web3, statusPay, walletAddress, blockNumber, "to"))
      dispatch<any>(subscribeToTransactions(web3, statusPay, walletAddress, blockNumber, "from"))
    });
  };
}

const getPastTransactions = (web3: Web3, statusPay: Contract, walletAddress: string, fromBlock: number, toOrFrom: ToOrFrom) => {
  return (dispatch: Dispatch, getState: () => RootState) => {
    const options = {
      fromBlock: 0,
      toBlock: "latest",
      filter: { [toOrFrom]: walletAddress}
    };

    dispatch(loadingTransactions());
    statusPay.getPastEvents("allEvents", options).then((events: any) => {
      events.forEach((event: any) => {
        const values = event.returnValues;
        dispatch<any>(loadBlock(event.blockNumber));
        dispatch(transactionDiscovered(toOrFrom, event.event, event.id, event.blockNumber, event.transactionHash, false, values.from, values.to, values.value));
      });
      dispatch(transactionsLoaded());
    });
  };
};

const subscribeToTransactions = (web3: Web3, statusPay: Contract, walletAddress: string, fromBlock: number, toOrFrom: ToOrFrom) => {
  return (dispatch: Dispatch, getState: () => RootState) => {
    const options = {
      fromBlock: fromBlock,
      filter: {
        [toOrFrom]: walletAddress,
      }
    };

    statusPay.events.allEvents(options).on('data', (event: any) => {
      const values = event.returnValues;
      const pending = event.blockHash === null;
      dispatch(transactionDiscovered(toOrFrom, event.event, event.id, event.blockNumber, event.transactionHash, pending, values.from, values.to, values.amount));
      dispatch<any>(loadWalletBalance(web3, undefined));
      if (pending) {
        watchPendingTransaction(web3, dispatch, walletAddress, event.transactionHash);
      }
    });
  };
};

export const watchPendingTransaction = (web3: Web3, dispatch: Dispatch, walletAddress: string | undefined, transactionHash: string) => {
  web3.eth.getTransactionReceipt(transactionHash).then((tx: TransactionReceipt) => {
    if (tx.status) {
      dispatch(transactionConfirmed(transactionHash));
      if (walletAddress !== undefined) {
        dispatch<any>(loadWalletBalance(web3, undefined));
      }
      return;
    }

    window.setTimeout(() => watchPendingTransaction(web3, dispatch, walletAddress, transactionHash), 5000)
  }).catch((error: string) => {
    //FIXME: handle error
    console.log("error", error)
  });
}
