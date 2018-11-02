import React from 'react'
import {List, ListItem, ListItemIcon, ListItemText, Drawer, Divider, IconButton, Typography} from '@material-ui/core'
import {withStyles} from '@material-ui/core/styles'
import {Collections, Portrait, Visibility, ChevronLeft, ThreeDRotation} from '@material-ui/icons'

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
              <IconButton onClick={onDrawerClose} className={classes.button}>
                <ChevronLeft /> 
              </IconButton>
            </div>
            <Divider className={classes.divider} />
            <List>
              <ListItem button onClick={() => {onChangePage(0)}} className={classes.button}>
                <ListItemIcon className={classes.button}>
                  <Collections />
                </ListItemIcon>
                <ListItemText primary={<Typography variant="h6" style={{ color: 'white' }}>Images</Typography>} />
              </ListItem>
            </List>
            <Divider className={classes.divider} />
            <List>
                <ListItem button onClick={() => {onChangePage(2);}} className={classes.button}>
                <ListItemIcon>
                  <Visibility className={classes.button} />
                </ListItemIcon>
                <ListItemText primary={<Typography variant="h6" style={{ color: 'white' }}>2D Viewer</Typography>} />
                </ListItem>
                <ListItem button onClick={() => {onChangePage(3);}} className={classes.button}>
            </List>
          </Drawer>
        	);
        </div>
    );
}
}
export default withStyles(styles)(DrawerMenu);