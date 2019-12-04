import Web3 from 'web3';
import {
  TXS_TRANSACTION_DISCOVERED,
  TXS_TRANSACTION_CONFIRMED,
  TxsActions,
} from '../actions/transactions';

export interface TransactionState {
  id: string
  transactionHash: string
  pending: boolean | undefined
  from: string | undefined
  to: string | undefined
  value: string
  valueInETH: string
}

export interface TransactionsState {
  [txHash: string]: TransactionState
};

const newTransactionState = (): TransactionState => ({
  id: "",
  transactionHash: "",
  pending: undefined,
  from: undefined,
  to: undefined,
  value: "",
  valueInETH: "",
});

const initialState: TransactionsState = {};

export const transactionsReducer = (state: TransactionsState = initialState, action: TxsActions): TransactionsState => {
  switch (action.type) {
    case TXS_TRANSACTION_DISCOVERED: {
      const web3: Web3 = (window as any).web3;
      const txState: TransactionState = state[action.transactionHash] || newTransactionState();

      // if tx was is new (pending === undefined)
      // OR tx was pending
      // then set the current state
      // otherwise if tx was confirmed, leave it confirmed in case a watcher is getting
      // an old event
      if (txState.pending === undefined || txState.pending) {
        txState.pending = action.pending;
      }

      const valueInETH = web3.utils.fromWei(action.value);
      const pending = txState.pending

      return {
        ...state,
        [action.transactionHash]: {
          ...txState,
          id: action.id,
          transactionHash: action.transactionHash,
          pending: action.pending,
          from: action.from,
          to: action.to,
          value: action.value,
          valueInETH: valueInETH,
        }
      }
    }

    case TXS_TRANSACTION_CONFIRMED: {
      const web3: Web3 = (window as any).web3;
      const txState: TransactionState = state[action.transactionHash];
      if (txState === undefined) {
        return state;
      }

      return {
        ...state,
        [action.transactionHash]: {
          ...txState,
          pending: false,
        }
      }
    }
  }

  return state;
}
