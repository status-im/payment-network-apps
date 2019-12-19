import { connect } from 'react-redux';
import { RootState } from '../reducers';
import { Dispatch } from 'redux';
import TransactionsList from '../components/TransactionsList';
import { TransactionState } from '../reducers/transactions';
import {
  VALID_NETWORK_ID,
  LOCAL_NETWORK_ID,
} from '../actions/web3';

export interface StateProps {
  loading: boolean
  transactions: TransactionState[]
  networkID: number | undefined
  wrongNetwork: boolean
}

export interface DispatchProps {
}

export type Props = StateProps & DispatchProps;

const newProps = (): Props => {
  return {
    loading: false,
    transactions: [],
    networkID: undefined,
    wrongNetwork: false,
  }
}

const mapStateToProps = (state: RootState): StateProps => {
  const props = newProps();
  props.loading = state.transactions.loading;
  props.networkID = state.web3.networkID;

  const transactions: TransactionState[] = [];
  if (!props.loading) {
    for (const txHash in state.transactions.transactions) {
      transactions.unshift(state.transactions.transactions[txHash]);
    }
  }

  return {
    ...props,
    transactions: transactions,
    wrongNetwork: props.networkID !== undefined && (props.networkID !== VALID_NETWORK_ID && props.networkID !== LOCAL_NETWORK_ID),
  }
};

const mapDispatchToProps = (dispatch: Dispatch) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionsList);
