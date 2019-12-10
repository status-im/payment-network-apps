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
  KEYCARD_DISCOVERED,
  FINDING_WALLET,
  WALLET_FOUND,
  REQUESTING_PAYMENT,
  PAYMENT_REQUESTED,
  PAYMENT_AMOUNT_VALUE_CHANGE
} from "../actions";

const customerInitialState = {
  keycardAddress: null,
  walletAddress: null,
  wallet: null,
}

const initialState = {
  loadingWeb3: true,
  loadingWeb3Error: null,
  loadingOwner: false,
  owner: null,
  ownerBalance: null,
  customer: customerInitialState,
  findingWallet: false,
  loadingWallet: false,
  requestingPayment: false,
  paymentRequested: false,
  txAmount: 0
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
    case KEYCARD_DISCOVERED:
      return Object.assign({}, state, {
        customer: {
          ...state.customer,
          keycardAddress: action.address,
        }
      });
    case FINDING_WALLET:
      return Object.assign({}, state, {
        findingWallet: true,
      });
    case WALLET_FOUND:
      return Object.assign({}, state, {
        findingWallet: false,
        customer: {
          ...state.customer,
          walletAddress: action.address
        }
      });
    case LOADING_WALLET:
      return Object.assign({}, state, {
        loadingWallet: true,
      });
    case WALLET_LOADED:
      const wallet = {
        nonce: action.nonce,
        balance: action.balance,
        maxTxValue: action.maxTxValue,
      }

      return Object.assign({}, state, {
        loadingWallet: false,
        customer: {
          ...state.customer,
          wallet: wallet,
        }
      });
    case REQUESTING_PAYMENT:
      return Object.assign({}, state, {
        requestingPayment: true,
      });
    case PAYMENT_REQUESTED:
      return Object.assign({}, state, {
        requestingPayment: false,
        paymentRequested: true,
      });
    case PAYMENT_AMOUNT_VALUE_CHANGE:
      return Object.assign({}, state, {
        txAmount: action.value
      });      
  }

  return state;
}
