import { connect } from 'react-redux';
import App from '../components/App';
import { RootState } from '../reducers';
import { Dispatch } from 'redux';

export interface StateProps {
  web3Initialized: boolean
  web3Error: string | undefined
  walletAddress: string | undefined
  networkID: number | undefined
  walletError: string | undefined
}

export interface DispatchProps {
}

export type Props = StateProps & DispatchProps;

const mapStateToProps = (state: RootState): StateProps => ({
  web3Initialized: state.web3.initialized,
  web3Error: state.web3.error,
  networkID: state.web3.networkID,
  walletAddress: state.wallet.walletAddress,
  walletError: state.wallet.error,
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
