import React from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { Props } from '../containers/TopPanel';

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
  }
}));

const TopPanel = (props: Props) => {
  const classes = useStyles();

  return <div className={classes.container}>
    <div>
      <Typography variant="h2" color="inherit">
        {props.roundedBalance} Ξ
      </Typography>
      <Typography variant="body1" color="inherit" style={{textAlign: "center"}}>
        {props.balance}
      </Typography>
    </div>
  </div>
}

export default TopPanel;
