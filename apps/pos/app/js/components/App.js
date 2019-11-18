import React from 'react';

import EmbarkJS from 'Embark/EmbarkJS';

import Pos from "../containers/Pos"
import TapWalletFactory from 'Embark/contracts/TapWalletFactory';

import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';

import { compressedAddress } from '../utils';

const styles = theme => ({
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
    body = <Pos />
  }

  const networkText = props.networkID ? `(Net ID: ${props.networkID})` : "";

  return (
    <div>
      <AppBar style={{ backgroundColor: "#0e1c36", position: "relative" }}>
        <Toolbar>
          <Typography variant="h6" color="inherit">
            Keycard POS
            <Typography variant="caption" color="inherit">
              {compressedAddress(TapWalletFactory.address)} {networkText}
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

export default withStyles(styles)(App);
