import React from 'react'
import {List, ListItem, ListItemIcon, ListItemText, Drawer, Divider, IconButton, Typography, ListSubheader} from '@material-ui/core'
import {withStyles} from '@material-ui/core/styles'
import {Collections, Portrait, Visibility, ChevronLeft, ThreeDRotation, Assignment} from '@material-ui/icons'

const drawerWidth =240;

const styles = theme=> ({
  root: {
        overflow: 'hidden',
        width: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    backgroundColor: theme.palette.secondary.main,
  },
  drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },
   button:{
   		color: theme.palette.primary.contrastText,
   		'&:hover': {
      		backgroundColor: theme.palette.secondary.light,
    },
   },
   divider:{
   		backgroundColor: theme.palette.secondary.light,
    },
  listSubHeader:{
    color: 'white',
  }
})
class DrawerMenu extends React.Component {

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
              <IconButton onClick={onDrawerClose} className={classes.button}>
                <ChevronLeft /> 
              </IconButton>
            </div>
            <Divider className={classes.divider} />
            <List>
              <ListSubheader className={classes.listSubHeader}>Database</ListSubheader>
              <ListItem button onClick={() => {onChangePage(0)}} className={classes.button}>
                <ListItemIcon className={classes.button}>
                  <Collections />
                </ListItemIcon>
                <ListItemText primary={<Typography variant="body1" style={{ color: 'white' }}>PACS</Typography>} />
              </ListItem>
            </List>
            <Divider className={classes.divider} />
            <List>
                <ListSubheader className={classes.listSubHeader}>Image Viewers</ListSubheader>
                <ListItem button onClick={() => {onChangePage(2);}} className={classes.button}>
                <ListItemIcon>
                  <Visibility className={classes.button} />
                </ListItemIcon>
                <ListItemText primary={<Typography variant="body1" style={{ color: 'white' }}>Planar Viewer</Typography>} />
                </ListItem>
                <ListItem button onClick={() => {onChangePage(3);}} className={classes.button}>
                <ListItemIcon>
                  <ThreeDRotation className={classes.button} />
                </ListItemIcon>
                <ListItemText primary={<Typography variant="body1" style={{ color: 'white' }}>MPR Viewer</Typography>} />
                </ListItem>
            </List>
            <Divider className={classes.divider} />
            <List>
              <ListSubheader className={classes.listSubHeader}>Extension Modules</ListSubheader>
              <ListItem button onClick={() => {onChangePage(4);}} className={classes.button}>
                <ListItemIcon>
                  <Assignment className={classes.button} />
                </ListItemIcon>
                <ListItemText primary={<Typography variant="h6" style={{ color: 'white' }}>Implant Planner</Typography>} />
                </ListItem>
            </List>
          </Drawer>
        	);
        </div>
    );
}
}
export default withStyles(styles)(DrawerMenu);