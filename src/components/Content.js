import React from 'react'
import {List, ListItem, ListItemIcon, ListItemText, Drawer, Divider, Button} from '@material-ui/core'
import {withStyles} from '@material-ui/core/styles'
import Images from './Images';
import DicomViewer from "../dicom-viewer";
import {Collections, Portrait, Visibility} from '@material-ui/icons'

const drawerWidth = 240;

const styles = theme=> ({
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
})

class Content extends React.Component {
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
        const {classes, onTab} = this.props
        const {page} = this.state

        return(
        <div className={classes.root}>
        <Drawer
          variant="permanent"
          classes={{
            paper: classes.drawerPaper,
          }}
        >
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

        <main className={classes.content}>
        	{page === 0 && <Images />}
        	{page === 1 && <div>Projects</div>}
        	{page === 2 && <DicomViewer />}
        </main>

        </div>
    );
}
}
export default withStyles(styles)(Content);