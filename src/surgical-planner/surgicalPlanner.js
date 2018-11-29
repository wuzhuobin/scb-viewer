import React from "react";
import classNames from 'classnames';
import {withStyles} from '@material-ui/core/styles'
import {AppBar,Toolbar, Button, Grid, Snackbar, Popover, List, ListItem, ListItemText, 
  ListItemIcon, Typography, Divider}  from '@material-ui/core';
import SeriesPreviewVertical from '../components/SeriesPreviewVertical'
import {NavigationOutlined, LibraryAdd} from '@material-ui/icons';
import VtkMprViewer from './vtkMprViewer'
import ThreeDViewer from './threeDViewer'
import TuneIcon from '@material-ui/icons/Tune';
import axios from 'axios';
import Cursor3D from "../components/cursor3D";
import Slider from '@material-ui/lab/Slider';

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
      width: 'calc(100vw - 170px - 240px)',
      height: 'calc(100vh - 64px - 64px)',
      borderColor: theme.palette.primary.main,
      borderStyle: "solid",
      borderWidth: 1,
    },
    drawerOpenGrid:{
      width: 'calc(100vw - 240px - 170px - 240px)',
    },
    loadingProgressSnackbar:{

    },
    slider: {
      padding: '22px 10px',
      width: 200,
    },
    implantList:{
      background: theme.palette.secondary.main,
      width: 240,
      height: 'calc(100vh - 64px - 64px)',
      position: "relative",
      top: 'calc(-100vh + 64px + 64px)',
      left: 'calc(100vw - 240px)',
    },
    drawerOpenImplantList:{
      position: "relative",
      left: 'calc(100vw - 240px - 240px)',
    },
    listSubHeader:{
      color: 'white',
    },
    button:{
      color: theme.palette.primary.contrastText,
      '&:hover': {
          backgroundColor: theme.palette.secondary.light,
        }
    },
    divider:{
      backgroundColor: theme.palette.secondary.light,
    },
})

class SurgicalPlanner extends React.Component {
  constructor(props)
  {
    super(props);
    this.state = {
      anchorPreset:null,
      anchorShift:null,
      selectedSeries: null,
      loadingProgress: 100,
      loadingMessage: "Loading...",
      loadingPromise: null,
      serverStatus: "",
      serverStatusOpen: false,
      displaySEries: null,
      cursor3D: new Cursor3D(),
      ijkPos: [0,0,0],
      shift: 0,
      preset: 1,
      opacity:1,
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
          url: 'http://223.255.146.2:8083/api/loadDicom',
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
              url: 'http://223.255.146.2:8083/api/getImageHeader',
              params:{
                id: this.props.socket.id,
                series: series,
              },
              headers:  {'Access-Control-Allow-Origin': '*'},
            }).then(res=>{
              this.state.cursor3D.setSize(res.data.Size[0],res.data.Size[1],res.data.Size[2])
              this.state.cursor3D.setIjkPosition(res.data.Size[0]/2,res.data.Size[1]/2, res.data.Size[2]/2)

              // console.log(this.state.cursor3D.getIjkPosition())
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
        if (!err.response){
          return;
        }

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

  handlePresetOpen = (event)=>{
    this.setState({
      anchorPreset: event.currentTarget
    });
  }

  handlePresetClose= ()=>{
    this.setState({
      anchorPreset: null
    });
  }

  handleShiftOpen = (event)=>{
    this.setState({
      anchorShift: event.currentTarget
    });
  }

  handleShiftClose= ()=>{
    this.setState({
      anchorShift: null
    });
  }

  onCursorChange = () =>{
    // console.log("cursor change")
    // console.log(this.state.cursor3D.getIjkPosition())
    this.setState({ijkPos: this.state.cursor3D.getIjkPosition()})
  }

    render() {
      const {drawerOpen, series, classes} = this.props
      const {cursor3D, ijkPos, preset, opacity, shift,value} = this.state
      const { anchorPreset, anchorShift } = this.state;
      const openPreset = Boolean(anchorPreset)
      const openShift = Boolean(anchorShift)

    	return(
        <div className={classNames(classes.root, {[classes.drawerOpen]: this.props.drawerOpen,})}>
          <AppBar className={classes.appBar}>
              <Toolbar>
                
                <Button classes={{label: classes.label}} color="inherit" >
                  <NavigationOutlined />
                  Navigate
                </Button>

                <Button classes={{label: classes.label}} color="inherit" size="small" aria-owns={openPreset ? "simple-popper" : null} aria-haspopup="true"
                  onClick={this.handlePresetOpen}>
                  <TuneIcon />
                  Preset
                </Button>

                <Popover id="simple-popper" classes={classes.popover} open={openPreset} anchorEl={anchorPreset}
                  anchorOrigin={{ vertical: "bottom", horizontal: "center"}}
                  transformOrigin={{vertical: "top", horizontal: "center"}}
                  onClose={this.handlePresetClose}
                >
                    <Button classes={{label: classes.label}} color="inherit" size="small" 
                      onClick={() => {this.setState({preset:1}); this.handlePresetClose()}}
                    >
                      CT_AAA
                    </Button>
                    <Button classes={{label: classes.label}} color="inherit" size="small" 
                      onClick={() => {this.setState({preset:2}); this.handlePresetClose()}}
                    >
                      CT_AAA2
                    </Button>
                    <Button classes={{label: classes.label}} color="inherit" size="small" 
                      onClick={() => {this.setState({preset:3}); this.handlePresetClose()}}
                    >
                      CT_BONE
                    </Button>
                    <Button classes={{label: classes.label}} color="inherit" size="small" 
                      onClick={() => {this.setState({preset:4}); this.handlePresetClose()}}
                    >
                      CT_BONES
                    </Button>
                    <Button classes={{label: classes.label}} color="inherit" size="small" 
                      onClick={() => {this.setState({preset:5}); this.handlePresetClose()}}
                    >
                      CT_CARDIAC
                    </Button>
                    <Button classes={{label: classes.label}} color="inherit" size="small" 
                      onClick={() => {this.setState({preset:6}); this.handlePresetClose()}}
                    >
                      CT_CHEST_CONTRAST_ENHANCED
                    </Button>
                    <Button classes={{label: classes.label}} color="inherit" size="small" 
                      onClick={() => {this.setState({preset:9}); this.handlePresetClose()}}
                    >
                      CT_CHEST_VESSELS
                    </Button>
                    <Button classes={{label: classes.label}} color="inherit" size="small" 
                      onClick={() => {this.setState({preset:10}); this.handlePresetClose()}}
                    >
                      CT_CORONARY_ARTERIES
                    </Button>
                    <Button classes={{label: classes.label}} color="inherit" size="small" 
                      onClick={() => {this.setState({preset:11}); this.handlePresetClose()}}
                    >
                      CT_CORONARY_ARTERIES3
                    </Button>
                    <Button classes={{label: classes.label}} color="inherit" size="small" 
                      onClick={() => {this.setState({preset:13}); this.handlePresetClose()}}
                    >
                      CT_CROPPED_VOLUME_BONE
                    </Button>
                    <Button classes={{label: classes.label}} color="inherit" size="small" 
                      onClick={() => {this.setState({preset:14}); this.handlePresetClose()}}
                    >
                      CT_LIVER_VASCULATURE
                    </Button>
                    <Button classes={{label: classes.label}} color="inherit" size="small" 
                      onClick={() => {this.setState({preset:15}); this.handlePresetClose()}}
                    >
                      CT_LUNG
                    </Button>
                    <Button classes={{label: classes.label}} color="inherit" size="small" 
                      onClick={() => {this.setState({preset:17}); this.handlePresetClose()}}
                    >
                      CT_MUSCLE
                    </Button>
                    <Button classes={{label: classes.label}} color="inherit" size="small" 
                      onClick={() => {this.setState({preset:18}); this.handlePresetClose()}}
                    >
                      CT_SOFT_TISSUE
                    </Button>
                    <Button classes={{label: classes.label}} color="inherit" size="small" 
                      onClick={() => {this.setState({preset:20}); this.handlePresetClose()}}
                    >
                      MR_ANGIO
                    </Button>
                    <Button classes={{label: classes.label}} color="inherit" size="small" 
                      onClick={() => {this.setState({preset:21}); this.handlePresetClose()}}
                    >
                      MR_DEFAULT
                    </Button>
                </Popover>   

                <Button classes={{label: classes.label}} color="inherit" size="small" aria-owns={openShift ? "simple-popper2" : null} aria-haspopup="true"
                  onClick={this.handleShiftOpen}>
                  <TuneIcon />
                  Shift
                </Button>

                <Popover id="simple-popper2" classes={classes.popover} open={openShift} anchorEl={anchorShift}
                  anchorOrigin={{ vertical: "bottom", horizontal: "center"}}
                  transformOrigin={{vertical: "top", horizontal: "center"}}
                  onClose={this.handleShiftClose}
                >    

                  <Slider
                    classes={{ container: classes.slider }}
                    value={value}
                    aria-labelledby="label"
                    onChange={(event,value)=>{
                      var val = (value-20)*5; //val could be position or negative, while 5 is a multiplier, 
                      this.setState({ value }); 
                      this.setState({shift:val})
                    }}
                    onDragEnd={(event)=>{
                      this.handleShiftClose();
                    }}
                  />


                </Popover>  



              </Toolbar>
          </AppBar>

          <SeriesPreviewVertical series={series} selectedSeries={this.state.selectedSeries} onSelectSeries={this.onSelectSeries}/>
          <Grid container className={classNames(classes.gridRoot, {[classes.drawerOpenGrid]: this.props.drawerOpen,})}>
            <Grid container spacing={0}>
              <Grid item xs={6}>
                <VtkMprViewer 
                  orientation={"Axial"} 
                  series={this.state.displaySeries} 
                  socket={this.props.socket} 
                  drawerOpen={drawerOpen}
                  cursor3D={cursor3D}
                  onCursorChange={this.onCursorChange}
                  ijkPos={ijkPos}/>
              </Grid>
              <Grid item xs={6}>
                <VtkMprViewer 
                  orientation={"Sagittal"} 
                  series={this.state.displaySeries} 
                  socket={this.props.socket} 
                  drawerOpen={drawerOpen}
                  cursor3D={cursor3D}
                  onCursorChange={this.onCursorChange}
                  ijkPos={ijkPos}/>
              </Grid>
              <Grid item xs={6}>
                <ThreeDViewer
                series={this.state.displaySeries} 
                socket={this.props.socket} 
                drawerOpen={drawerOpen}
                preset={preset}
                shift={shift}
                opacity={opacity}
                />

              </Grid>
              <Grid item xs={6}>
                <VtkMprViewer 
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

          <div className={classNames(classes.implantList, {[classes.drawerOpenImplantList]: this.props.drawerOpen,})}>
            <List>
              <ListItem button className={classes.button}>
                <ListItemIcon className={classes.button} onClick={() => {return;}}>
                  <LibraryAdd />
                </ListItemIcon>
                <ListItemText primary={<Typography variant="body1" style={{ color: 'white' }}>Insert New Implant</Typography>} />
              </ListItem>
            </List>
            <Divider className={classes.divider} />
          </div>

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

export default withStyles(styles)(SurgicalPlanner);
