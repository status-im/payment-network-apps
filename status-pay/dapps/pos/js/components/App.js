import React from 'react';

import Pos from "../containers/Pos"

import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';

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
