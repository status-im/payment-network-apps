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

const secondaryLineStyles = {
  display: "block"
};

const WalletsListItem = ({ wallet }) => {
  const secondary = <span>
    <span style={secondaryLineStyles}>🔖 {compressedAddress(wallet.address)}</span>
    <span style={secondaryLineStyles}>💳 {isEmptyAddress(wallet.keycard) ? "" : compressedAddress(wallet.keycard)}</span>
  </span>;

  const secondaryLoading = "loading..."

  return (
    <React.Fragment>
      <ListItem button>
        {!wallet.creating &&
            <React.Fragment>
              <Avatar>{wallet.icon}</Avatar>
              <StyledListItemText primary={wallet.value + " Ξ"} secondary={wallet.creating ? secondaryLoading : secondary} />
            </React.Fragment>
        }
        {wallet.creating && <CircularProgress color="secondary" />}
      </ListItem>
      <Divider />
    </React.Fragment>
  );
};

export default WalletsListItem;
