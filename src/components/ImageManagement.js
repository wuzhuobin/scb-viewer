import React from "react";
import Hammer from "hammerjs";

import {Button, Checkbox, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography} from '@material-ui/core';
import {Collections, Portrait} from '@material-ui/icons'

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


class ImageManagement extends React.Component {
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
        <Drawer
          variant="permanent"
          classes={{
            paper: classes.drawerPaper,
          }}
        >
           <List>
              <ListItem button>
                <ListItemIcon>
                  <Collections />
                </ListItemIcon>
                <ListItemText primary="Image" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <Portrait />
                </ListItemIcon>
                <ListItemText primary="Projects" />
              </ListItem>
            </List>
        </Drawer>

        <main className={classes.content}>
          <Button>hello </Button>
        </main>
      </div>
    );
  }
}

export default withStyles(styles)(ImageManagement);