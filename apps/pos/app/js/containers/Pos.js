import { connect } from 'react-redux';
import Pos from '../components/Pos';

import {
  requestPayment,
  paymentAmountValueChange
} from "../actions";

const mapStateToProps = state => ({
  customerKeycardAddress: state.customer.keycardAddress,
  customerWalletAddress: state.customer.walletAddress,
  customerWallet: state.customer.wallet,
  findingWallet: state.findingWallet,
  loadingWallet: state.loadingWallet,
  requestingPayment: state.requestingPayment,
  paymentRequested: state.paymentRequested,
  txAmount: state.txAmount
});

const mapDispatchToProps = dispatch => ({
  onTapRequest: () => dispatch(requestPayment()),
  onAmountChange: (value) => dispatch(paymentAmountValueChange(value)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Pos);
