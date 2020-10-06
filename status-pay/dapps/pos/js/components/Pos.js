import React from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import Fab from '@material-ui/core/Fab';
import CheckIcon from '@material-ui/icons/Check';
import InputAdornment from '@material-ui/core/InputAdornment';

export const compressedAddress = (a, padding) => {
  padding = padding || 4;
  return `${a.slice(0, padding + 2)}...${a.slice(a.length - padding)}`
}

const formattedBalance = (balance) => {
  if (balance) {
    return web3.utils.fromWei(new web3.utils.BN(balance));
  }

  return "";
}

const Pos = ({requestingPayment, paymentRequested, onTapRequest, customerKeycardAddress, findingWallet, customerWalletAddress, loadingWallet, customerWallet, onAmountChange, txAmount}) => {
  return (
    <div style={{paddingTop: 32}}>
      {!requestingPayment && !paymentRequested &&
          <div style={{marginBottom: 32, textAlign: "center"}}>
            <TextField margin="dense" label="Transaction amount" type="text" style={{marginBottom: 16}} fullWidth
            onChange={(event) => onAmountChange(event.currentTarget.value)}
            value = {txAmount}
            InputProps={{startAdornment: <InputAdornment position="start" style={{paddingBottom: 7}}>Ξ</InputAdornment>}} />
            <Button onClick={() => onTapRequest()} size="large" color="primary" variant="contained">
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
