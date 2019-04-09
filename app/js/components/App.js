import React from 'react';

import EmbarkJS from 'Embark/EmbarkJS';

import WalletsList from '../containers/WalletsList';
import NewWalletDialog from '../containers/NewWalletDialog';
import TapWalletFactory from 'Embark/contracts/TapWalletFactory';

import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import CssBaseline from '@material-ui/core/CssBaseline';
import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';

import {newWalletSelectIcon} from "../actions"
import { compressedAddress } from '../utils';

const styles = theme => ({
  container: {
    paddingTop: 64,
    [theme.breakpoints.only('xs')]: {
      paddingTop: 48,
    },
  },
  loading: {
    textAlign: "center",
    padding: 50
  }
});

const App = (props) => {
  const loading = <div className={props.classes.loading}>
    <CircularProgress />
  </div>;

  let body = loading;
  if (!props.loadingWeb3 && !props.loadingOwner) {
    body = <WalletsList />
  }

  const networkText = props.networkID ? `(Net ID: ${props.networkID})` : "";

  return (
    <div className={props.classes.container}>
      <CssBaseline />
      <AppBar style={{ backgroundColor: "#0e1c36" }}>
        <Toolbar>
          <Typography variant="h6" color="inherit">
            Keycard Wallet
            <Typography variant="caption" color="inherit">
              {compressedAddress(TapWalletFactory.address)} {networkText}
            </Typography>
          </Typography>
        </Toolbar>
      </AppBar>

      <div>
        <NewWalletDialog />
        {body}
      </div>

    </div>
  );
};

export default withStyles(styles)(App);
