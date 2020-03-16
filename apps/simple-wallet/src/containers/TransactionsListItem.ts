import { connect } from 'react-redux';
import { RootState } from '../reducers';
import { Dispatch } from 'redux';
import TransactionsListItem from '../components/TransactionsListItem';
import { TransactionState } from '../reducers/transactions';
import { BlocksState } from '../reducers/blocks';

interface Transactions {
  [txHash: string]: TransactionState
}

export interface StateProps {
  id: string
  key: string,
  transactions: Transactions
  blocks: BlocksState
}

export interface OwnProps {
  id: string,
  key: string,
}

export interface DispatchProps {}

export type Props = StateProps & DispatchProps;

const mapStateToProps = (state: RootState, ownProps: OwnProps): StateProps => {
  return {
    id: ownProps.id,
    key: ownProps.key,
    transactions: state.transactions.transactions,
    blocks: state.blocks,
  }
};

const mapDispatchToProps = (dispatch: Dispatch) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionsListItem);
