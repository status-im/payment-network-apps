import {
  TXS_TRANSACTION_DISCOVERED,
  TxsActions,
} from '../actions/transactions';

export interface TransactionState {
  id: string
  transactionHash: string
  from: string | undefined
  to: string | undefined
  value: string
}

export interface TransactionsState {
  [txID: string]: TransactionState
};

const initialState: TransactionsState = {};

export const transactionsReducer = (state: TransactionsState = initialState, action: TxsActions): TransactionsState => {
  switch (action.type) {
    case TXS_TRANSACTION_DISCOVERED: {
      return {
        ...state,
        [action.transactionHash]: {
          id: action.id,
          transactionHash: action.transactionHash,
          from: action.from,
          to: action.to,
          value: action.value,
        }
      }
    }
  }

  return state;
}
