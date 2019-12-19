import React from 'react';

import TransactionsList from '../containers/TransactionsList';
import TopPanel from '../containers/TopPanel';
import ReceiveDialog from '../containers/ReceiveDialog';

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import CssBaseline from '@material-ui/core/CssBaseline';
import CircularProgress from '@material-ui/core/CircularProgress';

import { compressedAddress } from '../utils';
import { Props } from '../containers/App';

const useStyles = makeStyles(theme => ({
  container: {
    paddingTop: 64,
    [theme.breakpoints.only('xs')]: {
      // paddingTop: 48,
      paddingTop: 56,
    },
  },
  loading: {
    textAlign: "center",
    marginTop: 100,
    display: "inline-block",
    width: "100%",
  },
  main: {
    position: 'relative'
  },
  error: {
    position: 'absolute',
    width: '100%',
    top: '0',
    left: '0',
    textAlign: 'center',
    background: 'red',
    color: 'white',
    padding: "8px 0",
    fontWeight: "bold",
  },
  progress: {
    color: "rgb(14, 28, 54)",
  },
}));

const App = (props: Props) => {
  const classes = useStyles();

  const loading = <div className={classes.loading}>
    <CircularProgress disableShrink className={classes.progress}></CircularProgress>
  </div>;

  let body = <></>;

  if (props.web3Error !== undefined) {
    return <div className={classes.error}>
      {props.web3Error}
    </div>;
  }

  //FIXME: check if loading
  if (props.walletError === undefined && props.loading) {
    body = loading;
  } else if (!props.loading) {
    body = <>
      <TopPanel />
      <TransactionsList />
    </>;
  }

  const networkText = props.networkID ? `(Net ID: ${props.networkID})` : "";
  const walletAddress = props.walletAddress ? compressedAddress(props.walletAddress) : "";

  return (
    <div className={classes.container}>
      <CssBaseline />
      <AppBar style={{ backgroundColor: "#0e1c36" }}>
        <Toolbar>
          <Typography variant="h6" color="inherit">
            Keycard Wallet &nbsp;
            <Typography variant="caption" color="inherit">
              {walletAddress} &nbsp;
              {networkText}
            </Typography>
          </Typography>
        </Toolbar>
      </AppBar>

      <div className={classes.main}>
        {body}
        {props.walletError !== undefined && <div className={classes.error}>
          {props.walletError}
        </div>}

        <ReceiveDialog />
      </div>

    </div>
  );
};

export default App;
