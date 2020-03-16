import { config } from '../global';
import {
  TXS_LOADING,
  TXS_LOADED,
  TXS_TRANSACTION_DISCOVERED,
  TXS_TRANSACTION_CONFIRMED,
  TxsActions,
} from '../actions/transactions';

export interface TransactionState {
  id: string
  blockNumber: number
  event: string
  transactionHash: string
  pending: boolean | undefined
  from: string | undefined
  to: string | undefined
  value: string
  valueInETH: string
}

export interface TransactionsState {
  loadingRequests: number
  transactions: {
    [txHash: string]: TransactionState
  }
};

const newTransactionState = (): TransactionState => ({
  id: "",
  blockNumber: 0,
  event: "",
  transactionHash: "",
  pending: undefined,
  from: undefined,
  to: undefined,
  value: "",
  valueInETH: "",
});

const initialState: TransactionsState = {
  loadingRequests: 0,
  transactions: {},
};

export const transactionsReducer = (state: TransactionsState = initialState, action: TxsActions): TransactionsState => {
  switch (action.type) {
    case TXS_LOADING: {
      return {
        ...state,
        loadingRequests: state.loadingRequests + 1,
      }
    }

    case TXS_LOADED: {
      return {
        ...state,
        loadingRequests: state.loadingRequests - 1,
      }
    }

    case TXS_TRANSACTION_DISCOVERED: {
      const txState: TransactionState = state.transactions[action.transactionHash] || newTransactionState();
      // if tx was is new (pending === undefined)
      // OR tx was pending
      // then set the current state
      // otherwise if tx was confirmed, leave it confirmed in case a watcher is getting
      // an old event
      if (txState.pending === undefined || txState.pending) {
        txState.pending = action.pending;
      }

      const valueInETH = config.web3!.utils.fromWei(action.value);

      return {
        ...state,
        transactions: {
          ...state.transactions,
          [action.id]: {
            ...txState,
            id: action.id,
            blockNumber: action.blockNumber,
            event: action.event,
            transactionHash: action.transactionHash,
            pending: action.pending,
            from: action.from,
            to: action.to,
            value: action.value,
            valueInETH: valueInETH,
          }
        }
      }
    }

    case TXS_TRANSACTION_CONFIRMED: {
      const txState: TransactionState = state.transactions[action.transactionHash];
      if (txState === undefined) {
        return state;
      }

      return {
        ...state,
        transactions: {
          ...state.transactions,
          [action.transactionHash]: {
            ...txState,
            pending: false,
          }
        }
      }
    }
  }

  return state;
}
