import { emptyAddress } from '../utils';
import Web3 from 'web3';

export const NEW_WALLET = 'NEW_WALLET';
export const newWallet = () => ({
  type: NEW_WALLET,
});

export const ETHEREUM_LOAD_ERROR = 'ETHEREUM_LOAD_ERROR';
export const ethereumLoadError = (err) => ({
  type: ETHEREUM_LOAD_ERROR,
  err: err
});

export const ETHEREUM_LOADED = 'ETHEREUM_LOADED';
export const ethereumLoaded = () => ({
  type: ETHEREUM_LOADED
});

export const LOADING_OWNER = 'LOADING_OWNER';
export const loadingOwner = () => ({
  type: LOADING_OWNER
});

export const OWNER_LOADED = 'OWNER_LOADED';
export const ownerLoaded = (owner) => ({
  type: OWNER_LOADED,
  owner
});

export const WEB3_ERROR = 'WEB3_ERROR';
export const web3Error = (error) => ({
  type: WEB3_ERROR,
  error
});

export const LOADING_WALLETS = 'LOADING_WALLETS';
export const loadingWallets = () => ({
  type: LOADING_WALLETS
});

export const WALLETS_LOADED = 'WALLETS_LOADED';
export const walletsLoaded = (wallets) => ({
  type: WALLETS_LOADED,
  wallets
});

export const COUNTING_WALLETS = 'COUNTING_WALLETS';
export const countingWallets = () => ({
  type: COUNTING_WALLETS
});

export const WALLETS_COUNTED = 'WALLETS_COUNTED';
export const walletsCounted = (count) => ({
  type: WALLETS_COUNTED,
  count: parseInt(count)
});

export const LOADING_WALLET = 'LOADING_WALLET';
export const loadingWallet = (index) => ({
  type: LOADING_WALLET,
  index
});

export const WALLET_LOADED = 'WALLET_LOADED';
export const walletLoaded = (index, address, nonce, name, keycardAddress, balance, icon, maxTxValue) => ({
  type: WALLET_LOADED,
  index,
  address,
  nonce,
  name,
  keycardAddress,
  balance,
  icon,
  maxTxValue,
});

export const NETWORK_ID_LOADED = "NETWORK_ID_LOADED";
export const networkIDLoaded = (id) => ({
  type: NETWORK_ID_LOADED,
  id
});

export const loadNetworkID = () => {
  return (dispatch) => {
    window.web3.eth.net.getId()
      .then((id) => dispatch(networkIDLoaded(id)))
      .catch((err) => {
        dispatch(web3Error(err))
      })
  }
}

export const initWeb3= () => {
  const web3 = new Web3('https://ropsten.infura.io/v3/f315575765b14720b32382a61a89341a');
  window.web3 = web3;

  return ethereumLoaded();
};

export const loadOwner = () => {
  return (dispatch) => {
    dispatch(loadingOwner())
    return window.web3.eth.getAccounts()
      .then((accounts) => {
        const owner = accounts[0];
        dispatch(ownerLoaded(owner))
        dispatch(loadWallets(owner))
        dispatch(loadOwnerBalance(owner))
      })
      .catch((err) => {
        dispatch(web3Error(err))
      });
  }
};

export const OWNER_BALANCE_LOADED = "OWNER_BALANCE_LOADED";
export const ownerBalanceLoaded = (balance) => ({
  type: OWNER_BALANCE_LOADED,
  balance
});

export const loadOwnerBalance = (owner) => {
  return (dispatch) => {
    window.web3.eth.getBalance(owner)
      .then((balance) => dispatch(ownerBalanceLoaded(balance)))
      .catch((err) => dispatch(ethereumLoadError(err)))
  }
}

export const loadWallets = (owner) => {
  console.log("REMOVE ME")
  return {};
};

export const WALLET_WATCHED = "WALLET_WATCHED";
export const walletWatched = (index, date) => ({
  type: WALLET_WATCHED,
  index,
  date,
});

export const watchWallet = (walletContract, index, nonce) => {
  return (dispatch) => {
    window.setTimeout(() => {
      walletContract.methods.nonce().call()
        .then((newNonce) => {
          try {
            if (newNonce != nonce) {
              alert("payment requested")
            }
            dispatch(walletWatched(index, new Date()))
            dispatch(watchWallet(walletContract, index, newNonce))
          } catch(err) {
            alert(err)
          }
        })

    }, 2000)
  }
}

export const loadWallet = (owner, index) => {
  // return async (dispatch) => {
  //   dispatch(loadingWallet(index))

  //   const address = await KeycardWalletFactory.methods.ownersWallets(owner, index).call();
  //   const jsonInterface = KeycardWallet.options.jsonInterface;
  //   const walletContract = new EmbarkJS.Blockchain.Contract({
  //     abi: jsonInterface,
  //     address: address,
  //   });
  //   walletContract.address = address;

  //   const name = await walletContract.methods.name().call();
  //   const balance = await window.web3.eth.getBalance(address);
  //   const keycardAddress = await walletContract.methods.keycard().call();
  //   const nonce = await walletContract.methods.nonce().call();
  //   const maxTxValue = await walletContract.methods.settings().call();

  //   let icon = "";
  //   try {
  //     icon = String.fromCodePoint(name);
  //   } catch(e){}

  //   dispatch(walletLoaded(index, address, nonce, name, keycardAddress, balance, icon, maxTxValue))
  //   // FIXME: change it with an alternative to continuous fetching
  //   dispatch(watchWallet(walletContract, index, nonce))
  // };
}

export const NEW_WALLET_SELECT_ICON = "NEW_WALLET_SELECT_ICON";
export const newWalletSelectIcon = (icon) => {
  return {
    type: NEW_WALLET_SELECT_ICON,
    icon
  }
}

export const NEW_WALLET_CANCEL = "NEW_WALLET_CANCEL";
export const newWalletCancel = () => {
  return {
    type: NEW_WALLET_CANCEL
  }
}

export const CREATING_WALLET = "CREATING_WALLET";
export const creatingWallet = (index, icon) => ({
  type: CREATING_WALLET,
  index,
  icon
});

export const WALLET_CREATED = "WALLET_CREATED";
export const walletCreated = (receipt) => ({
  type: WALLET_CREATED
});

export const WALLET_CREATION_ERROR = "WALLET_CREATION_ERROR";
export const walletCreationError = (error) => ({
  type: WALLET_CREATION_ERROR,
  error
});

export const NEW_WALLET_FORM_KEYCARD_ADDRESS_CHANGED = "NEW_WALLET_FORM_KEYCARD_ADDRESS_CHANGED";
export const newWalletFormKeycardAddressChanged = (address) => ({
  type: NEW_WALLET_FORM_KEYCARD_ADDRESS_CHANGED,
  address
});

export const NEW_WALLET_FORM_MAX_TX_VALUE_CHANGED = "NEW_WALLET_FORM_MAX_TX_VALUE_CHANGED";
export const newWalletFormMaxTxValueChanged = (value) => ({
  type: NEW_WALLET_FORM_MAX_TX_VALUE_CHANGED,
  value
});

export const createWallet = () => {
  console.log("REMOVE ME")
  return {}
}

export const SELECT_WALLET = 'SELECT_WALLET';
export const selectWallet = (index) => ({
  type: SELECT_WALLET,
  index
});

export const CLOSE_SELECTED_WALLET = 'CLOSE_SELECTED_WALLET';
export const closeSelectedWallet = (index) => ({
  type: CLOSE_SELECTED_WALLET,
});

export const TOPPING_UP_WALLET = 'TOPPING_UP_WALLET';
export const toppingUpWallet = (index) => ({
  type: TOPPING_UP_WALLET,
  index
});

export const ERROR_TOPPING_UP_WALLET = 'ERROR_TOPPING_UP_WALLET';
export const errorToppingUpWallet = (index) => ({
  type: ERROR_TOPPING_UP_WALLET,
  index
});

export const WALLET_TOPPED_UP = 'WALLET_TOPPED_UP';
export const walletToppedUp = (index) => ({
  type: WALLET_TOPPED_UP,
  index
});

export const topUpWallet = (index, address, value) => {
  return async (dispatch, getState) => {
    const owner = getState().owner;
    const tx = {
      from: owner,
      to: address,
      value: window.web3.utils.toWei("0.001"),
    }

    const gas = await window.web3.eth.estimateGas(tx);
    tx.gas = gas;

    dispatch(toppingUpWallet(index));
    window.web3.eth.sendTransaction(tx)
      .then(() => {
        dispatch(loadWallet(owner, index))
        dispatch(walletToppedUp(index))
      })
      .catch((err) => {
        dispatch(errorToppingUpWallet(index))
      })
  }
};

export const KEYCARD_DISCOVERED = "KEYCARD_DISCOVERED";
export const keycardDiscovered = (sig) => {
  //FIXME: put a random message
  const address = window.web3.eth.accounts.recover("0x112233", sig)
  return {
    type: KEYCARD_DISCOVERED,
    address,
  }
}

export const signMessagePinless = (message) => {
  return (dispatch, getState) => {
    const owner = getState().owner;
    // web3 0.2 style using status injected web3
    try {
      //FIXME: put a random message
      window.web3.eth.personal.signMessagePinless("112233", "0x0000000000000000000000000000000000000000", "", function(err, sig) {
        if (err) {
          dispatch(web3Error(err))
        } else {
          dispatch(keycardDiscovered(sig));
        }
      })
    } catch(err) {
      dispatch(web3Error(err))
    }
  };
}
