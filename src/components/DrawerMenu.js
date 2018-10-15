import React from 'react'
import {List, ListItem, ListItemIcon, ListItemText, Drawer, Divider, IconButton} from '@material-ui/core'
import {withStyles} from '@material-ui/core/styles'
import {Collections, Portrait, Visibility, ChevronLeft} from '@material-ui/icons'

const drawerWidth =240;

const styles = theme=> ({
  root: {
        overflow: 'hidden',
        width: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },
})
class DrawerMenu extends React.Component {
    constructor(props){
        super(props);
    }

    render(){
        const {onDrawerClose, onChangePage, open, classes} = this.props

        return(
        <div className={classes.root}>
        	<Drawer
            variant="persistent"
            anchor='left'
            open={open}
            classes={{
              paper: classes.drawerPaper,
            }}
          >
            <div className={classes.drawerHeader}>
              <IconButton onClick={onDrawerClose}>
                <ChevronLeft /> 
              </IconButton>
            </div>
            <Divider />
            <List>
              <ListItem button onClick={() => {onChangePage(0)}}>
                <ListItemIcon>
                  <Collections />
                </ListItemIcon>
                <ListItemText primary="Images" />
              </ListItem>
              <ListItem button onClick={() => {onChangePage(1);}}>
                <ListItemIcon>
                  <Portrait />
                </ListItemIcon>
                <ListItemText primary="Projects" />
              </ListItem>
            </List>
            <Divider />
            <List>
                <ListItem button onClick={() => {onChangePage(2);}}>
                <ListItemIcon>
                  <Visibility />
                </ListItemIcon>
                <ListItemText primary="2D Viewer" />
                </ListItem>
            </List>
          </Drawer>
        	);
        </div>
    );
}
}
export default withStyles(styles)(DrawerMenu);