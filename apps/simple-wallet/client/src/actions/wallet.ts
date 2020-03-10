import { Dispatch } from 'redux';
import { RootState } from '../reducers';
import Web3 from 'web3';
import { abi as keycardWalletFactoryABI } from '../contracts/KeycardWalletFactory';
import { abi as erc20DetailedABI } from '../contracts/ERC20Detailed';
import { isEmptyAddress } from '../utils';
import { loadTransactions } from './transactions';
import { Contract } from 'web3-eth-contract';

export const ERR_WALLET_NOT_FOUND = "ERR_WALLET_NOT_FOUND";
export interface ErrWalletNotFound {
  type: typeof ERR_WALLET_NOT_FOUND
  keycardAddress: string
}

export const ERR_ERC20_NOT_SET = "ERR_ERC20_NOT_SET";
export interface ErrERC20NotSet {
  type: typeof ERR_ERC20_NOT_SET
}

export const ERR_GETTING_ERC20_SYMBOL = "ERR_GETTING_ERC20_SYMBOL";
export interface ErrGettingERC20Symbol {
  type: typeof ERR_GETTING_ERC20_SYMBOL
  erc20Address: string
  error: string
}

export const ERR_LOADING_BALANCE = "ERR_LOADING_BALANCE";
export interface ErrLoadingBalance {
  type: typeof ERR_LOADING_BALANCE
  erc20Address: string
  walletAddress: string
  error: string
}

export type WalletErrors =
  ErrWalletNotFound |
  ErrERC20NotSet |
  ErrGettingERC20Symbol |
  ErrLoadingBalance;


// const walletFactoryAddress = "0x43069D770a44352c94E043aE3F815BfeAfE5b279";
// const walletFactoryAddress = "0x8C9437F77103E6aC431Af3e9D45cD3D8A972047e";

// Ropsten
const walletFactoryAddress = "0x37491bee77c66cb1c4c2be92e4ba3a9eb5487801";
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

export const WALLET_FACTORY_LOADING_ERC20_ADDRESS = "WALLET_FACTORY_LOADING_ERC20_ADDRESS";
export interface WalletFactoryLoadingERC20AddressAction {
  type: typeof WALLET_FACTORY_LOADING_ERC20_ADDRESS
}

export const WALLET_FACTORY_ERC20_ADDRESS_LOADED = "WALLET_FACTORY_ERC20_ADDRESS_LOADED";
export interface WalletFactoryERC20AddressLoadedAction {
  type: typeof WALLET_FACTORY_ERC20_ADDRESS_LOADED
  address: string
}

export const WALLET_FACTORY_LOADING_ERC20_SYMBOL = "WALLET_FACTORY_LOADING_ERC20_SYMBOL";
export interface WalletFactoryLoadingERC20SymbolAction {
  type: typeof WALLET_FACTORY_LOADING_ERC20_SYMBOL
}

export const WALLET_FACTORY_ERC20_SYMBOL_LOADED = "WALLET_FACTORY_ERC20_SYMBOL_LOADED";
export interface WalletFactoryERC20SymbolLoadedAction {
  type: typeof WALLET_FACTORY_ERC20_SYMBOL_LOADED
  symbol: string
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
  WalletFactoryLoadingERC20AddressAction |
  WalletFactoryERC20AddressLoadedAction |
  WalletFactoryLoadingERC20SymbolAction |
  WalletFactoryERC20SymbolLoadedAction |
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

export const loadingERC20Address = (): WalletFactoryLoadingERC20AddressAction => ({
  type: WALLET_FACTORY_LOADING_ERC20_ADDRESS,
});

export const erc20AddressLoaded = (address: string): WalletFactoryERC20AddressLoadedAction => ({
  type: WALLET_FACTORY_ERC20_ADDRESS_LOADED,
  address,
});

export const loadingERC20Symbol = (): WalletFactoryLoadingERC20SymbolAction => ({
  type: WALLET_FACTORY_LOADING_ERC20_SYMBOL,
});

export const erc20SymbolLoaded = (symbol: string): WalletFactoryERC20SymbolLoadedAction => ({
  type: WALLET_FACTORY_ERC20_SYMBOL_LOADED,
  symbol,
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

export const loadWallet = async (web3: Web3, dispatch: Dispatch, getState: () => RootState) => {
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

  const factory = new web3.eth.Contract(keycardWalletFactoryABI, walletFactoryAddress);

  dispatch<any>(loadWalletAddress(web3, factory, keycardAddress))
    .then(() => dispatch<any>(loadERC20(web3, factory)))
    .then((erc20: Contract) => dispatch<any>(loadERC20Symbol(web3, erc20)))
    .then((erc20: Contract) => dispatch<any>(loadWalletBalance(web3, erc20)))
    .then((erc20: Contract) => dispatch<any>(loadTransactions(web3, erc20)))
    .catch((err: string) => {
      console.error("global catch", err)
      return;
    })

  //  loadTransactions(web3, dispatch, getState, wallet);
}

const loadWalletAddress = (web3: Web3, factory: Contract, keycardAddress: string) => {
  return async (dispatch: Dispatch) => {
    dispatch(loadingWalletAddress(keycardAddress));
    return factory.methods.keycardsWallets(keycardAddress).call().then((address: string) => {
     if (isEmptyAddress(address)) {
       dispatch(keycardNotFound(address));
       throw({
         type: ERR_WALLET_NOT_FOUND,
         keycardAddress: keycardAddress,
       });
     }

     dispatch(walletAddressLoaded(keycardAddress, address));
    }).catch((err: any) => {
      console.error("err", err)
      throw(err)
    });
  }
}

const loadERC20 = (web3: Web3, factory: Contract) => {
  return async (dispatch: Dispatch) => {
    return factory.methods.currency().call().then((address: string) => {
      if (isEmptyAddress(address)) {
        throw({ type: ERR_ERC20_NOT_SET });
      }

      dispatch(erc20AddressLoaded(address));
      return new web3.eth.Contract(erc20DetailedABI, address);
    }).catch((err: any) => {
      console.error("err", err)
      throw(err);
    });
  }
}

const loadERC20Symbol = (web3: Web3, erc20: Contract) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const address = getState().wallet.erc20Address;
    dispatch(loadingERC20Symbol());
    return erc20.methods.symbol().call().then((symbol: string) => {
      dispatch(erc20SymbolLoaded(symbol));
      return erc20;
    }).catch((err: string) => {
      console.error("err", err)
      throw({
        type: ERR_GETTING_ERC20_SYMBOL,
        erc20Address: erc20["_address"],
        error: err,
      });
    });
  }
}

const loadWalletBalance = (web3: Web3, erc20: Contract) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const address = getState().wallet.walletAddress!;
    dispatch(loadingWalletBalance(address));
    return erc20.methods.balanceOf(address).call().then((balance: string) => {
      dispatch(balanceLoaded(balance, balance));
      return erc20;
    }).catch((err: string) => {
      console.error("err", err)
      throw({
        type: ERR_LOADING_BALANCE,
        erc20Address: erc20["_address"],
        walletAddress: address,
        error: err,
      });
    });
  }
}
