import React from 'react';

// import WalletsList from '../containers/WalletsList';
// import NewWalletDialog from '../containers/NewWalletDialog';

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
      paddingTop: 48,
    },
  },
  loading: {
    textAlign: "center",
    marginTop: 100,
  }
}));

const App = (props: Props) => {
  const classes = useStyles();

  const loading = <div className={classes.loading}>
    <CircularProgress></CircularProgress>
  </div>;

  let body = loading;

  if (props.web3Initialized) {
    body = <>Loaded</>
  }
  // if (!props.loadingWeb3 && !props.loadingOwner) {
  //   body = <WalletsList />
  // }

  const networkText = props.networkID ? `(Net ID: ${props.networkID})` : "";

  return (
    <div className={classes.container}>
      <CssBaseline />
      <AppBar style={{ backgroundColor: "#0e1c36" }}>
        <Toolbar>
          <Typography variant="h6" color="inherit">
            Keycard Wallet
            <Typography variant="caption" color="inherit">
              KeycardWalletFactory.address {networkText}
            </Typography>
          </Typography>
        </Toolbar>
      </AppBar>

      <div>
        {body}
      </div>

    </div>
  );
};

// export default withStyles(styles)(App);
export default App;
