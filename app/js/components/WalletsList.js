import React from 'react';

import { newWallet } from '../actions';

import WalletsListItem from './WalletsListItem';
import TopPanel from './TopPanel';
import List from '@material-ui/core/List';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';

const styles = {
  addButton: {
    position: 'fixed',
    zIndex: 1,
    bottom: 30,
    right: 30,
    bottom: 30,
  }
};


const WalletsList = ({ wallets, onPlusClick }) => {
  return (<React.Fragment>
    <TopPanel wallets={wallets} />
    <List>
      {wallets.map((wallet) => (
        wallet && <WalletsListItem key={wallet.address} wallet={wallet} />
      ))}
    </List>

    <Fab color="secondary"
      aria-label="Add"
      style={styles.addButton}
      onClick={ () => onPlusClick() }>
      <AddIcon />
    </Fab>
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
