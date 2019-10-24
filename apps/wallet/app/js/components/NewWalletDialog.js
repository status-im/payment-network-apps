import React from 'react';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import InputAdornment from '@material-ui/core/InputAdornment';

const icons = ["💳", "👛", "💸", "😺"]

const iconStyles = {
  fontSize: "2em",
  marginRight: 16,
  padding: 4,
  cursor: "pointer"
}

const selectedIconStyles = {
  ...iconStyles,
  border: "4px solid #999"
}

const errorStyles = {
  color: "red",
}

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

const NewWalletDialog = ({open, creating, selected, keycardAddress, onIconClick, onCancelClick, onCreateClick, onKeycardChange, error, onTapButtonClick, onMaxTxValueChange, maxTxValue}) => (
  <Dialog
    fullScreen
    TransitionComponent={Transition}
    open={open}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogTitle id="alert-dialog-title">New Wallet</DialogTitle>
    <DialogContent>
      <Typography variant="body2" gutterBottom>
        Choose an icon to identify your wallet
      </Typography>
      <div style={{marginBottom: 16}}>
        {icons.map((icon) =>
          <a key={icon} onClick={() => onIconClick(icon) }
            style={selected == icon ? selectedIconStyles : iconStyles}>{icon}</a>
        )}
      </div>

      <TextField
        margin="dense"
        label="Maximum transaction value"
        type="text"
        value={maxTxValue}
        style={{marginBottom: 16}}
        fullWidth
        onChange={(event) => onMaxTxValueChange(event.currentTarget.value)}
        InputProps={{
          startAdornment: <InputAdornment position="start" style={{paddingBottom: 7}}>Ξ</InputAdornment>,
        }}
      />

      <TextField
        margin="dense"
        label="Keycard address"
        type="text"
        value={keycardAddress}
        style={{marginBottom: 16}}
        fullWidth
        onChange={(event) => onKeycardChange(event.currentTarget.value)}
      />

      <div style={{margin: 16, textAlign: "center"}}>
        <Typography variant="body2" gutterBottom>
          or
        </Typography>
      </div>

      <Button onClick={() => onTapButtonClick("hello world")} size="large" color="primary" variant="contained" fullWidth>
        CONNECT TAPPING YOUR KEYCARD
      </Button>

      {creating && <div style={{marginTop: 50, textAlign: "center"}}>
        <CircularProgress />
      </div>}

    </DialogContent>

    <DialogActions>
      {!creating &&
        <Button onClick={onCancelClick} color="primary">
          Cancel
        </Button>}

      <Button onClick={onCreateClick} color="primary" autoFocus disabled={(selected && !creating) ? false : true}>
        {!creating ? "Create" : "Creating..."}
      </Button>
    </DialogActions>

    {error &&
      <DialogActions>
        <div style={errorStyles}>{error}</div>
      </DialogActions>}
  </Dialog>
);

export default NewWalletDialog;
