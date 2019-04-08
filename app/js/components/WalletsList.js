import React from 'react';

import { newWallet } from '../actions';

import WalletsListItem from './WalletsListItem';
import TopPanel from './TopPanel';
import List from '@material-ui/core/List';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Typography from '@material-ui/core/Typography';

const styles = {
  addButton: {
    position: 'fixed',
    zIndex: 1,
    bottom: 30,
    right: 30,
    bottom: 30,
  },
  loading: {
    background: "#1a1a1a",
    color: "#fff",
    textAlign: "center",
    padding: "2"
  },
  empty: {
    padding: 10,
    textAlign: "center",
  },
  wrongNetwork: {
    padding: 10,
    textAlign: "center",
    background: "red",
    color: "#fff",
    fontWeight: "bold",
  }
};

const VALID_NETWORK_NAME = "Ropsten";

const WalletsList = ({ networkID, countingWallets, wrongNetwork, loading, walletsCount, loadedWalletsCount, wallets, onPlusClick }) => {
  return (<React.Fragment>
    <TopPanel wallets={wallets} />

    {loading && <div style={styles.loading}>
      <Typography variant="caption" color="inherit">
        loading {loadedWalletsCount + 1} of {walletsCount} wallets...
      </Typography>
    </div>}

    {!wrongNetwork && countingWallets && <div style={styles.loading}>
      <Typography variant="caption" color="inherit">
        counting wallets...
      </Typography>
    </div>}

    {wrongNetwork && <div style={styles.wrongNetwork}>
      Wrong network. Please connect to {VALID_NETWORK_NAME}.
    </div>}

    {!wrongNetwork && !countingWallets && walletsCount == 0 && <div style={styles.empty}>
      <Typography variant="caption" color="inherit">
        You don't have wallets yet. Create a new one!
      </Typography>
    </div>}

    <List>
      {wallets.map((wallet) => (
        wallet && <WalletsListItem key={wallet.address} wallet={wallet} />
      ))}
    </List>

    {!wrongNetwork && <Fab color="secondary"
      aria-label="Add"
      style={styles.addButton}
      onClick={ () => onPlusClick() }>
      <AddIcon />
    </Fab>}
  </React.Fragment>
  )
};

export default WalletsList;

// export default class WalletsList extends React.Component {
//   constructor(props) {
//     super(props);
//     this.addButtonHandler = this.addButtonHandler.bind(this);
//   }

//   async addButtonHandler(event) {
//     event.preventDefault();
//     const names = ["💳", "👛", "💸"]
//     const index = Math.floor(Math.random() * Math.floor(names.length));
//     const codePoint = names[index].codePointAt(0);
//     const name = "0x" + codePoint.toString(16);
//     console.log(name)
//     const create = KeycardTapWalletFactory.methods.create(name);
//     const estimatedGas = await create.estimateGas();
//     const receipt = await create.send({
//       from: this.props.owner,
//       gas: estimatedGas,
//     });
//     console.log(receipt)
//   }

//   render() {
//     return (
//       <React.Fragment>
//         <TopPanel wallets={this.props.wallets}/>
//         <List>
//           {this.props.wallets.map((wallet) => (
//             <WalletsListItem key={wallet.address} wallet={wallet} />
//           ))}
//         </List>

//         <Fab color="secondary" aria-label="Add" style={styles.addButton} onClick={this.addButtonHandler}>
//           <AddIcon />
//         </Fab>
//       </React.Fragment>
//     );
//   }
// }
