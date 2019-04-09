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

const NewWalletDialog = ({open, creating, selected, onIconClick, onCancelClick, onCreateClick, error}) => (
  <Dialog
    fullScreen
    TransitionComponent={Transition}
    open={open}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogTitle id="alert-dialog-title">Choose an icon to identify your new Wallet</DialogTitle>
    <DialogContent>
      <div>
        {icons.map((icon) =>
          <a key={icon} onClick={() => onIconClick(icon) }
            style={selected == icon ? selectedIconStyles : iconStyles}>{icon}</a>
        )}
      </div>
      <TextField
        margin="dense"
        label="Keycard address"
        type="text"
        fullWidth
      />
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
