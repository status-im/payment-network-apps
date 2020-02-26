import React from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { Props } from '../containers/TopPanel';
import { config } from '../global';

const useStyles = makeStyles(theme => ({
  container: {
    position: 'relative',
    height: 200,
    // backgroundImage: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
    backgroundImage: 'linear-gradient(120deg, #fa709a 0%, #fee140 100%)',
    border: "none",
    boxShadow: "rgba(0, 0, 0, 0.8) 0 0 8px 0",
    color: '#FFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    textAlign: "center",
    paddingTop: 20,
  },
  button: {
    color: "#fff",
    borderColor: "#fff",
    "&:hover": {
      borderColor: "#fff",
    }
  },
}));

const roundEther = (wei: string | undefined) => {
  const fullTotal = wei ? config.web3!.utils.fromWei(wei) : "0";
  const parts = fullTotal.split(".");
  let roundedBalance = parts[0];
  const decimals = (parts[1] || "").slice(0, 4)
  if (decimals.length > 0) {
    roundedBalance = `${roundedBalance}.${decimals}`;
  }

  return [fullTotal, roundedBalance];
}


const TopPanel = (props: Props) => {
  const classes = useStyles();

  const [balance, roundedBalance] = roundEther(props.balance);
  const [availableBalance, roundedAvailableBalance] = roundEther(props.availableBalance);

  return <div className={classes.container}>
    <div>
      <Typography variant="h2" color="inherit">
        {roundedAvailableBalance} Ξ
      </Typography>
      <Typography variant="body1" color="inherit" style={{textAlign: "center"}}>
        {availableBalance}
      </Typography>
      <div className={classes.actions}>
        <Button
          className={classes.button}
          variant="outlined"
          color="primary"
          onClick={props.handleReceive}>Receive</Button>
      </div>
    </div>
  </div>
}

export default TopPanel;
