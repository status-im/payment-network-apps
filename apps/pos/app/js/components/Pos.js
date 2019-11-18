import React from 'react';

import EmbarkJS from 'Embark/EmbarkJS';

import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Fab from '@material-ui/core/Fab';
import CheckIcon from '@material-ui/icons/Check';

export const compressedAddress = (a, padding) => {
  padding = padding || 4;
  return `${a.slice(0, padding + 2)}...${a.slice(a.length - padding)}`
}

const formattedBalance = (balance) => {
  if (balance) {
    return web3.utils.fromWei(balance);
  }

  return "";
}

const Pos = ({requestingPayment, paymentRequested, onTapRequest, customerKeycardAddress, findingWallet, customerWalletAddress, loadingWallet, customerWallet}) => {
  return (
    <div style={{paddingTop: 32}}>
      {!requestingPayment && !paymentRequested &&
          <div style={{marginBottom: 32, textAlign: "center"}}>
            <Button onClick={() => onTapRequest("hello world")} size="large" color="primary" variant="contained">
              REQUEST PAYMENT
            </Button>
          </div>
      }

      {requestingPayment &&
        <div>
          <div style={{textAlign: "center"}}>
            <CircularProgress />
          </div>

          {customerKeycardAddress && <p>
            Customer Keycard Address: {compressedAddress(customerKeycardAddress)}
          </p>}

          {findingWallet && <p>
            finding wallet...
          </p>}

          {customerWalletAddress && <p>
            Wallet Address: {compressedAddress(customerWalletAddress)}
          </p>}

          {loadingWallet && <p>
            loading wallet...
          </p>}

          {customerWallet && <p>
            <strong>Wallet</strong><br />
            Nonce: {customerWallet.nonce} <br />
            Balance: {formattedBalance(customerWallet.balance)} <br />
            Max Tx Value: {formattedBalance(customerWallet.maxTxValue)} <br />
          </p>}
        </div>
      }

      {paymentRequested &&
          <div style={{textAlign: "center"}}>
            <Fab color="primary">
              <CheckIcon />
            </Fab>
          </div>
      }
    </div>
  );
};

export default Pos;
