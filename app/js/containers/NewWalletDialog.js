import { connect } from 'react-redux';
import NewWalletDialog from '../components/NewWalletDialog';
import {
  newWalletSelectIcon,
  newWalletCancel,
  createWallet,
} from '../actions';

const mapStateToProps = state => ({
  open: state.newWalletForm.open,
  selected: state.newWalletForm.icon,
  creating: state.newWalletForm.creating,
  error: (state.newWalletForm.error || "").toString(),
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
