import { Dispatch } from 'redux';
import { RootState } from '../reducers';
import Web3 from 'web3';
import { abi as keycardWalletFactoryABI } from '../contracts/KeycardWalletFactory';
import { abi as keycardWalletABI } from '../contracts/KeycardWallet';
import { isEmptyAddress } from '../utils';
import { loadTransactions } from './transactions';
import { Contract } from 'web3-eth-contract';

// const walletFactoryAddress = "0x43069D770a44352c94E043aE3F815BfeAfE5b279";
// const walletFactoryAddress = "0x8C9437F77103E6aC431Af3e9D45cD3D8A972047e";

// Ropsten
const walletFactoryAddress = "0xf9bcEf45E39cC5d976585b5A9A722113E3c58aCc";
//FIXME: remove test address
// const testKeycardAddress = "0x13F1e02E78A0636420cDc1BDaE343aDbBfF308F0";

export const WALLET_KEYCARD_ADDRESS_NOT_SPECIFIED = "WALLET_KEYCARD_ADDRESS_NOT_SPECIFIED";
export interface WalletKeycardAddressNotSpecifiedAction {
  type: typeof WALLET_KEYCARD_ADDRESS_NOT_SPECIFIED
}

export const WALLET_INVALID_KEYCARD_ADDRESS = "WALLET_INVALID_KEYCARD_ADDRESS";
export interface WalletInvalidKeycardAddressAction {
  type: typeof WALLET_INVALID_KEYCARD_ADDRESS
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
  availableBalance: string
}

export const WALLET_TOGGLE_QRCODE = "WALLET_TOGGLE_QRCODE";
export interface WalletToggleQRCodeAction {
  type: typeof WALLET_TOGGLE_QRCODE
  open: boolean
}

export type WalletActions =
  WalletKeycardAddressNotSpecifiedAction |
  WalletInvalidKeycardAddressAction |
  WalletFactoryLoadingWalletAddressAction |
  WalletFactoryWalletAddressLoadedAction |
  WalletFactoryKeycardNotFoundAction |
  WalletLoadingBalanceAction |
  WalletBalanceLoadedAction |
  WalletToggleQRCodeAction;

export const keycardAddressNotSpecified = (): WalletKeycardAddressNotSpecifiedAction => ({
  type: WALLET_KEYCARD_ADDRESS_NOT_SPECIFIED,
});

export const invalidKeycardAddress = (): WalletInvalidKeycardAddressAction => ({
  type: WALLET_INVALID_KEYCARD_ADDRESS,
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

export const balanceLoaded = (balance: string, availableBalance: string): WalletBalanceLoadedAction => ({
  type: WALLET_BALANCE_LOADED,
  balance,
  availableBalance,
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

  if (!web3.utils.isAddress(keycardAddress)) {
    dispatch(invalidKeycardAddress());
    return;
  }

  dispatch(loadingWalletAddress(keycardAddress));
  const factory = new web3.eth.Contract(keycardWalletFactoryABI, walletFactoryAddress);

  factory.methods.keycardsWallets(keycardAddress).call().then((walletAddress: string) => {
    if (isEmptyAddress(walletAddress)) {
      dispatch(keycardNotFound(keycardAddress));
      return;
    }

    const wallet = new web3.eth.Contract(keycardWalletABI, walletAddress);

    dispatch(walletAddressLoaded(keycardAddress, walletAddress));
    dispatch<any>(loadBalance(web3, walletAddress, wallet));
    loadTransactions(web3, dispatch, getState, wallet);
  }).catch((error: string) => {
    //FIXME: manage error
    console.log("error", error)
  })
}


export const loadBalance = (web3: Web3, walletAddress: string, wallet: Contract) => {
  return async (dispatch: Dispatch) => {
    dispatch(loadingWalletBalance(walletAddress));
    try {
      const balance = await web3.eth.getBalance(walletAddress);
      const availableBalance = await wallet.methods.availableBalance().call();
      dispatch(balanceLoaded(balance, availableBalance));
    } catch (err) {
      //FIXME: manage error
      console.error(err)
    }
  }
}
