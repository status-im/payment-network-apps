import { connect } from 'react-redux';
import SelectedWalletDialog from '../components/SelectedWalletDialog';
import {
  closeSelectedWallet,
  topUpWallet,
} from '../actions';


const mapStateToProps = state => {
  const props = {
    open: state.selectedWallet.open,
  }

  const index = state.selectedWallet.index;
  if (index == null || index == undefined) {
    return props;
  }

  const wallet = state.wallets[index];

  return {
    ...props,
    icon: wallet.icon,
    address: wallet.address,
    nonce: wallet.nonce,
    keycardAddress: wallet.keycardAddress,
    balance: wallet.balance,
    index: wallet.index,
    toppingUp: wallet.toppingUp,
    maxTxValue: wallet.maxTxValue,
  }
}

const mapDispatchToProps = dispatch => ({
  onCloseClick: () => dispatch(closeSelectedWallet()),
  onTopUp: (index, address) => dispatch(topUpWallet(index, address)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SelectedWalletDialog);
