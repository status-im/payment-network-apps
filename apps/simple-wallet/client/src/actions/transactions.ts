import { Dispatch } from 'redux';
import { RootState } from '../reducers';
import { Contract } from 'web3-eth-contract';
import Web3 from 'web3';
import { TransactionReceipt } from 'web3-core';
import { loadWalletBalance } from './wallet';
import { loadBlock } from './blocks';
import { addPadding } from "../utils";

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

export const transactionDiscovered = (event: string, id: string, blockNumber: number, transactionHash: string, pending: boolean, from: string, to: string | undefined, value: string): TxsTransactionDiscoveredAction => ({
  type: TXS_TRANSACTION_DISCOVERED,
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

export const loadTransactions = (web3: Web3, erc20: Contract) => {
  return (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const walletAddress = state.wallet.walletAddress;
    if (walletAddress === undefined) {
      return;
    }

    web3.eth.getBlockNumber().then((blockNumber: number) => {
      dispatch<any>(getPastTransactions(web3, erc20, walletAddress, blockNumber, "to"))
      dispatch<any>(getPastTransactions(web3, erc20, walletAddress, blockNumber, "from"))

      dispatch<any>(subscribeToTransactions(web3, erc20, walletAddress, blockNumber, "to"))
      dispatch<any>(subscribeToTransactions(web3, erc20, walletAddress, blockNumber, "from"))
    });
  };
}

type ToOrFrom = "to" | "from";

const getPastTransactions = (web3: Web3, erc20: Contract, walletAddress: string, fromBlock: number, toOrFrom: ToOrFrom) => {
  return (dispatch: Dispatch, getState: () => RootState) => {
    const paddedWalletAddress = addPadding(64, walletAddress);
    const eventType = toOrFrom === "to" ? "TopUp" : "NewPaymentRequest";
    const topics: (null | string)[] = [null, null, null];

    switch(toOrFrom) {
      case "from":
        topics[1] = paddedWalletAddress;
        break;
      case "to":
        topics[2] = paddedWalletAddress;
        break;
    }

    const options = {
      fromBlock: 0,
      toBlock: "latest",
      topics: topics,
    };

    dispatch(loadingTransactions());
    erc20.getPastEvents("Transfer", options).then((events: any) => {
      events.forEach((event: any) => {
        const values = event.returnValues;
        dispatch<any>(loadBlock(event.blockNumber));
        dispatch(transactionDiscovered(eventType, event.id, event.blockNumber, event.transactionHash, false, values.from, walletAddress, values.value));
      });
      dispatch(transactionsLoaded());
    });
  };
};

const subscribeToTransactions = (web3: Web3, erc20: Contract, walletAddress: string, fromBlock: number, toOrFrom: ToOrFrom) => {
  return (dispatch: Dispatch, getState: () => RootState) => {
    const options = {
      fromBlock: fromBlock,
      filter: {
        [toOrFrom]: walletAddress,
      }
    };

    const eventType = toOrFrom === "to" ? "TopUp" : "NewPaymentRequest";

    erc20.events.Transfer(options).on('data', (event: any) => {
      const values = event.returnValues;
      const pending = event.blockHash === null;
      dispatch(transactionDiscovered(eventType, event.id, event.blockNumber, event.transactionHash, pending, values.from, walletAddress, values.value));
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
