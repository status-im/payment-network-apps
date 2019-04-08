import React from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import Avatar from '@material-ui/core/Avatar';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
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

  return (
    <React.Fragment>
      <ListItem button>
        <Avatar>{wallet.icon}</Avatar>
        <StyledListItemText primary={wallet.value + " Ξ"} secondary={secondary} />
      </ListItem>
      <Divider />
    </React.Fragment>
  );
};

export default WalletsListItem;
