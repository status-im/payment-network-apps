import React from 'react';
import Typography from '@material-ui/core/Typography';

const styles = {
  container: {
    position: 'relative',
    height: 200,
    // backgroundImage: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
    backgroundImage: 'linear-gradient(120deg, #fa709a 0%, #fee140 100%)',
    border: 0,
    color: '#FFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
};

const TopPanel = ({ wallets }) => {
  const totalWei = wallets.filter((wallet) => wallet).reduce((acc, w) => {
    return acc.add(new web3.utils.BN(w.value))
  }, new web3.utils.BN(0));

  let unit  = "wei",
    label = "wei",
    total = totalWei;

  const totalEth = web3.utils.fromWei(total);

  return (
    <div style={styles.container}>
      <div>
        <Typography variant="h2" color="inherit">
          {totalEth} Ξ
        </Typography>
      </div>
    </div>
  );
}

export default TopPanel;
