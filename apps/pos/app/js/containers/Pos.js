import { connect } from 'react-redux';
import Pos from '../components/Pos';

import {
  signMessagePinless
} from "../actions";

const mapStateToProps = state => ({
  customerKeycardAddress: state.customer.keycardAddress,
  customerWalletAddress: state.customer.walletAddress,
  customerWallet: state.customer.wallet,
  findingWallet: state.findingWallet,
  loadingWallet: state.loadingWallet,
  requestingPayment: state.requestingPayment,
  paymentRequested: state.paymentRequested,
});

const mapDispatchToProps = dispatch => ({
  onTapRequest: (message) => dispatch(signMessagePinless(message)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Pos);
