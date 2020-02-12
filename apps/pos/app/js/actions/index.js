import EmbarkJS from 'Embark/EmbarkJS';
import KeycardWalletFactory from 'Embark/contracts/KeycardWalletFactory';
import KeycardWallet from 'Embark/contracts/KeycardWallet';
import { emptyAddress } from '../utils';
import { recoverTypedSignature } from 'eth-sig-util';
import ethUtil from 'ethereumjs-util';

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
export const loadingWallet = () => ({
  type: LOADING_WALLET,
});

export const WALLET_LOADED = 'WALLET_LOADED';
export const walletLoaded = (balance, maxTxValue) => ({
  type: WALLET_LOADED,
  balance,
  maxTxValue,
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

function signPaymentRequest(getState, message, cb) {
  const state = getState();

  let domain = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" }
  ];

  let payment = [
    { name: "blockNumber", type: "uint256" },
    { name: "blockHash", type: "bytes32" },
    { name: "amount", type: "uint256" },
    { name: "to", type: "address" }
  ];

  let domainData = {
    name: "KeycardWallet",
    version: "1",
    chainId: state.networkID,
    verifyingContract: KeycardWalletFactory.address
  };

  const data = {
    types: {
      EIP712Domain: domain,
      Payment: payment
    },
    primaryType: "Payment",
    domain: domainData,
    message: message
  };

  const dataString = JSON.stringify(data);

  const signer = state.owner;
  if (window.ethereum && window.ethereum.isStatus) {
    //FIXME: why is signer needed?
    window.ethereum.send("keycard_signTypedData", [signer, dataString])
      .then(resp => cb(undefined, resp, data))
      .catch(err => cb(err, undefined, data));
  } else {
    web3.currentProvider.sendAsync({
      method: "eth_signTypedData_v3",
      params: [signer, dataString],
      from: signer
    }, (err, resp) => cb(err, resp, data));
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
  return (dispatch) => {
    dispatch(loadingOwner())
    return web3.eth.getAccounts()
      .then((accounts) => {
        const owner = accounts[0];
        dispatch(ownerLoaded(owner))
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

export const REQUESTING_PAYMENT = "REQUESTING_PAYMENT";
export const requestingPayment = () => ({
  type: REQUESTING_PAYMENT,
});

export const PAYMENT_REQUESTED = "PAYMENT_REQUESTED";
export const paymentRequested = () => ({
  type: PAYMENT_REQUESTED,
});

export const sendPaymentRequest = (walletContract, message, sig) => {
  return async (dispatch) => {
    try {
      dispatch(requestingPayment())
      const requestPayment = await walletContract.methods.requestPayment(message, sig);
      const estimatedGas = await requestPayment.estimateGas();
      const receipt = await requestPayment.send({
        gas: estimatedGas
      });
      dispatch(paymentRequested())
    } catch(err) {
      console.error("ERROR: ", err)
    }
  }
}

export const loadWallet = (walletAddress, message, sig) => {
  return async (dispatch) => {
    dispatch(loadingWallet())

    const jsonInterface = KeycardWallet.options.jsonInterface;
    const walletContract = new EmbarkJS.Blockchain.Contract({
      abi: jsonInterface,
      address: walletAddress,
    });
    walletContract.address = walletAddress;

    const balance = await walletContract.methods.availableBalance().call();
    const settings = await walletContract.methods.settings().call();

    dispatch(walletLoaded(balance, settings.maxTxValue))
    dispatch(sendPaymentRequest(walletContract, message, sig))
  };
}

export const KEYCARD_DISCOVERED = "KEYCARD_DISCOVERED";
export const keycardDiscovered = (address) => ({
  type: KEYCARD_DISCOVERED,
  address,
});

export const FINDING_WALLET = "FINDING_WALLET";
export const findingWallet = () => ({
  type: FINDING_WALLET,
});

export const WALLET_FOUND = "WALLET_FOUND";
export const walletFound = (address) => ({
  type: WALLET_FOUND,
  address,
});

export const PAYMENT_AMOUNT_VALUE_CHANGE = "PAYMENT_AMOUNT_VALUE_CHANGE";
export const paymentAmountValueChange = (value) => ({
  type: PAYMENT_AMOUNT_VALUE_CHANGE,
  value
});

export const findWallet = (keycardAddress, message, sig) => {
  return async (dispatch) => {
    dispatch(findingWallet());
    KeycardWalletFactory.methods.keycardsWallets(keycardAddress).call()
      .then((address) => {
        //FIXME: if 0x00, the wallet was not found
        dispatch(walletFound(address))
        dispatch(loadWallet(address, message, sig))
      })
      .catch((err) => dispatch(web3Error(err)))
  }
}

export const requestPayment = () => {
  return async (dispatch, getState) => {
    const state = getState();
    let block = await web3.eth.getBlock("latest");
    const message = {
      blockNumber: block.number,
      blockHash: block.hash,
      to: state.owner,
      amount: state.txAmount,
    }

    try {
      signPaymentRequest(getState, message, function(err, response, data) {
        if (err) {
          dispatch(web3Error(err))
        } else {
          const sig = response.result;
          const address = recoverTypedSignature({
            data: data,
            sig: sig,
          })

          dispatch(keycardDiscovered(address));
          dispatch(findWallet(address, message, sig));
        }
      })
    } catch(err) {
      dispatch(web3Error(err))
    }
  };
}
