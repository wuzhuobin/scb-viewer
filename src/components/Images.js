import React from "react";
import Hammer from "hammerjs";

import {Button, Checkbox, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography} from '@material-ui/core';


import { withStyles } from '@material-ui/core/styles';

const drawerWidth = 240;

const styles = theme => ({
  root: {
    flexGrow: 1,
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
  },
  drawerPaper: {
    position: 'relative',
    height: '93vh',
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    minWidth: 0, // So the Typography noWrap works
  },
  toolbar: theme.mixins.toolbar,
});


class Images extends React.Component {
  constructor(props){
    super(props);
    this.state={

    }
  }

  render() {
    const {username, password} = this.state
    const {classes} = this.props

    return (
      <div className={classes.root}>
        

        
      </div>
    );
  }
}

export default withStyles(styles)(Images);