import React from 'react';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import Zoom from '@material-ui/core/Zoom';
import Divider from '@material-ui/core/Divider';
import CircularProgress from '@material-ui/core/CircularProgress';

const formattedBalance = (balance) => {
  if (balance) {
    return web3.utils.fromWei(balance);
  }

  return "";
}

const styles = {
  appBar: {
    position: 'relative',
    marginBottom: 32,
  }
};

function Transition(props) {
  // return <Slide direction="up" {...props} />;
  return <Zoom {...props} />;
}

const SelectedWalletDialog = ({open, onCloseClick, icon, address, nonce, keycardAddress, balance, index, onTopUp, toppingUp, maxTxValue}) => (
  <Dialog
    fullScreen
    TransitionComponent={Transition}
    open={open}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <AppBar style={styles.appBar}>
      <Toolbar>
        <IconButton color="inherit" onClick={onCloseClick} aria-label="Close">
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" color="inherit">
          Wallet {icon}
        </Typography>
      </Toolbar>
    </AppBar>

    <DialogContent>
      <Typography variant="h6" gutterBottom>
        🔖 Wallet Address
      </Typography>
      <Typography variant="body1" gutterBottom>
         {address}
      </Typography>

      <Divider style={{margin: "16px 0"}} />

      <Typography variant="h6" gutterBottom>
        💳 Keycard Address
      </Typography>
      <Typography variant="body1" gutterBottom>
        {keycardAddress || "0x"}
      </Typography>

      <Divider style={{margin: "16px 0"}} />

      <Typography variant="h6" gutterBottom>
        Balance
      </Typography>

      <Typography variant="body1" gutterBottom>
        {formattedBalance(balance)}
      </Typography>

      <Divider style={{margin: "16px 0"}} />

      <Typography variant="h6" gutterBottom>
        Number of transactions
      </Typography>
      <Typography variant="body1" gutterBottom>
        {nonce}
      </Typography>

      <Divider style={{margin: "16px 0"}} />

      <Typography variant="h6" gutterBottom>
        Maximum transaction value
      </Typography>
      <Typography variant="body1" gutterBottom>
        {formattedBalance(maxTxValue)}
      </Typography>

      <Divider style={{margin: "16px 0"}} />

      {!toppingUp && <Button onClick={() => onTopUp(index, address)} size="large" color="primary" variant="contained" fullWidth>
        TOP UP 0.001 ETH
      </Button>}

      {toppingUp && <div style={{marginTop: 50, textAlign: "center"}}>
        <CircularProgress />
      </div>}

    </DialogContent>
  </Dialog>
);

export default SelectedWalletDialog;
