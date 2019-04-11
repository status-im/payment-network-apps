import {
  ETHEREUM_LOAD_ERROR,
  WEB3_ERROR,
  ETHEREUM_LOADED,
  NETWORK_ID_LOADED,
  LOADING_OWNER,
  OWNER_LOADED,
  OWNER_BALANCE_LOADED,
  LOADING_WALLETS,
  WALLETS_LOADED,
  COUNTING_WALLETS,
  WALLETS_COUNTED,
  LOADING_WALLET,
  WALLET_LOADED,
  NEW_WALLET,
  NEW_WALLET_SELECT_ICON,
  NEW_WALLET_CANCEL,
  NEW_WALLET_FORM_KEYCARD_ADDRESS_CHANGED,
  NEW_WALLET_FORM_MAX_TX_VALUE_CHANGED,
  CREATING_WALLET,
  WALLET_CREATED,
  WALLET_CREATION_ERROR,
  SELECT_WALLET,
  CLOSE_SELECTED_WALLET,
  TOPPING_UP_WALLET,
  ERROR_TOPPING_UP_WALLET,
  WALLET_TOPPED_UP,
  KEYCARD_DISCOVERED,
  WALLET_WATCHED,
} from "../actions";

const newWalletFormInitialState = {
  open: false,
  icon: null,
  creating: false,
  error: null,
  keycardAddress: null,
  index: null,
  balance: null,
  toppingUp: false,
  maxTxValue: "0.1",
}

const selectedWalletInitialState = {
  open: false,
  index: null,
}

const initialState = {
  loadingWeb3: true,
  loadingWeb3Error: null,
  loadingOwner: false,
  owner: null,
  ownerBalance: null,
  loadingWallets: false,
  countingWallets: false,
  walletsCount: 0,
  loadedWalletsCount: 0,
  wallets: [],
  newWalletForm: newWalletFormInitialState,
  selectedWallet: selectedWalletInitialState,
};

export default function(state, action) {
  console.log("action", action)
  console.log("state", state)

  if (typeof state === 'undefined') {
    return initialState;
  }

  switch (action.type) {
    case ETHEREUM_LOAD_ERROR:
      alert(action.error)
      return Object.assign({}, state, {
        loadingWeb3: false,
        loadingWeb3Error: action.err
      });
    case WEB3_ERROR:
      console.error(action.error)
      alert(action.error)
      break;
    case ETHEREUM_LOADED:
      return Object.assign({}, state, {
        loadingWeb3: false,
      });
    case NETWORK_ID_LOADED:
      return Object.assign({}, state, {
        networkID: action.id,
      });
    case LOADING_OWNER:
      return Object.assign({}, state, {
        loadingOwner: true,
      });
    case OWNER_LOADED:
      return Object.assign({}, state, {
        loadingOwner: false,
        owner: action.owner,
      });
    case OWNER_BALANCE_LOADED:
      return Object.assign({}, state, {
        ownerBalance: action.balance,
      });
    case LOADING_WALLETS:
      return Object.assign({}, state, {
        loadingWallets: true,
        walletsCount: 0,
        loadedWalletsCount: 0,
      });
    case WALLETS_LOADED:
      return Object.assign({}, state, {
        loadingWallets: false,
        wallets: action.wallets,
      });
    case COUNTING_WALLETS:
      return Object.assign({}, state, {
        countingWallets: true,
      });
    case WALLETS_COUNTED:
      return Object.assign({}, state, {
        countingWallets: false,
        walletsCount: action.count,
        wallets: new Array(action.count)
      });
    case WALLET_LOADED:
      const wallet = {
        address: action.address,
        nonce: action.nonce,
        keycardAddress: action.keycardAddress,
        name: action.name,
        balance: action.balance,
        icon: action.icon,
        index: action.index,
        maxTxValue: action.maxTxValue,
      }

      return Object.assign({}, state, {
        wallets: [
          ...state.wallets.slice(0, action.index),
          wallet,
          ...state.wallets.slice(action.index + 1)
        ],
        loadedWalletsCount: state.loadedWalletsCount + 1
      });
    case NEW_WALLET:
      return Object.assign({}, state, {
        newWalletForm: {
          ...newWalletFormInitialState,
          open: true
        }
      });
    case NEW_WALLET_SELECT_ICON:
      return Object.assign({}, state, {
        newWalletForm: {
          ...state.newWalletForm,
          icon: action.icon
        }
      });
    case NEW_WALLET_CANCEL:
      return Object.assign({}, state, {
        newWalletForm: {
          ...state.newWalletForm,
          open: false
        }
      });
    case NEW_WALLET_FORM_KEYCARD_ADDRESS_CHANGED:
      return Object.assign({}, state, {
        newWalletForm: {
          ...state.newWalletForm,
          keycardAddress: action.address
        }
      });
    case NEW_WALLET_FORM_MAX_TX_VALUE_CHANGED:
      return Object.assign({}, state, {
        newWalletForm: {
          ...state.newWalletForm,
          maxTxValue: action.value
        }
      });
    case CREATING_WALLET:
      const tmpWallet = {
        creating: true,
        address: "",
        keycardAddress: "",
        name: "",
        balance: 0,
        icon: action.icon
      }

      return Object.assign({}, state, {
        newWalletForm: {
          ...state.newWalletForm,
          creating: true
        },
        wallets: [
          ...state.wallets.slice(0, action.index),
          tmpWallet,
          ...state.wallets.slice(action.index + 1)
        ]
      });
    case WALLET_CREATED:
      return Object.assign({}, state, {
        newWalletForm: newWalletFormInitialState
      });
    case WALLET_CREATION_ERROR:
      return Object.assign({}, state, {
        newWalletForm: {
          ...newWalletFormInitialState,
          open: true,
          error: action.error
        }
      });
    case SELECT_WALLET:
      return Object.assign({}, state, {
        selectedWallet: {
          ...state.selectedWallet,
          open: true,
          index: action.index,
        }
      });
    case CLOSE_SELECTED_WALLET:
      return Object.assign({}, state, {
        selectedWallet: selectedWalletInitialState,
      });
    case TOPPING_UP_WALLET:
      const toppingUpWallet = state.wallets[action.index];
      toppingUpWallet.toppingUp = true;

      return Object.assign({}, state, {
        wallets: [
          ...state.wallets.slice(0, action.index),
          toppingUpWallet,
          ...state.wallets.slice(action.index + 1)
        ],
      });
    case ERROR_TOPPING_UP_WALLET:
    case WALLET_TOPPED_UP:
      const toppedUpWallet = state.wallets[action.index];
      toppedUpWallet.toppingUp = false;

      return Object.assign({}, state, {
        wallets: [
          ...state.wallets.slice(0, action.index),
          toppedUpWallet,
          ...state.wallets.slice(action.index + 1)
        ],
      });
    case KEYCARD_DISCOVERED:
      return Object.assign({}, state, {
        newWalletForm: {
          ...state.newWalletForm,
          keycardAddress: action.address,
        }
      });
    case WALLET_WATCHED:
      const watchedWallet = state.wallets[action.index];
      if (!watchedWallet) {
        return state;
      }

      watchedWallet.watchedAt = action.date;

      return Object.assign({}, state, {
        wallets: [
          ...state.wallets.slice(0, action.index),
          watchedWallet,
          ...state.wallets.slice(action.index + 1)
        ],
      });
  }

  return state;
}
