import React from 'react'
import {List, ListItem, ListItemIcon, ListItemText, Drawer, Divider} from '@material-ui/core'
import {withStyles} from '@material-ui/core/styles'
import Images from './Images';
import DicomViewer from "../dicom-viewer";
import {Collections, Portrait, Visibility} from '@material-ui/icons'
import classNames from 'classnames';

const drawerWidth = 240;

const styles = theme=> ({
    root: {
    flexGrow: 1,
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    height: '93vh',
  },
  drawerPaper: {
    position: 'relative',
    height: '100%',
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    minWidth: 0, // So the Typography noWrap works
  },
  toolbar: theme.mixins.toolbar,
})

class Content extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            page: 2,
        };
    }

    handleChangePage = (event, value)=>{
    	console.log(event)
    	console.log(value)
    	this.setState({page: value});
    	console.log(this.state.page)
  	}

    render(){
        const {classes} = this.props
        const {page} = this.state

        return(
        <div className={classes.root}>
        <Drawer
          variant="persistent"
          classes={{
            paper: classes.drawerPaper,
          }}
          containerStyle={{height: 'calc(100% - 64px)', top: 64}}
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

        <body className={classes.content}>
        	{page === 0 && <Images />}
        	{page === 1 && <div>Projects</div>}
        	{page === 2 && <DicomViewer />}
        </body>
        </div>
    );
}
}
export default withStyles(styles)(Content);