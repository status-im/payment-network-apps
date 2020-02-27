import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import TransactionInIcon from '@material-ui/icons/CallReceived';
import TransactionOutIcon from '@material-ui/icons/CallMade';
import TransactionUnknownIcon from '@material-ui/icons/HelpOutline';
import { withStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import CircularProgress from '@material-ui/core/CircularProgress';
import Fade from '@material-ui/core/Fade';
import { Props } from '../containers/TransactionsListItem';
import {
  compressedAddress,
} from '../utils';

const StyledListItemText = withStyles({
  secondary: {
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden",
  },
})(ListItemText);

const useStyles = makeStyles(theme => ({
  block: {
    display: "block"
  },
  timestamp: {
    display: "block",
    fontStyle: "italic",
    color: "rgba(0, 0, 0, 0.54)",
    fontSize: 12,
  },
  avatar: {
    backgroundColor: '#fff',
    boxShadow: "rgba(180, 180, 180, 0.6) 0 0 5px 1px",
    backgroundImage: 'linear-gradient(120deg, rgba(114, 255, 132, 0.5) 0%, rgba(255, 225, 255, 0.5) 100%)',
  },
  avatarIn: {
    backgroundColor: '#fff',
    boxShadow: "rgba(180, 180, 180, 0.6) 0 0 5px 1px",
    extend: "avatar",
    backgroundImage: 'linear-gradient(120deg, rgba(114, 255, 132, 0.5) 0%, rgba(255, 225, 255, 0.5) 100%)',
  },
  avatarOut: {
    backgroundColor: '#fff',
    boxShadow: "rgba(180, 180, 180, 0.6) 0 0 5px 1px",
    extend: "avatar",
    backgroundImage: 'linear-gradient(120deg, rgba(255, 114, 114, 0.5) 0%, rgba(255, 225, 255, 0.5) 100%)',
  },
  avatarLoading: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  icon: {
    color: "#000",
  },
  iconIn: {
    color: "green",
  },
  iconOut: {
    color: "red",
  },
}));

const icon = (event: string, className: any) => {
  switch(event) {
    case "TopUp":
      return <TransactionInIcon className={className} />
    case "NewPaymentRequest":
      return <TransactionOutIcon className={className} />
    default:
      return <TransactionUnknownIcon />
  }
};

export function timestampToString(timestamp: number | undefined) {
  if (timestamp === undefined) {
    return "";
  }

  return new Date(timestamp * 1000).toLocaleDateString('default', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const TransactionsListItem = (props: Props) => {
  const classes = useStyles();

  const tx = props.transactions[props.id];
  if (tx === undefined) {
    return null;
  }

  const fromAddress = tx.from ? compressedAddress(tx.from, 8) : "";
  const toAddress = tx.to ? compressedAddress(tx.to, 8) : "";

  let date = "";
  const block = props.blocks[tx.blockNumber];
  if (block !== undefined) {
    date = timestampToString(block.timestamp);
  }

  const primary = <span>
    <span className={classes.block}>{tx.valueInETH} Ξ</span>
    <span className={classes.timestamp}>{date}</span>
  </span>;

  const secondary = <span>
    <span className={classes.block}>from: {fromAddress}</span>
    <span className={classes.block}>to: {toAddress}</span>
  </span>;

  const [avatarClass, iconClass] = (event => {
    switch(event) {
      case "TopUp":
        return [classes.avatarIn, classes.iconIn];
      case "NewPaymentRequest":
        return [classes.avatarOut, classes.iconOut];
      default:
        return [classes.avatar, classes.icon];
    }
  })(tx.event)

  return (
    <>
      <ListItem button>
        <ListItemAvatar>
          <Fade in={true} timeout={800}>
            <Avatar className={avatarClass}>
              {(tx.pending === true || tx.pending === undefined)
                && <CircularProgress color="secondary" className={classes.avatarLoading}/>}
              {icon(tx.event, iconClass)}
            </Avatar>
          </Fade>
        </ListItemAvatar>
        <StyledListItemText primary={primary} secondary={secondary} />
      </ListItem>
      <Divider />
    </>
  );
};

export default TransactionsListItem;
