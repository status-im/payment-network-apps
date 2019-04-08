import React from 'react';

import EmbarkJS from 'Embark/EmbarkJS';

import WalletsList from '../containers/WalletsList';
import NewWalletDialog from '../containers/NewWalletDialog';

import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import CssBaseline from '@material-ui/core/CssBaseline';
import Avatar from '@material-ui/core/Avatar';
import {newWalletSelectIcon} from "../actions"

const styles = theme => ({
  container: {
    paddingTop: 64,
    [theme.breakpoints.only('xs')]: {
      paddingTop: 48,
    },
  }
});

// const icons = ["💳", "👛", "💸"]
const App = (props) => {
  const loading = <div>loading...</div>;

  const body = (props.loadingWeb3 || props.loadingOwner) ?
    loading :
    <WalletsList />;

  return (
    <div className={props.classes.container}>
      <CssBaseline />
      <AppBar style={{ backgroundColor: "#0e1c36" }}>
        <Toolbar>
          <Typography variant="h6" color="inherit">
            Keycard Wallet
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
