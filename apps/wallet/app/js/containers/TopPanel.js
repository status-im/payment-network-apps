import { connect } from 'react-redux';
import TopPanel from '../components/TopPanel';

const mapStateToProps = state => {
  const totalWei = state.wallets.filter((wallet) => wallet).reduce((acc, w) => {
    return acc.add(new web3.utils.BN(w.availableBalance))
  }, new web3.utils.BN(0));

  const fullTotal = web3.utils.fromWei(totalWei);
  const parts = fullTotal.split(".");
  let total = parts[0];
  let decimals = (parts[1] || "").slice(0, 4)
  if (decimals.length > 0) {
    total = `${total}.${decimals}`;
  }

  return {
    total: total,
    fullTotal: fullTotal,
  }
}

const mapDispatchToProps = dispatch => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TopPanel);
