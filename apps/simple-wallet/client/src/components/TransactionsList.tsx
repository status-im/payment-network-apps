import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TransactionsListItem from '../components/TransactionsListItem';
import { Props } from '../containers/TransactionsList';
import List from '@material-ui/core/List';
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles(theme => ({
  addButton: {
    position: 'fixed',
    zIndex: 1,
    bottom: 30,
    right: 30,
  },
  loading: {
    textAlign: "center",
    marginTop: 32,
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
  },
  progress: {
    color: "rgb(14, 28, 54)",
  },
}));

const WalletsList = (props: Props) => {
  const classes = useStyles();

  return (<>
    {props.loading && <div className={classes.loading}>
      <CircularProgress className={classes.progress} disableShrink></CircularProgress>
    </div>}
    {!props.loading && <List>
      {props.transactions.map((tx) => (
        <TransactionsListItem key={tx.id}
          pending={tx.pending}
          from={tx.from}
          to={tx.to}
          valueInETH={tx.valueInETH}
          transactionHash={tx.transactionHash} />
      ))}
    </List>}
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
