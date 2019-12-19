import {
  WalletActions,
  WALLET_KEYCARD_ADDRESS_NOT_SPECIFIED,
  WALLET_INVALID_KEYCARD_ADDRESS,
  WALLET_FACTORY_LOADING_WALLET_ADDRESS,
  WALLET_FACTORY_KEYCARD_NOT_FOUND,
  WALLET_FACTORY_WALLET_ADDRESS_LOADED,
  WALLET_LOADING_BALANCE,
  WALLET_BALANCE_LOADED,
  WALLET_TOGGLE_QRCODE,
} from '../actions/wallet';

export interface WalletState {
  ready: boolean
  loading: boolean
  keycardAddress: string | undefined
  walletAddress: string | undefined
  walletFound: boolean
  balance: string
  error: string | undefined
  showWalletQRCode: boolean
}

const initialState = {
  ready: false,
  loading: false,
  keycardAddress: undefined,
  walletAddress: undefined,
  walletFound: false,
  balance: "",
  error: undefined,
  showWalletQRCode: false,
};

export const walletReducer = (state: WalletState = initialState, action: WalletActions): WalletState => {
  switch (action.type) {
    case WALLET_TOGGLE_QRCODE: {
      return {
        ...state,
        showWalletQRCode: action.open,
      }
    }

    case WALLET_KEYCARD_ADDRESS_NOT_SPECIFIED: {
      return {
        ...state,
        error: "Keycard address not specified. Tap your keycard on your phone.",
      }
    }

    case WALLET_INVALID_KEYCARD_ADDRESS: {
      return {
        ...state,
        error: "invalid keycard address",
      }
    }

    case WALLET_FACTORY_LOADING_WALLET_ADDRESS: {
      return {
        ...state,
        loading: true,
        keycardAddress: action.keycardAddress,
      }
    }

    case WALLET_FACTORY_KEYCARD_NOT_FOUND: {
      return {
        ...state,
        loading: false,
        error: "not wallet found for the selected Keycard address",
      }
    }

    case WALLET_FACTORY_WALLET_ADDRESS_LOADED: {
      return {
        ...state,
        loading: false,
        walletFound: true,
        walletAddress: action.walletAddress,
      }
    }

    case WALLET_LOADING_BALANCE: {
      return {
        ...state,
        loading: true,
      }
    }

    case WALLET_BALANCE_LOADED: {
      return {
        ...state,
        ready: true,
        loading: false,
        balance: action.balance,
      }
    }
  }

  return state
}
