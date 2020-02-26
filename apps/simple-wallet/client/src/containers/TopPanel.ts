import { connect } from 'react-redux';
import { RootState } from '../reducers';
import { MouseEvent } from 'react';
import { Dispatch } from 'redux';
import TopPanel from '../components/TopPanel';
import { showWalletQRCode } from '../actions/wallet';

export interface StateProps {
  balance: string | undefined
  availableBalance: string | undefined
}

export interface DispatchProps {
  handleReceive: (e: MouseEvent) => any
}

export type Props = StateProps & DispatchProps;

const mapStateToProps = (state: RootState): StateProps => {
  return {
    balance: state.wallet.balance,
    availableBalance: state.wallet.availableBalance,
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  handleReceive: (e: MouseEvent) => {
    e.preventDefault();
    dispatch(showWalletQRCode());
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TopPanel);
