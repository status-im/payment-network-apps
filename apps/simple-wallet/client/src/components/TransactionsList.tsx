import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TransactionsListItem from '../containers/TransactionsListItem';
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
        <TransactionsListItem key={tx.id} id={tx.id} />
      ))}
    </List>}
  </>
  )
};

export default WalletsList;
