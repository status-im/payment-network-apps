import { connect } from 'react-redux';
import WalletsList from '../components/WalletsList';
import { newWallet } from '../actions';

const mapStateToProps = state => ({
  wallets: state.wallets,
});

const mapDispatchToProps = dispatch => ({
  onPlusClick: () => dispatch(newWallet())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletsList);
