import Web3 from 'web3';
import { config } from '../global';
import {
  Dispatch,
} from 'redux';
import { RootState } from '../reducers';
import { loadWallet } from './wallet';

export const VALID_NETWORK_NAME = "Ropsten";
export const VALID_NETWORK_ID = 3;
// export const VALID_NETWORK_NAME = "Goerli";
// export const VALID_NETWORK_ID = 5;
export const LOCAL_NETWORK_ID = 1337;

enum Web3Type {
  Generic,
  Remote,
  Status,
}

export const WEB3_INITIALIZED = "WEB3_INITIALIZED";
export interface Web3InitializedAction {
  type: typeof WEB3_INITIALIZED
  web3Type: Web3Type
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


export const web3Initialized = (t: Web3Type): Web3Actions => ({
  type: WEB3_INITIALIZED,
  web3Type: t,
})

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
  const w = window as any;
  if (w.ethereum) {
    config.web3 = new Web3(w.ethereum);
    return (dispatch: Dispatch, getState: () => RootState) => {
      w.ethereum.enable()
        .then(() => {
          const t: Web3Type = w.ethereum.isStatus ? Web3Type.Status : Web3Type.Generic;
          dispatch(web3Initialized(t));
          config.web3!.eth.net.getId().then((id: number) => {
            if (id !== VALID_NETWORK_ID && id !== LOCAL_NETWORK_ID) {
              dispatch(web3Error(`wrong network, please connect to ${VALID_NETWORK_NAME}`));
              return;
            }

            dispatch(web3NetworkIDLoaded(id))
            loadWallet(config.web3!, dispatch, getState);
          });
        })
        .catch((err: string) => {
          //FIXME: handle error
          console.log("error", err)
        });
    }
  } else if (config.web3) {
    return (dispatch: Dispatch, getState: () => RootState) => {
      const t: Web3Type = w.ethereum.isStatus ? Web3Type.Status : Web3Type.Generic;
      dispatch(web3Initialized(t));
      config.web3!.eth.net.getId().then((id: number) => {
        dispatch(web3NetworkIDLoaded(id))
        loadWallet(config.web3!, dispatch, getState);
      })
      .catch((err: string) => {
        //FIXME: handle error
        console.log("error", err)
      });
    }
  } else {
    //FIXME: move to config
    // const web3 = new Web3('https://ropsten.infura.io/v3/f315575765b14720b32382a61a89341a');
    // const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/f315575765b14720b32382a61a89341a'));
    // alert(`remote`)
    config.web3 = new Web3(new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws/v3/f315575765b14720b32382a61a89341a'));
    return (dispatch: Dispatch, getState: () => RootState) => {
      dispatch(web3Initialized(Web3Type.Remote));
      config.web3!.eth.net.getId().then((id: number) => {
        dispatch(web3NetworkIDLoaded(id))
        loadWallet(config.web3!, dispatch, getState);
      })
      .catch((err: string) => {
        //FIXME: handle error
        console.log("error", err)
      });
    }
  }
}

