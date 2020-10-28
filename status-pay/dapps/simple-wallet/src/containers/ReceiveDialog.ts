import { connect } from 'react-redux';
import { RootState } from '../reducers';
import { MouseEvent } from 'react';
import { Dispatch } from 'redux';
import ReceiveDialog from '../components/ReceiveDialog';
import { hideWalletQRCode } from '../actions/wallet';

export interface StateProps {
  open: boolean
  tokenSymbol: string | undefined
  tokenAddress: string | undefined
  address: string | undefined
  networkID: number | undefined
}

export interface DispatchProps {
  handleClose: (e: MouseEvent) => any
}

export type Props = StateProps & DispatchProps;

const mapStateToProps = (state: RootState): StateProps => {
  return {
    open: state.wallet.showWalletQRCode,
    tokenSymbol: state.wallet.erc20Symbol,
    tokenAddress: state.wallet.erc20Address,
    address: state.wallet.walletAddress,
    networkID: state.web3.networkID,
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  handleClose: (e: MouseEvent) => {
    e.preventDefault();
    dispatch(hideWalletQRCode());
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReceiveDialog);
