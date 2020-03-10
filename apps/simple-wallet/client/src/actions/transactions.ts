import { Dispatch } from 'redux';
import { RootState } from '../reducers';
import { Contract } from 'web3-eth-contract';
import Web3 from 'web3';
import { TransactionReceipt } from 'web3-core';
// import { loadBalance } from './wallet';
import { loadBlock } from './blocks';
import { abi as keycardWalletABI } from '../contracts/KeycardWallet';
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

export const watchPendingTransaction = (web3: Web3, dispatch: Dispatch, walletAddress: string | undefined, wallet: Contract, transactionHash: string) => {
  web3.eth.getTransactionReceipt(transactionHash).then((tx: TransactionReceipt) => {
    if (tx.status) {
      dispatch(transactionConfirmed(transactionHash));
      if (walletAddress !== undefined) {
        // dispatch<any>(loadBalance(web3, walletAddress, wallet));
      }
      return;
    }

    window.setTimeout(() => watchPendingTransaction(web3, dispatch, walletAddress, wallet, transactionHash), 5000)
  }).catch((error: string) => {
    //FIXME: handle error
    console.log("error", error)
  });
}

export const loadTransactions = (web3: Web3, erc20: Contract) => {
  return (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const walletAddress = state.wallet.walletAddress;
    if (walletAddress === undefined) {
      return;
    }

    const wallet = new web3.eth.Contract(keycardWalletABI, walletAddress);
    const topic = web3.utils.sha3("Transfer(address,address,uint256)");
    const options = {
      fromBlock: 0,
      toBlock: "latest",
      topics: [
        topic,
        null,
        addPadding(64, walletAddress),
      ]
    };

    erc20.getPastEvents("allEvents", options).then((events: any) => {
      events.forEach((event: any) => {
        const values = event.returnValues;
        dispatch<any>(loadBlock(event.blockNumber));
        dispatch(transactionDiscovered("TopUp", event.id, event.blockNumber, event.transactionHash, false, values.from, walletAddress, values.value));
      });
      dispatch(transactionsLoaded());
    });

    dispatch(loadingTransactions());

    const filter = {
      to: walletAddress,
    };
    web3.eth.getBlockNumber().then((blockNumber: number) => {
      erc20.events.Transfer({filter: filter}).on('data', (event: any) => {
        const values = event.returnValues;
        dispatch(transactionDiscovered("TopUp", event.id, event.blockNumber, event.transactionHash, true, values.from, walletAddress, values.value));
        watchPendingTransaction(web3, dispatch, walletAddress, wallet, event.transactionHash);
      })
    });
  };
}
