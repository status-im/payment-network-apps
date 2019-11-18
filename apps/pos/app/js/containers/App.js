import { connect } from 'react-redux';
import App from '../components/App';

const mapStateToProps = state => ({
  loadingWeb3: state.loadingWeb3,
  loadingOwner: state.loadingOwner,
  networkID: state.networkID,
});

const mapDispatchToProps = dispatch => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
