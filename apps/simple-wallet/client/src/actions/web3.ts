import Web3 from 'web3';
import {
  Dispatch,
  AnyAction,
} from 'redux';
import { RootState } from '../reducers';
import { loadWallet } from './wallet';
import { ThunkAction } from 'redux-thunk';


export const WEB3_INITIALIZED = "WEB3_INITIALIZED";
export interface Web3InitializedAction {
  type: typeof WEB3_INITIALIZED
}

export const WEB3_ERROR = "WEB3_ERROR";
export interface Web3ErrorAction {
  type: typeof WEB3_ERROR
  error: string
}

export const WEB3_NETWORK_ID_LOADED = "WEB3_NETWORK_ID_LOADED";
export interface Web3NetworkIDLoadedAction {
  type: typeof WEB3_NETWORK_ID_LOADED
  networkID: number
}

export type Web3Actions =
  Web3InitializedAction |
  Web3ErrorAction |
  Web3NetworkIDLoadedAction;

export const web3Initialized = (): Web3Actions => {
  return {
    type: WEB3_INITIALIZED,
  };
}

export const web3NetworkIDLoaded = (id: number): Web3Actions => {
  return {
    type: WEB3_NETWORK_ID_LOADED,
    networkID: id,
  };
}

export const web3Error = (error: string): Web3Actions => {
  return {
    type: WEB3_ERROR,
    error: error,
  };
}

export const initializeWeb3 = () => {
  //FIXME: move to config
  const web3 = new Web3('https://ropsten.infura.io/v3/f315575765b14720b32382a61a89341a');
  (window as any).web3 = web3;


  return (dispatch: Dispatch, getState: () => RootState) => {
    dispatch(web3Initialized());
    web3.eth.net.getId().then((id) => {
      dispatch(web3NetworkIDLoaded(id))
      loadWallet(dispatch, getState);
    }).catch((err) => {
      dispatch(web3Error(err))
    })
  }
}

