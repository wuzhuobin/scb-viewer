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
        this.state = {
            page: 0,
        };
    }

    handleChangePage = (event, value)=>{
    	console.log(event)
    	console.log(value)
    	this.setState({page: value});
    	console.log(this.state.page)
  	}

    render(){
        const {onDrawerClose, open, classes} = this.props
        const {page} = this.state

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
              <ListItem button onClick={() => {this.setState({page: 0});}}>
                <ListItemIcon>
                  <Collections />
                </ListItemIcon>
                <ListItemText primary="Images" />
              </ListItem>
              <ListItem button onClick={() => {this.setState({page: 1});}}>
                <ListItemIcon>
                  <Portrait />
                </ListItemIcon>
                <ListItemText primary="Projects" />
              </ListItem>
            </List>
            <Divider />
            <List>
                <ListItem button onClick={() => {this.setState({page: 2});}}>
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

        // <body className={classes.content}>
        // 	{page === 0 && <Images />}
        // 	{page === 1 && <div>Projects</div>}
        // 	{page === 2 && <DicomViewer />}
        // </body>