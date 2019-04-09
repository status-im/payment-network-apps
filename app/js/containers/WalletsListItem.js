import { connect } from 'react-redux';
import WalletsListItem from '../components/WalletsListItem';
import { newWallet } from '../actions';

const VALID_NETWORK_ID = 3;

const mapStateToProps = state => ({
});

const mapDispatchToProps = dispatch => ({
  onItemClick: () => dispatch(newWallet())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletsListItem);
