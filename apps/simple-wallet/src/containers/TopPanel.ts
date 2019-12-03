import { connect } from 'react-redux';
import { RootState } from '../reducers';
import { Dispatch } from 'redux';
import TopPanel from '../components/TopPanel';

export interface StateProps {
  balance: string
  roundedBalance: string
}

export interface DispatchProps {
}

export type Props = StateProps & DispatchProps;

const mapStateToProps = (state: RootState): StateProps => {
  const web3 = (window as any).web3;
  const fullTotal = state.wallet.balance ? web3.utils.fromWei(state.wallet.balance) : "0";
  const parts = fullTotal.split(".");
  let roundedBalance = parts[0];
  let decimals = (parts[1] || "").slice(0, 4)
  if (decimals.length > 0) {
    roundedBalance = `${roundedBalance}.${decimals}`;
  }

  return {
    balance: fullTotal,
    roundedBalance: roundedBalance,
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TopPanel);
