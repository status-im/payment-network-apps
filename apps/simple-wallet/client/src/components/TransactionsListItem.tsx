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
import {
  compressedAddress,
} from '../utils';

export interface Props {
  event: string
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

const useStyles = makeStyles(theme => ({
  secondaryLine: {
    display: "block"
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

const TransactionsListItem = (props: Props) => {
  const classes = useStyles();
  const fromAddress = props.from ? compressedAddress(props.from, 8) : "";
  const toAddress = props.to ? compressedAddress(props.to, 8) : "";

  const secondary = <span>
    <span className={classes.secondaryLine}>from: {fromAddress}</span>
    <span className={classes.secondaryLine}>to: {toAddress}</span>
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
  })(props.event)

  return (
    <>
      <ListItem button>
        <ListItemAvatar>
          <Fade in={true} timeout={800}>
            <Avatar className={avatarClass}>
              {(props.pending === true || props.pending === undefined)
                && <CircularProgress color="secondary" className={classes.avatarLoading}/>}
              {icon(props.event, iconClass)}
            </Avatar>
          </Fade>
        </ListItemAvatar>
        <StyledListItemText primary={`${props.valueInETH} Ξ`} secondary={secondary} />
      </ListItem>
      <Divider />
    </>
  );
};

export default TransactionsListItem;
