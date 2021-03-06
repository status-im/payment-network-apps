import EmbarkJS from 'Embark/EmbarkJS';
import KeycardWalletFactory from 'Embark/contracts/KeycardWalletFactory';
import ERC20Detailed from 'Embark/contracts/ERC20Detailed';
import KeycardWallet from 'Embark/contracts/KeycardWallet';
import { emptyAddress } from '../utils';

export const TOKEN_DISCOVERED = 'TOKEN_DISCOVERED';
export const tokenDiscovered = (address, symbol) => ({
  type: TOKEN_DISCOVERED,
  address,
  symbol,
});

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
export const walletLoaded = (index, address, name, keycardAddress, balance) => ({
  type: WALLET_LOADED,
  index,
  address,
  name,
  keycardAddress,
  balance,
});

export const NETWORK_ID_LOADED = "NETWORK_ID_LOADED";
export const networkIDLoaded = (id) => ({
  type: NETWORK_ID_LOADED,
  id
});

export const loadNetworkID = () => {
  return (dispatch) => {
    web3.eth.net.getId()
      .then((id) => dispatch(networkIDLoaded(id)))
      .catch((err) => {
        dispatch(web3Error(err))
      })
  }
}

export const enableEthereum = () => {
  if (window.ethereum) {
    window.web3 = new Web3(ethereum);

    return (dispatch) => {
      ethereum.enable()
        .then(() => {
          window.setTimeout(() => {
            dispatch(ethereumLoaded());
            dispatch(loadNetworkID());
            dispatch(loadOwner());
          }, 200)
        })
        .catch((err) => {
          dispatch(ethereumLoadError(err));
        })
    }
  } else if (window.web3) {
    return (dispatch) => {
      dispatch(ethereumLoaded());
      window.setTimeout(() => {
        dispatch(loadNetworkID());
        dispatch(loadOwner())
      }, 200)
    }
  } else {
    return ethereumLoadError("no ethereum browser");
  }
};

export const loadOwner = () => {
  return async dispatch => {
    const tokenAddress = await KeycardWalletFactory.methods.currency().call();
    const erc20 = new EmbarkJS.Blockchain.Contract({
      address: tokenAddress,
      abi: ERC20Detailed.options.jsonInterface,
    });
    const tokenSymbol  = await erc20.methods.symbol().call();
    dispatch(tokenDiscovered(tokenAddress, tokenSymbol));
    dispatch(loadingOwner())
    return web3.eth.getAccounts()
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
    web3.eth.getBalance(owner)
      .then((balance) => dispatch(ownerBalanceLoaded(balance)))
      .catch((err) => dispatch(ethereumLoadError(err)))
  }
}

export const loadWallets = (owner) => {
  return (dispatch) => {
    dispatch(loadingWallets())
    dispatch(countingWallets())
    return KeycardWalletFactory.methods.countWalletsForOwner(owner).call()
      .then((count) => {
        dispatch(walletsCounted(count));
        for (var i = 0; i < count; i++) {
          dispatch(loadWallet(owner, i))
        };
      })
      .catch((err) => {
        const params = new URLSearchParams(document.location.search);
        const web3Retry = "r";
        if (!params.get(web3Retry)) {
          params.set(web3Retry, "1");
          document.location.search = params.toString();
        } else {
          dispatch(web3Error(err));
        }
      })
  }
};

export const WALLET_WATCHED = "WALLET_WATCHED";
export const walletWatched = (index, date) => ({
  type: WALLET_WATCHED,
  index,
  date,
});

export const loadWallet = (owner, index) => {
  return async (dispatch, getState) => {
    const state = getState();
    dispatch(loadingWallet(index))

    const walletAddress = await KeycardWalletFactory.methods.ownersWallets(owner, index).call();
    const jsonInterface = KeycardWallet.options.jsonInterface;
    const walletContract = new EmbarkJS.Blockchain.Contract({
      abi: jsonInterface,
      address: walletAddress,
    });

    const erc20 = new EmbarkJS.Blockchain.Contract({
      address: state.tokenAddress,
      abi: ERC20Detailed.options.jsonInterface,
    });

    const balance = await erc20.methods.balanceOf(walletAddress).call();
    const keycardAddress = await walletContract.methods.keycard().call();
    dispatch(walletLoaded(index, walletAddress, "-", keycardAddress, balance))
  };
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
export const creatingWallet = (index) => ({
  type: CREATING_WALLET,
  index,
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
  return async (dispatch, getState) => {
    const state = getState();
    const maxTxValue = web3.utils.toWei(state.newWalletForm.maxTxValue);
    const keycardAddress = state.newWalletForm.keycardAddress || emptyAddress;
    const create = KeycardWalletFactory.methods.create(keycardAddress, false, 1, maxTxValue);
    const walletIndex = state.wallets.length;

    const estimatedGas = await create.estimateGas()
    create.send({ from: state.owner, gas: estimatedGas })
      .then((receipt) => {
        console.log(receipt)
        dispatch(walletCreated(receipt))
        dispatch(newWalletCancel())
        dispatch(loadWallets(state.owner))
      })
      .catch((err) => {
        dispatch(web3Error(err))
        dispatch(walletCreationError(err))
      });

    dispatch(creatingWallet(walletIndex))
  }
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
      value: web3.utils.toWei("0.001"),
    }

    const gas = await web3.eth.estimateGas(tx);
    tx.gas = gas;

    dispatch(toppingUpWallet(index));
    web3.eth.sendTransaction(tx)
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
  const address = web3.eth.accounts.recover("0x112233", sig)
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
      web3.eth.personal.signMessagePinless("112233", "0x0000000000000000000000000000000000000000", "", function(err, sig) {
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
