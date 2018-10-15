import React from 'react'
import {List, ListItem, ListItemIcon, ListItemText, Drawer, Divider} from '@material-ui/core'
import {withStyles} from '@material-ui/core/styles'
import Images from './Images';
import DicomViewer from "../dicom-viewer";
import {Collections, Portrait, Visibility} from '@material-ui/icons'
import classNames from 'classnames';
import DrawerMenu from "./DrawerMenu";

const drawerWidth = 240;

const styles = theme=> ({
  root: {
    display: 'flex',
  },
  drawerPaper: {
    position: 'relative',
    width: drawerWidth,
    height: 'calc(100% - 64px)',
  },
  content: {
    position: 'relative',
    height: 'calc(100vh-64px)',
    width: '100%',
    backgroundColor: theme.palette.background.default,
    transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
  },
  contentShift: {
      marginLeft: drawerWidth,
      transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
  })}
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
        const {open, onDrawerClose, classes} = this.props
        const {page} = this.state

        return(
        <div className={classes.root}>

          <DrawerMenu open={open} onDrawerClose={onDrawerClose} />
          <main 
              className={classNames(classes.content,{
                  [classes.contentShift]: open,
                })}
            >
              {page === 0 && <Images />}
              {page === 1 && <div>Projects</div>}
              {page === 2 && <DicomViewer />}
          </main>
        </div>
    );
}
}
export default withStyles(styles)(Content);

        // <body className={classes.content}>
        //   
        // </body>

          