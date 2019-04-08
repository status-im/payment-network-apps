import EmbarkJS from 'Embark/EmbarkJS';
import TapWalletFactory from 'Embark/contracts/TapWalletFactory';
import TapWallet from 'Embark/contracts/TapWallet';

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
export const ethereumLoaded = (err) => ({
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
export const walletLoaded = (index, address, name, keycard, value, icon) => ({
  type: WALLET_LOADED,
  index,
  address,
  name,
  keycard,
  value,
  icon
});

export const enableEthereum = () => {
  if (window.ethereum) {
    return (dispatch) => {
      dispatch(ethereumLoaded());
      dispatch(loadOwner());
    }
  }

    // window.web3 = new Web3(ethereum);
    // return (dispatch) => {
    //   ethereum.enable()
    //     .then(() => {
    //       dispatch(ethereumLoaded());
    //       dispatch(loadOwner());
    //     })
    //     .catch((err) => dispatch(ethereumLoadError(err)))
    // }
  // } else if (window.web3) {
    // return (dispatch) => {
    //   dispatch(ethereumLoaded());
    //   window.setTimeout(() => dispatch(loadOwner()), 200);
    // }
  // } else {
    // dispatch(ethereumLoadError("no ethereum browser"));
  // }
};

export const loadOwner = () => {
  return (dispatch) => {
    dispatch(loadingOwner())
    return web3.eth.getAccounts()
      .then((accounts) => {
        const owner = accounts[0];
        dispatch(ownerLoaded(owner))
        dispatch(loadWallets(owner))
      });
  }
};

export const loadWallets = (owner) => {
  return (dispatch) => {
    dispatch(loadingWallets())
    dispatch(countingWallets())
    return TapWalletFactory.methods.ownerWalletsCount(owner).call()
      .then((count) => {
        dispatch(walletsCounted(count));
        for (var i = 0; i < count; i++) {
          dispatch(loadWallet(owner, i))
        };
      })
  }
};

export const loadWallet = (owner, index) => {
  return async (dispatch) => {
    dispatch(loadingWallet(index))

    const address = await TapWalletFactory.methods.ownersWallets(owner, index).call();
    const jsonInterface = TapWallet.options.jsonInterface;
    const walletContract = new EmbarkJS.Blockchain.Contract({
      abi: jsonInterface,
      address: address,
    });
    walletContract.address = address;

    const name = await walletContract.methods.name().call();
    const value = await web3.eth.getBalance(address);
    const keycard = await walletContract.methods.keycard().call();

    let icon = "";
    try {
      icon = String.fromCodePoint(name);
    } catch(e){}

    dispatch(walletLoaded(index, address, name, keycard, value, icon))
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
export const newWalletCancel = (icon) => {
  return {
    type: NEW_WALLET_CANCEL
  }
}

export const CREATING_WALLET = "CREATING_WALLET";
export const creatingWallet = () => ({
  type: CREATING_WALLET
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

export const createWallet = () => {
  return async (dispatch, getState) => {
    dispatch(creatingWallet())

    const state = getState();
    const icon = state.newWallet.icon;
    const codePoint = icon.codePointAt(0);
    const name = "0x" + codePoint.toString(16);
    const create = TapWalletFactory.methods.create(name);

    try {
      const estimatedGas = await create.estimateGas()
      const receipt = await create.send({
        from: state.owner,
        gas: estimatedGas,
      });
      console.log(receipt)
      dispatch(walletCreated(receipt))
      dispatch(loadWallets(state.owner))
    } catch(err) {
      dispatch(walletCreationError(err))
    }
  }
}
