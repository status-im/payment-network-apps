import React from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import Avatar from '@material-ui/core/Avatar';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import CircularProgress from '@material-ui/core/CircularProgress';

import {
  compressedAddress,
  isEmptyAddress,
} from '../utils';

const StyledListItemText = withStyles({
  secondary: {
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden",
  },
})(ListItemText);

const formattedBalance = (balance) => {
  if (balance) {
    return web3.utils.fromWei(balance);
  }

  return "";
}

const formatTime = (d) => {
  if (!d) {
    return "";
  }

  return `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
}

const styles = {
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
};

const WalletsListItem = ({ wallet, onItemClick }) => {
  const secondary = <span>
    <span style={styles.secondaryLine}>🔖 {compressedAddress(wallet.address, 8)}</span>
    <span style={styles.secondaryLine}>💳 {isEmptyAddress(wallet.keycardAddress) ? "" : compressedAddress(wallet.keycardAddress, 8)}</span>
  </span>;

  const secondaryLoading = "loading..."

  return (
    <React.Fragment>
      <ListItem button onClick={() => onItemClick(wallet.index)}>
        {!wallet.creating &&
            <React.Fragment>
              <Avatar style={styles.avatar}>
                {wallet.toppingUp &&
                  <CircularProgress color="secondary" style={styles.avatarLoading}/>}

                {wallet.icon}
              </Avatar>
              <StyledListItemText primary={formattedBalance(wallet.balance) + " Ξ"} secondary={wallet.creating ? secondaryLoading : secondary} />
            </React.Fragment>
        }

        {wallet.creating && <CircularProgress color="secondary" />}
      </ListItem>
      <Divider />
    </React.Fragment>
  );
};

export default WalletsListItem;
