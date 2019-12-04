import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types'
import TransactionInIcon from '@material-ui/icons/CallReceived';
import { withStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import CircularProgress from '@material-ui/core/CircularProgress';
import {
  compressedAddress,
  isEmptyAddress,
} from '../utils';

export interface Props {
  transactionHash: string
  pending: boolean | undefined
  from: string | undefined
  to: string | undefined
  valueInETH: string
}


const StyledListItemText = withStyles({
  secondary: {
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden",
  },
})(ListItemText);

const formattedBalance = (balance: string) => {
  const web3 = (window as any).web3;
  return web3.utils.fromWei(balance);
}

const useStyles = makeStyles(theme => ({
  secondaryLine: {
    display: "block"
  },
  avatar: {
    color: "#1a1a1a",
    backgroundColor: '#fff',
    backgroundImage: 'linear-gradient(120deg, rgba(250, 112, 154, 0.5) 0%, rgba(254, 225, 64, 0.5) 100%)',
    boxShadow: "rgba(180, 180, 180, 0.6) 0 0 5px 1px",
    position: "relative",
  },
  avatarLoading: {
    position: "absolute",
    top: 0,
    left: 0,
  }
}));

const TransactionsListItem = (props: Props) => {
  const classes = useStyles();
  const fromAddress = props.from ? compressedAddress(props.from, 8) : "";
  const toAddress = props.to ? compressedAddress(props.to, 8) : "";

  const secondary = <span>
    <span className={classes.secondaryLine}>from: {fromAddress}</span>
    <span className={classes.secondaryLine}>to: {toAddress}</span>
  </span>;

  const secondaryLoading = "loading..."

  return (
    <>
      <ListItem button>
        <ListItemAvatar>
          <Avatar className={classes.avatar}>
            {(props.pending === true || props.pending == undefined) && <CircularProgress color="secondary" className={classes.avatarLoading}/>}
            <TransactionInIcon />
          </Avatar>
        </ListItemAvatar>
        <StyledListItemText primary={`${props.valueInETH} Ξ`} secondary={secondary} />
      </ListItem>
      <Divider />
    </>
  );
};

export default TransactionsListItem;
