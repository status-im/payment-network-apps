import React from 'react';

import TransactionsList from '../containers/TransactionsList';
// import NewWalletDialog from '../containers/NewWalletDialog';

import TopPanel from '../containers/TopPanel';

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import CssBaseline from '@material-ui/core/CssBaseline';
import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';

import { newWalletSelectIcon } from "../actions"
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
  },
}));

const App = (props: Props) => {
  const classes = useStyles();

  const loading = <div className={classes.loading}>
    <CircularProgress></CircularProgress>
  </div>;

  let body = loading;

  //FIXME: check if loading
  if (props.web3Initialized) {
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
        <div className={classes.error}>
          {props.walletError}
        </div>
      </div>

    </div>
  );
};

export default App;
