import { connect } from 'react-redux';
import { RootState } from '../reducers';
import { Dispatch } from 'redux';
import TransactionsList from '../components/TransactionsList';
import { TransactionState } from '../reducers/transactions';

export interface StateProps {
  loading: boolean
  transactions: TransactionState[]
}

export interface DispatchProps {
}

export type Props = StateProps & DispatchProps;

const newProps = (): Props => {
  return {
    loading: false,
    transactions: [],
  }
}

const mapStateToProps = (state: RootState): StateProps => {
  const props = newProps();

  const transactions: TransactionState[] = [];
  if (!props.loading) {
    for (const txHash in state.transactions.transactions) {
      transactions.unshift(state.transactions.transactions[txHash]);
    }
  }

  return {
    ...props,
    loading: state.transactions.loadingRequests > 0,
    transactions: transactions,
  }
};

const mapDispatchToProps = (dispatch: Dispatch) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionsList);
