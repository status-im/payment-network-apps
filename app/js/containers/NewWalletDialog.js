import { connect } from 'react-redux';
import NewWalletDialog from '../components/NewWalletDialog';
import {
  newWalletSelectIcon,
  newWalletCancel,
  createWallet,
} from '../actions';

const mapStateToProps = state => ({
  open: state.newWallet.open,
  selected: state.newWallet.icon,
  creating: state.newWallet.creating,
  error: (state.newWallet.error || "").toString(),
});

const mapDispatchToProps = dispatch => ({
  onIconClick: (icon) => dispatch(newWalletSelectIcon(icon)),
  onCancelClick: () => dispatch(newWalletCancel()),
  onCreateClick: () => dispatch(createWallet()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NewWalletDialog);
