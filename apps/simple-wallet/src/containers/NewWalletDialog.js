import { connect } from 'react-redux';
import NewWalletDialog from '../components/NewWalletDialog';
import {
  newWalletSelectIcon,
  newWalletCancel,
  createWallet,
  newWalletFormKeycardAddressChanged,
  newWalletFormMaxTxValueChanged,
  signMessagePinless,
} from '../actions';

const mapStateToProps = state => ({
  open: state.newWalletForm.open,
  selected: state.newWalletForm.icon,
  creating: state.newWalletForm.creating,
  error: (state.newWalletForm.error || "").toString(),
  keycardAddress: state.newWalletForm.keycardAddress || "",
  maxTxValue: state.newWalletForm.maxTxValue,
});

const mapDispatchToProps = dispatch => ({
  onIconClick: (icon) => dispatch(newWalletSelectIcon(icon)),
  onCancelClick: () => dispatch(newWalletCancel()),
  onCreateClick: () => dispatch(createWallet()),
  onKeycardChange: (address) => dispatch(newWalletFormKeycardAddressChanged(address)),
  onMaxTxValueChange: (value) => dispatch(newWalletFormMaxTxValueChanged(value)),
  onTapButtonClick: (message) => dispatch(signMessagePinless(message)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NewWalletDialog);
