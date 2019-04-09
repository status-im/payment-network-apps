import React from 'react';

import { newWallet } from '../actions';

import WalletsListItem from '../containers/WalletsListItem';

import TopPanel from './TopPanel';
import List from '@material-ui/core/List';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

const styles = {
  addButton: {
    position: 'fixed',
    zIndex: 1,
    bottom: 30,
    right: 30,
    bottom: 30,
  },
  loading: {
    background: "#1a1a1a",
    color: "#fff",
    textAlign: "center",
    padding: "2"
  },
  empty: {
    padding: 10,
    textAlign: "center",
  },
  wrongNetwork: {
    padding: 10,
    textAlign: "center",
    background: "red",
    color: "#fff",
    fontWeight: "bold",
  }
};

const VALID_NETWORK_NAME = "Ropsten";

const formatBalance = (balance) => {
  if (balance) {
    // return web3.utils.fromWei(new web3.utils.BN(ownerBalance))
    return web3.utils.fromWei(balance);
  }

  return "-";
}

const WalletsList = ({ networkID, countingWallets, wrongNetwork, loading, walletsCount, loadedWalletsCount, wallets, onPlusClick, owner, ownerBalance }) => {
  return (<React.Fragment>
    <TopPanel wallets={wallets} />

    {loading && <div style={styles.loading}>
      <Typography variant="caption" color="inherit">
        loading {loadedWalletsCount + 1} of {walletsCount} wallets...
      </Typography>
    </div>}

    {!wrongNetwork && countingWallets && <div style={styles.loading}>
      <Typography variant="caption" color="inherit">
        counting wallets...
      </Typography>
    </div>}

    {wrongNetwork && <div style={styles.wrongNetwork}>
      Wrong network. Please connect to {VALID_NETWORK_NAME}.
    </div>}

    {!wrongNetwork && !countingWallets && walletsCount == 0 && <div style={styles.empty}>
      <Typography variant="caption" color="inherit">
        You don't have wallets yet. Create a new one!
        <br />
        <br />
        <br />

        Your balance is: {formatBalance(ownerBalance)}.
        <br />
        After request some test ETH wait some seconds and check your wallet.
        <br />
      <Button variant="contained" target="_blank" href={`https://faucet-ropsten.status.im/donate/${owner}`}>
        REQUEST TEST ETH
      </Button>
      </Typography>
    </div>}

    <List>
      {wallets.map((wallet) => (
        wallet && <WalletsListItem key={wallet.address} wallet={wallet} />
      ))}
    </List>

    {!wrongNetwork && <Fab color="secondary"
      aria-label="Add"
      style={styles.addButton}
      onClick={ () => onPlusClick() }>
      <AddIcon />
    </Fab>}
  </React.Fragment>
  )
};

export default WalletsList;
