import { Dispatch } from 'redux';
import { RootState } from '../reducers';
import Web3 from 'web3';
import { abi as keycardWalletFactoryABI } from '../contracts/KeycardWalletFactory';
import { abi as keycardWalletABI } from '../contracts/KeycardWallet';
import { isEmptyAddress } from '../utils';

const walletFactoryAddress = "0xF42dC64c5F580FFC120d6bc281C1293E63d8132a";
const testKeycardAddress = "0xfD51b65f6Dee2aDd1C867c05d5B8d189b9da7060";

export const WALLET_FACTORY_LOADING = "WALLET_FACTORY_LOADING";
export interface WalletFactoryAction {
  type: typeof WALLET_FACTORY_LOADING
  keycardAddress: string
}

export const WALLET_KEYCARD_NOT_FOUND = "WALLET_KEYCARD_NOT_FOUND";
export interface WalletKeycardNotFoundAction {
  type: typeof WALLET_KEYCARD_NOT_FOUND
  keycardAddress: string
}

export const WALLET_LOADING = "WALLET_LOADING";
export interface WalletLoadingAction {
  type: typeof WALLET_LOADING
  address: string
}

export const WALLET_BALANCE_LOADED = "WALLET_BALANCE_LOADED";
export interface WalletBalanceLoadedAction {
  type: typeof WALLET_BALANCE_LOADED
  balance: string
}

export type WalletActions =
  WalletFactoryAction |
  WalletKeycardNotFoundAction |
  WalletLoadingAction;

export const loadingWalletFactory = (keycardAddress: string): WalletFactoryAction => ({
  type: WALLET_FACTORY_LOADING,
  keycardAddress,
});

export const keycardNotFound = (keycardAddress: string): WalletKeycardNotFoundAction => ({
  type: WALLET_KEYCARD_NOT_FOUND,
  keycardAddress,
});

export const loadingWallet = (address: string): WalletLoadingAction => ({
  type: WALLET_LOADING,
  address,
});

export const balanceLoaded = (balance: string): WalletBalanceLoadedAction => ({
  type: WALLET_BALANCE_LOADED,
  balance,
});

export const loadWallet = (dispatch: Dispatch) => {
  const keycardAddress = testKeycardAddress;

  dispatch(loadingWalletFactory(keycardAddress));
  const web3: Web3 = (window as any).web3;
  const factory = new web3.eth.Contract(keycardWalletFactoryABI, walletFactoryAddress);
  factory.methods.keycardsWallets(keycardAddress).call().then((walletAddress: string) => {
    if (isEmptyAddress(walletAddress)) {
      dispatch(keycardNotFound(keycardAddress));
      return;
    }

    dispatch(loadingWallet(walletAddress));
    const wallet = new web3.eth.Contract(keycardWalletABI, walletAddress);
    return web3.eth.getBalance(walletAddress);
  }).then((balance: string) => {
    dispatch(balanceLoaded(balance));
  }).catch((error: string) => {
    //FIXME: manage error
    console.log("error", error)
  })
}
