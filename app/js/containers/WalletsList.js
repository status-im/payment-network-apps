import { connect } from 'react-redux';
import WalletsList from '../components/WalletsList';
import { newWallet } from '../actions';

const VALID_NETWORK_ID = 3;

const mapStateToProps = state => ({
  countingWallets: state.countingWallets,
  wallets: state.wallets,
  walletsCount: state.walletsCount,
  networkID: state.networkID,
  loadedWalletsCount: state.loadedWalletsCount,
  loading: state.loadedWalletsCount < state.walletsCount,
  wrongNetwork: state.networkID != undefined && state.networkID != VALID_NETWORK_ID,
});

const mapDispatchToProps = dispatch => ({
  onPlusClick: () => dispatch(newWallet())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletsList);
