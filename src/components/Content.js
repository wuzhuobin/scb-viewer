import React from 'react'
import {List, ListItem, ListItemIcon, ListItemText, Drawer, Divider} from '@material-ui/core'
import {withStyles} from '@material-ui/core/styles'
import Images from './Images';
import DicomViewer from "../dicom-viewer";
import DicomViewer3D from "../dicom-viewer/dicom-viewer3D";
import {Collections, Portrait, Visibility} from '@material-ui/icons'
import classNames from 'classnames';
import DrawerMenu from "./DrawerMenu";
import Projects from './Projects';
import socketIOClient from "socket.io-client";

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
    height: 'calc(100vh - 64px)',
    width: '100%',
    backgroundColor: theme.palette.background.default,
    transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
  },
  contentShift: {
      marginLeft: drawerWidth,
      width: 'calc(100vw - 240px)',
      transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
  })}
})

class Content extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            page: 3,
            series: null,
            sessionId: null,
        };
    }

    handleChangePage = (value)=>{
    	this.setState({page: value});
  	}

    onSelectSeries = (event, series, viewer)=>{
      this.setState({series: series})
      if (viewer === "planar"){
        this.setState({page: 2})
      }
      else if (viewer === "mpr"){
        this.setState({page: 3})
      }
    }

    componentDidMount(){
      // websocket to mpr backend
      var endPoint = "http://192.168.1.112:8080"
      const socket = socketIOClient(endPoint)
      socket.on('connect', ()=>{
        this.setState({sessionId: socket.id});
      }
      ) 
    }
 
    render(){
        const {series, open, onDrawerClose, classes} = this.props
        const {page} = this.state

        return(
        <div className={classes.root}>

          <DrawerMenu open={open} onDrawerClose={onDrawerClose} onChangePage={this.handleChangePage}/>
          <main 
              className={classNames(classes.content,{
                  [classes.contentShift]: open,
                })}
            >
              {page === 0 && <Images onSelectSeries={this.onSelectSeries}/>}
              {page === 1 && <Projects />}         
              {page === 2 && <DicomViewer series={this.state.series} drawerOpen={this.props.open}/>}
              {page === 3 && <DicomViewer3D series={this.state.series} drawerOpen={this.props.open}/>} 
          </main>
        </div>
    );
}
}
export default withStyles(styles)(Content);