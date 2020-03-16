import { connect } from 'react-redux';
import WalletsListItem from '../components/WalletsListItem';
import { selectWallet } from '../actions';

const mapStateToProps = state => ({
  //FIXME: hack
  wallets: state.wallets,
  tokenSymbol: state.tokenSymbol,
});

const mapDispatchToProps = dispatch => ({
  onItemClick: (index) => dispatch(selectWallet(index))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletsListItem);
