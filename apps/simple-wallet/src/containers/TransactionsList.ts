import { connect } from 'react-redux';
import { RootState } from '../reducers';
import { Dispatch } from 'redux';
import TransactionsList from '../components/TransactionsList';
import { TransactionState } from '../reducers/transactions';

const VALID_NETWORK_ID = 3;
const LOCAL_NETWORK_ID = 1337;

export interface StateProps {
  transactions: TransactionState[]
  networkID: number | undefined
  wrongNetwork: boolean
}

export interface DispatchProps {
}

export type Props = StateProps & DispatchProps;

const mapStateToProps = (state: RootState): StateProps => {
  const networkID = state.web3.networkID;

  const transactions: TransactionState[] = [];
  for (const txHash in state.transactions) {
    transactions.unshift(state.transactions[txHash]);
  }

  return {
    transactions: transactions,
    networkID: state.web3.networkID,
    wrongNetwork: networkID !== undefined && (networkID != VALID_NETWORK_ID && networkID != LOCAL_NETWORK_ID),
  }
};

const mapDispatchToProps = (dispatch: Dispatch) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionsList);
