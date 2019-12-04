import React, { createRef, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import { Props } from '../containers/ReceiveDialog';
import { TransitionProps } from '@material-ui/core/transitions';
import { makeStyles } from '@material-ui/core/styles';
import { QRCode, QR8BitByte } from 'qrcode-generator-ts';

const useStyles = makeStyles(theme => ({
  qrdialog: {
    width: "100%",
  },
  container: {
    textAlign: "center",
  },
  qrcode: {
    width: "100%",
    margin: "0 auto",
  }
}));

const Transition = React.forwardRef<unknown, TransitionProps>((props, ref) => {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ReceiveDialog = (props: Props) => {
  const classes = useStyles();
  const image = React.useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (props.address === undefined || props.networkID === undefined || image.current === null) {
      return;
    }

    var qr = new QRCode();
    qr.setTypeNumber(5);
    qr.addData(new QR8BitByte(`ethereum:${props.address}@${props.networkID}`) ); // most useful for usual purpose.
    qr.make();
    image.current.src = qr.toDataURL(4);

  }, [props.address, props.networkID, image.current]);

  const open = true;

  return <Dialog
          fullWidth={true}
          maxWidth="xs"
          className={classes.qrdialog}
          open={props.open}
          TransitionComponent={Transition}
          keepMounted
          onClose={props.handleClose}
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description">
    <DialogTitle id="alert-dialog-slide-title">Top up your wallet</DialogTitle>
    <DialogContent className={classes.container}>
      <div>
        <img className={classes.qrcode} ref={image} />
      </div>
      <div>
        <pre>
          {props.address}
        </pre>
      </div>
    </DialogContent>
    <DialogActions>
      <Button onClick={props.handleClose} color="primary">
        Close
      </Button>
    </DialogActions>
  </Dialog>;
}

export default ReceiveDialog;
