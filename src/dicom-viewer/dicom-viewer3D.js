import React from "react";
import classNames from 'classnames';
import {withStyles} from '@material-ui/core/styles'
import {AppBar,Toolbar, Button, Grid, Snackbar}  from '@material-ui/core';
import SeriesPreviewVertical from '../components/SeriesPreviewVertical'
import {NavigationOutlined} from '@material-ui/icons';
import MprViewer from './MprViewer'
import ThreeDViewer from './threeDViewer'
import SearchIcon from '@material-ui/icons/Search';
import Brightness6Icon from '@material-ui/icons/Brightness6Outlined';
import axios from 'axios';
import Cursor3D from "./cursor3D";

const styles = theme=> ({
    root:{    
        width: 'calc(100vw)',
        height: 'calc(100vh - 64px)',
    },
    appBar:{
      flexGrow: 1,    
      zIndex: 1,
      overflow: 'auto',
      position: 'relative',
      height: '64px',
      justifyContent: 'center',
      background: theme.palette.secondary.main,
    },
    drawerOpen:{
        width: 'calc(100vw - 240px)',
        height: 'calc(100vh - 64px)',
    },
    label: {
    // Aligns the content of the button vertically.
      flexDirection: 'column',
      textTransform: 'none',
      // fontSize: '3px',
      color: theme.palette.primary.contrastText,
      '&:hover': {
          color: theme.palette.secondary.contrastText,
          },
    },
    gridRoot: {
      width: 'calc(100vw - 170px)',
      height: 'calc(100vh - 64px - 64px)',
      borderColor: theme.palette.primary.main,
      borderStyle: "solid",
      borderWidth: 1,
    },
    drawerOpenGrid:{
      width: 'calc(100vw - 240px - 170px)',
    },
    loadingProgressSnackbar:{

    },
})

class DicomViewer3D extends React.Component {
  constructor(props)
  {
    super(props);
    this.state = {
      selectedSeries: null,
      loadingProgress: 100,
      loadingMessage: "Loading...",
      loadingPromise: null,
      serverStatus: "",
      serverStatusOpen: false,
      displaySEries: null,
      cursor3D: new Cursor3D(),
      ijkPos: [0,0,0],
   	};
  }

  componentWillReceiveProps(nextProps){
    if (nextProps.socket){
      nextProps.socket.on('disconnect', ()=>{
      this.setState({
        serverStatus: "MPR Server Disconnected", 
        serverStatusOpen:true})
    })
    }
  }

  onSelectSeries = (event, series)=>{
    // console.log("select series: " + series)

    // check server status
    if (this.props.socket === null || this.props.socket.disconnected){
      this.setState({
        serverStatus: "MPR Server Disconnected", 
        serverStatusOpen:true})
      // console.log("server disconnected")
      return;
    }

    // console.log("socket client id: " + this.props.socket.id)

    // check if mutiple clicking same series
    // if (series !== this.state.selectedSeries){
    //   console.log("selecting same series")
    // } else{
      this.setState({selectedSeries: series})
      this.setState({loadingProgress: 0})
      this.setState({loadingMessage: "Loading"})
      var loadingPromise = axios({
          method: 'post',
          url: 'http://192.168.1.112:8080/api/loadDicom',
          // timeout: 1 * 1000,
          data: {
            series: series,
            id: this.props.socket.id
          },
          headers:  {'Access-Control-Allow-Origin': '*'},
      })

      loadingPromise.then((res)=>{
          if (series === this.state.selectedSeries){
            // get image header
            axios({
              method: 'get',
              url: 'http://192.168.1.112:8080/api/getImageHeader',
              params:{
                id: this.props.socket.id,
                series: series,
              },
              headers:  {'Access-Control-Allow-Origin': '*'},
            }).then(res=>{
              this.state.cursor3D.setSize(res.data.Size[0],res.data.Size[1],res.data.Size[2])
              this.state.cursor3D.setIjkPosition(res.data.Size[0]/2,res.data.Size[1]/2, res.data.Size[2]/2)

              console.log(this.state.cursor3D.getIjkPosition())
              this.setState({ijkPos: this.state.cursor3D.getIjkPosition()})
              this.setState({loadingProgress: 100})
              this.setState({serverStatus: "MPR Loading Success", serverStatusOpen:true})
              this.setState({displaySeries: series})
            })
          }
          
          // console.log(series)
          // console.log("server side load complete: " + this.state.selectedSeries)
      }).catch((err)=>{
        // server side error
        if (err.response.status === 500){
          // console.log("error 500")
          // console.log(err.response)
          // console.log(err.response.data)

          if (err.response.data === "No Key Found"){
            this.setState({loadingProgress: 0})
            // this.setState({loadingProgress: 100})
            // this.setState({serverStatus: "No Key Found", serverStatusOpen:true})
          }
          else{
            this.setState({loadingProgress: 100})
            this.setState({serverStatus: "MPR Server Error", serverStatusOpen:true})
          }
        }
        if (err.code === "ECONNABORTED"){
          this.setState({loadingMessage: "Server connection timeout!"})
          this.setState({loadingProgress: 100})
        }
      })
  }

  handleServerStatusClose = () =>{
    this.setState({serverStatusOpen: false})
  }

  onCursorChange = () =>{
    // console.log("cursor change")
    // console.log(this.state.cursor3D.getIjkPosition())
    this.setState({ijkPos: this.state.cursor3D.getIjkPosition()})
  }

    render() {
      const {drawerOpen, series, classes} = this.props
      const {cursor3D, ijkPos} = this.state

    	return(
        <div className={classNames(classes.root, {[classes.drawerOpen]: this.props.drawerOpen,})}>
            <AppBar className={classes.appBar}>
              <Toolbar>
                <Button classes={{label: classes.label}} color="inherit" >
                  <NavigationOutlined />
                  Navigate
                </Button>
                <Button classes={{label: classes.label}} value="2" color="inherit" size="small" onClick={() => {}}>
                  <Brightness6Icon />
                  Levels
                </Button>
                <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {}}>
                  <SearchIcon />
                  Zoom
                </Button>
              </Toolbar>
          </AppBar>

          <SeriesPreviewVertical series={series} selectedSeries={this.state.selectedSeries} onSelectSeries={this.onSelectSeries}/>
            <Grid container className={classNames(classes.gridRoot, {[classes.drawerOpenGrid]: this.props.drawerOpen,})}>
              <Grid container spacing={0}>
                <Grid item xs={6}>
                  <MprViewer 
                    orientation={"Axial"} 
                    series={this.state.displaySeries} 
                    socket={this.props.socket} 
                    drawerOpen={drawerOpen}
                    cursor3D={cursor3D}
                    onCursorChange={this.onCursorChange}
                    ijkPos={ijkPos}/>
                </Grid>
                <Grid item xs={6}>
                  <MprViewer 
                    orientation={"Sagittal"} 
                    series={this.state.displaySeries} 
                    socket={this.props.socket} 
                    drawerOpen={drawerOpen}
                    cursor3D={cursor3D}
                    onCursorChange={this.onCursorChange}
                    ijkPos={ijkPos}/>
                </Grid>
                <Grid item xs={6}>
                  <ThreeDViewer drawerOpen={drawerOpen}/>
                </Grid>
                <Grid item xs={6}>
                  <MprViewer 
                    orientation={"Coronal"} 
                    series={this.state.displaySeries} 
                    socket={this.props.socket} 
                    drawerOpen={drawerOpen}
                    cursor3D={cursor3D}
                    onCursorChange={this.onCursorChange}
                    ijkPos={ijkPos}/>
                </Grid>
              </Grid>
            </Grid>

            <Snackbar
              anchorOrigin={{vertical:'bottom',horizontal:'right'}}
              open={this.state.loadingProgress < 100}
              // open={true}
              ContentProps={{
                'aria-describedby': 'message-id',
                className: classes.loadingProgressSnackbar
              }}
              message={<span id="message-id">
                MPR Loading... 
                </span>}
            />

            <Snackbar
              anchorOrigin={{vertical:'bottom',horizontal:'right'}}
              open={this.state.serverStatusOpen}
              // open={true}
              autoHideDuration={2000}
              onClose={this.handleServerStatusClose}
              ContentProps={{
                'aria-describedby': 'message-id',
                className: classes.loadingProgressSnackbar
              }}
              message={<span id="message-id">
                {this.state.serverStatus}
                </span>}
            />
        </div>
        );
    };
}

export default withStyles(styles)(DicomViewer3D);