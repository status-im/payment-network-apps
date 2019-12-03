import {
  WalletActions,
  WALLET_KEYCARD_ADDRESS_NOT_SPECIFIED,
  WALLET_FACTORY_LOADING_WALLET_ADDRESS,
  WALLET_FACTORY_KEYCARD_NOT_FOUND,
  WALLET_FACTORY_WALLET_ADDRESS_LOADED,
  WALLET_LOADING_BALANCE,
  WALLET_BALANCE_LOADED,
  WALLET_TOGGLE_QRCODE,
} from '../actions/wallet';

export interface WalletState {
  loading: boolean
  keycardAddress: string | undefined
  walletAddress: string | undefined
  walletFound: boolean
  balance: string
  error: string | undefined
  showWalletQRCode: boolean
}

const initialState = {
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

    case WALLET_FACTORY_LOADING_WALLET_ADDRESS: {
      return {
        ...state,
        loading: true,
        keycardAddress: action.keycardAddress,
      }
    }

    case WALLET_FACTORY_WALLET_ADDRESS_LOADED: {
      return {
        ...state,
        walletFound: true,
        walletAddress: action.walletAddress,
      }
    }

    case WALLET_BALANCE_LOADED: {
      return {
        ...state,
        loading: false,
        balance: action.balance,
      }
    }
  }

  return state
}
