import { Dispatch } from 'redux';
import { RootState } from '../reducers';
import { Contract } from 'web3-eth-contract';
import { abi as keycardWalletFactoryABI } from '../contracts/KeycardWalletFactory';
import { abi as keycardWalletABI } from '../contracts/KeycardWallet';
import Web3 from 'web3';

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

export type TxsActions =
  TxsTransactionDiscoveredAction;

export const topUpDiscovered = (id: string, transactionHash: string, pending: boolean, from: string, to: string | undefined, value: string): TxsTransactionDiscoveredAction => ({
  type: TXS_TRANSACTION_DISCOVERED,
  id,
  transactionHash,
  pending,
  from,
  to,
  value,
});

export const loadTransactions = (dispatch: Dispatch, getState: () => RootState, wallet: Contract) => {
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

  const web3: Web3 = (window as any).web3;
  web3.eth.getBlockNumber().then((blockNumber: number) => {
    wallet.events.TopUp({fromBlock: blockNumber}).on('data', (event: any) => {
      const values = event.returnValues;
      dispatch(topUpDiscovered(event.id, event.transactionHash, true, values.from, walletAddress, values.value));
    })
  });
}
