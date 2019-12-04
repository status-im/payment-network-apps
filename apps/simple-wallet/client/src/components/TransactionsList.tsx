import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TransactionsListItem from '../components/TransactionsListItem';
import { Props } from '../containers/TransactionsList';
import TopPanel from '../containers/TopPanel';
import List from '@material-ui/core/List';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles(theme => ({
  addButton: {
    position: 'fixed',
    zIndex: 1,
    bottom: 30,
    right: 30,
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
}));

const VALID_NETWORK_NAME = "Ropsten";

const formatBalance = (balance: string) => {
  const web3 = (window as any).web3;
  if (balance) {
    // return web3.utils.fromWei(new web3.utils.BN(ownerBalance))
    return web3.utils.fromWei(balance);
  }

  return "-";
}

const WalletsList = (props: Props) => {
  const classes = useStyles();

  return (<>
    <List>
      {props.transactions.map((tx) => (
        <TransactionsListItem key={tx.id}
          pending={tx.pending}
          from={tx.from}
          to={tx.to}
          valueInETH={tx.valueInETH}
          transactionHash={tx.transactionHash} />
      ))}
    </List>
  </>
  )
  // return (<React.Fragment>
  //   {loading && <div style={styles.loading}>
  //     <Typography variant="caption" color="inherit">
  //       loading {loadedWalletsCount + 1} of {walletsCount} wallets...
  //     </Typography>
  //   </div>}

  //   {!wrongNetwork && countingWallets && <div style={styles.loading}>
  //     <Typography variant="caption" color="inherit">
  //       counting wallets...
  //     </Typography>
  //   </div>}

  //   {wrongNetwork && <div style={styles.wrongNetwork}>
  //     Wrong network. Please connect to {VALID_NETWORK_NAME}.
  //   </div>}

  //   <List>
  //     {transactions.map((tx) => (
  //       <TransactionsListItem key={tx.address} wallet={wallet} />
  //     ))}
  //   </List>

  //   {!wrongNetwork && <Fab color="secondary"
  //     aria-label="Add"
  //     style={styles.addButton}
  //     onClick={ () => onPlusClick() }>
  //     <AddIcon />
  //   </Fab>}
  // </React.Fragment>
  // )
};

export default WalletsList;
