import { Dispatch } from 'redux';
import { RootState } from '../reducers';
import Web3 from 'web3';
import { abi as keycardWalletFactoryABI } from '../contracts/KeycardWalletFactory';
import { abi as keycardWalletABI } from '../contracts/KeycardWallet';
import { isEmptyAddress } from '../utils';
import { loadTransactions } from './transactions';

const walletFactoryAddress = "0x43069D770a44352c94E043aE3F815BfeAfE5b279";
//FIXME: remove test address
// const testKeycardAddress = "0x13F1e02E78A0636420cDc1BDaE343aDbBfF308F0";

export const WALLET_KEYCARD_ADDRESS_NOT_SPECIFIED = "WALLET_KEYCARD_ADDRESS_NOT_SPECIFIED";
export interface WalletKeycardAddressNotSpecifiedAction {
  type: typeof WALLET_KEYCARD_ADDRESS_NOT_SPECIFIED
}

export const WALLET_FACTORY_LOADING_WALLET_ADDRESS = "WALLET_FACTORY_LOADING_WALLET_ADDRESS";
export interface WalletFactoryLoadingWalletAddressAction {
  type: typeof WALLET_FACTORY_LOADING_WALLET_ADDRESS
  keycardAddress: string
}

export const WALLET_FACTORY_KEYCARD_NOT_FOUND = "WALLET_FACTORY_KEYCARD_NOT_FOUND";
export interface WalletFactoryKeycardNotFoundAction {
  type: typeof WALLET_FACTORY_KEYCARD_NOT_FOUND
  keycardAddress: string
}

export const WALLET_FACTORY_WALLET_ADDRESS_LOADED = "WALLET_FACTORY_WALLET_ADDRESS_LOADED";
export interface WalletFactoryWalletAddressLoadedAction {
  type: typeof WALLET_FACTORY_WALLET_ADDRESS_LOADED
  keycardAddress: string
  walletAddress: string
}

export const WALLET_LOADING_BALANCE = "WALLET_LOADING_BALANCE";
export interface WalletLoadingBalanceAction {
  type: typeof WALLET_LOADING_BALANCE
  address: string
}

export const WALLET_BALANCE_LOADED = "WALLET_BALANCE_LOADED";
export interface WalletBalanceLoadedAction {
  type: typeof WALLET_BALANCE_LOADED
  balance: string
}

export const WALLET_TOGGLE_QRCODE = "WALLET_TOGGLE_QRCODE";
export interface WalletToggleQRCodeAction {
  type: typeof WALLET_TOGGLE_QRCODE
  open: boolean
}

export type WalletActions =
  WalletKeycardAddressNotSpecifiedAction |
  WalletFactoryLoadingWalletAddressAction |
  WalletFactoryWalletAddressLoadedAction |
  WalletFactoryKeycardNotFoundAction |
  WalletLoadingBalanceAction |
  WalletBalanceLoadedAction |
  WalletToggleQRCodeAction;

export const keycardAddressNotSpecified = (): WalletKeycardAddressNotSpecifiedAction => ({
  type: WALLET_KEYCARD_ADDRESS_NOT_SPECIFIED,
});

export const loadingWalletAddress = (keycardAddress: string): WalletFactoryLoadingWalletAddressAction => ({
  type: WALLET_FACTORY_LOADING_WALLET_ADDRESS,
  keycardAddress,
});

export const walletAddressLoaded = (keycardAddress: string, walletAddress: string): WalletFactoryWalletAddressLoadedAction => ({
  type: WALLET_FACTORY_WALLET_ADDRESS_LOADED,
  keycardAddress,
  walletAddress,
});

export const keycardNotFound = (keycardAddress: string): WalletFactoryKeycardNotFoundAction => ({
  type: WALLET_FACTORY_KEYCARD_NOT_FOUND,
  keycardAddress,
});

export const loadingWalletBalance = (address: string): WalletLoadingBalanceAction => ({
  type: WALLET_LOADING_BALANCE,
  address,
});

export const balanceLoaded = (balance: string): WalletBalanceLoadedAction => ({
  type: WALLET_BALANCE_LOADED,
  balance,
});

export const showWalletQRCode = (): WalletToggleQRCodeAction => ({
  type: WALLET_TOGGLE_QRCODE,
  open: true,
});

export const hideWalletQRCode = (): WalletToggleQRCodeAction => ({
  type: WALLET_TOGGLE_QRCODE,
  open: false,
});

export const loadWallet = (web3: Web3, dispatch: Dispatch, getState: () => RootState) => {
  const params = new URLSearchParams(window.location.search);
  const keycardAddress = params.get("address");
  if (keycardAddress === null) {
    dispatch(keycardAddressNotSpecified());
    return
  }

  dispatch(loadingWalletAddress(keycardAddress));
  const factory = new web3.eth.Contract(keycardWalletFactoryABI, walletFactoryAddress);
  factory.methods.keycardsWallets(keycardAddress).call().then((walletAddress: string) => {
    if (isEmptyAddress(walletAddress)) {
      dispatch(keycardNotFound(keycardAddress));
      return;
    }

    dispatch(walletAddressLoaded(keycardAddress, walletAddress));
    dispatch(loadingWalletBalance(walletAddress));

    const wallet = new web3.eth.Contract(keycardWalletABI, walletAddress);
    loadTransactions(web3, dispatch, getState, wallet);

    return web3.eth.getBalance(walletAddress);
  }).then((balance: string) => {
    dispatch(balanceLoaded(balance));
  }).catch((error: string) => {
    //FIXME: manage error
    console.log("error", error)
  })
}
