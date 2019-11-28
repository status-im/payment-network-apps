// import { connect } from 'react-redux';
// import WalletsList from '../components/WalletsList';
// import { newWallet } from '../actions';

// const VALID_NETWORK_ID = 3;
// const LOCAL_NETWORK_ID = 1337;

// const mapStateToProps = state => ({
//   countingWallets: state.countingWallets,
//   wallets: state.wallets,
//   walletsCount: state.walletsCount,
//   networkID: state.networkID,
//   loadedWalletsCount: state.loadedWalletsCount,
//   loading: state.loadedWalletsCount < state.walletsCount,
//   wrongNetwork: state.networkID != undefined && (state.networkID != VALID_NETWORK_ID && state.networkID != LOCAL_NETWORK_ID),
//   owner: state.owner,
//   ownerBalance: state.ownerBalance,
// });

// const mapDispatchToProps = dispatch => ({
//   onPlusClick: () => dispatch(newWallet())
// });

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(WalletsList);
