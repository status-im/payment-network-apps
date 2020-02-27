import { combineReducers } from 'redux';
import {
  Web3State,
  web3Reducer,
} from './web3';
import {
  WalletState,
  walletReducer,
} from './wallet';
import {
  TransactionsState,
  transactionsReducer,
} from './transactions';
import {
  BlocksState,
  blocksReducer,
} from './blocks';

export interface RootState {
  web3: Web3State,
  wallet: WalletState,
  transactions: TransactionsState,
  blocks: BlocksState,
}

export const createRootReducer = () => combineReducers({
  web3: web3Reducer,
  wallet: walletReducer,
  transactions: transactionsReducer,
  blocks: blocksReducer,
});
