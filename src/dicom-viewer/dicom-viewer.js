import React from "react";
import Hammer from "hammerjs";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math";
import * as dcmLoader from "./dcmLoader";
import {withStyles} from '@material-ui/core/styles'
// import exampleImageIdLoader from "./exampleImageIdLoader";
import {Snackbar} from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';
import Brightness6Icon from '@material-ui/icons/Brightness6Outlined';
import OpenWithIcon from '@material-ui/icons/OpenWith';
import SearchIcon from '@material-ui/icons/Search';
import LinearScaleIcon from '@material-ui/icons/LinearScale';
import AdjustIcon from '@material-ui/icons/Adjust';
import PanoramaFishEyeIcon from '@material-ui/icons/PanoramaFishEye';
import CropDinIcon from '@material-ui/icons/CropDin';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import AnnotateIcon from '@material-ui/icons/Edit';
import CropFreeIcon from '@material-ui/icons/CropFree';
import NavigationIcon from '@material-ui/icons/NavigationOutlined';
import MoreIcon from '@material-ui/icons/AddCircleOutline';
import ClearIcon from '@material-ui/icons/DeleteOutlined';
import InvertIcon from '@material-ui/icons/Tonality';
import VFlipIcon from '@material-ui/icons/MoreVert';
import HFlipIcon from '@material-ui/icons/MoreHoriz';
import RotateRightIcon from '@material-ui/icons/RotateRight';
import ReplayIcon from '@material-ui/icons/Replay';
import SaveIcon from '@material-ui/icons/SaveAlt';
import TextIcon from '@material-ui/icons/Title';
import FreeFormIcon from '@material-ui/icons/RoundedCorner';
import PlayIcon from '@material-ui/icons/PlayArrowOutlined';
import InfoIcon from '@material-ui/icons/Info';

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';
import Popover from "@material-ui/core/Popover";
import Typography from '@material-ui/core/Typography';
import classNames from 'classnames';

import SeriesPreviewVertical from '../components/SeriesPreviewVertical'
import DicomHeaderDialog from './dicomHeaderDialog'

const styles = theme=> ({
  root:{    
    width: '100vw',
    height: 'calc(100vh - 128px)',
    backgroundColor: "black",
        // overflow: 'auto',
        // flexGrow: 1,
      },
      drawerOpen:{
        width: 'calc(100vw - 240px - 170px)',
        height: 'calc(100vh - 128px)',
      },
      appBar:{
        flexGrow: 1,    
        zIndex: 1,
        overflow: 'auto',
        position: 'absolute',
          // display: 'flex',
          height: '64px',
          justifyContent: 'center',
          background: theme.palette.secondary.main,
        },

        toolbar:{
          paddingLeft:'0px',
        },

        paper:{
          padding: 0,
          borderColor: theme.palette.primary.main,
          borderStyle: "solid",
          borderRadius:"0px",
          borderWidth:"1px",
          marginTop: "64px",

          marginLeft: "170px",
          height: "calc(100vh - 128px - 2px)",
          width: "calc(100vw - 2px - 170px)"
        },
        paperDrawerOpen:{
          width: "calc(100vw - 2px - 240px - 170px)"
        },

        label: {
    // Aligns the content of the button vertically.
    width: '55px',
    height: '40px',
    flexDirection: 'column',
    textTransform: 'none',
      // fontSize: '3px',
      color: theme.palette.primary.contrastText,
      '&:hover': {
        color: theme.palette.secondary.contrastText,
      },
    },

    popover:{
      borderStyle: "solid",
      borderRadius:"3px",
      borderWidth:"1px",
      borderColor: theme.palette.primary.main,
    },
    loadingProgressSnackbar:{
      minWidth: 100
    }
  })

class DicomViewer extends React.Component {
  constructor(props){
    super(props);
    this.state={
      username: '',
      anonymized: false,
      anchorEl:null,
      rowCosine:[1,0,0],
      columnCosine:[0,1,0],
      selectedSeries: null,
      dicomImage:null,
      loadingProgress: 100,
      infoDialog:false,
    };
    
  }

  componentWillReceiveProps(nextProps){
    if (nextProps.drawerOpen){
      const element = this.dicomImage;
      cornerstoneTools.stopClip(element, 31);
      this.setState(state=>({playingClip:false}));
    }

    if (this.props.drawerOpen != nextProps.drawerOpen){
      console.log("drawer open: " + nextProps.drawerOpen)
      if (nextProps.drawerOpen){
        this.dicomImage.style.width = 'calc(100vw - 240px - 2px - 170px)'
      }
      else{
        this.dicomImage.style.width = 'calc(100vw - 2px - 170px)'
      }
      cornerstone.resize(this.dicomImage)
    }
  }



  componentWillMount() {

  }

  componentWillUnmount(){

  }

  componentDidMount() {
  }


  handleClick(event){
    this.setState({
      anchorEl: event.currentTarget
    });
  };

  handleClose(){
    this.setState({
      anchorEl: null
    });
  };

  rotateMarker(div, rotation) {
    var rotationCSS = {
      "-webkit-transform-origin": "center center",
      "-moz-transform-origin": "center center",
      "-o-transform-origin": "center center",
      "transform-origin": "center center",
      "transform" : "rotate("+ rotation +"deg)"
    };

    var oppositeRotationCSS = {
      "-webkit-transform-origin": "center center",
      "-moz-transform-origin": "center center",
      "-o-transform-origin": "center center",
      "transform-origin": "center center",
      "transform" : "rotate("+ -rotation +"deg)"
    };

    Object.keys(rotationCSS).forEach(function(key) {
      div.style[key] = rotationCSS[key];
    });

    const orientationMarkerDivs = div.querySelectorAll(".orientationMarkerDiv");
    Object.keys(rotationCSS).forEach(function(key) {
      orientationMarkerDivs.forEach(function(div) {
        div.style[key] = oppositeRotationCSS[key];
      });
    });
  }

  calculateOrientationMarkers(element, viewport, state) {
    var enabledElement = cornerstone.getEnabledElement(element);
    var imagePlaneMetaData = cornerstone.metaData.get('imagePlaneModule', enabledElement.image.imageId);

    var rowString = cornerstoneTools.orientation.getOrientationString(state.rowCosine);
    var columnString = cornerstoneTools.orientation.getOrientationString(state.columnCosine);

    var oppositeRowString = cornerstoneTools.orientation.invertOrientationString(rowString);
    var oppositeColumnString = cornerstoneTools.orientation.invertOrientationString(columnString);
    

    var markers = {
      top: oppositeColumnString,
      bottom: columnString,
      left: oppositeRowString,
      right: rowString
    }

    var topMid = document.querySelector('.mrtopmiddle .orientationMarker');
    var bottomMid = document.querySelector('.mrbottommiddle .orientationMarker');
    var rightMid = document.querySelector('.mrrightmiddle .orientationMarker');
    var leftMid = document.querySelector('.mrleftmiddle .orientationMarker');


    topMid.textContent = markers.top;
    bottomMid.textContent = markers.bottom;
    rightMid.textContent = markers.right;
    leftMid.textContent = markers.left;
  }

  handleResize(event,dicomImage){
    if (dicomImage)
    {
      console.log('updateSize')

      dicomImage.style.height = 'calc(100vh - 128px - 2px)'
      dicomImage.style.width = '100%'
      try{
        cornerstone.resize(dicomImage)          
      }
      catch(error)
      {
        console.log(error)
      }
    }
  }

  handleInfoDialogOpen(){
    this.setState({infoDialog: true});
  }

  handleInfoDialogClose(){
    this.setState({infoDialog:false});
  }

  getImagePathList(IP,Port,Path1){//sync request for now
    // return new Promise(function(resolve,reject){
    //   resolve(['http://127.0.0.1:8080/0100.dcm','http://127.0.0.1:8080/0010.dcm','http://127.0.0.1:8080/1400.dcm','http://127.0.0.1:8080/0250.dcm','http://127.0.0.1:8080/0410.dcm']);
    // })

    // return new Promise(function(resolve,reject){
    //   resolve(['http://192.168.1.108:8080/0002.png']);
    // })

    if (Path1===null){
      return new Promise(function(resolve,reject){resolve(["http://223.255.146.2:8042/orthanc/instances/fedab2d3-b15265e7-fa7f9b03-55568349-ef5d91ad/file"])});
    }
    else{
      return new Promise(function(resolve,reject){
        var queryResult =   fetch("http://223.255.146.2:8042/orthanc/series/" + Path1+ "/ordered-slices").then(
          (res)=>{return res.json();}).then((json)=>{ 
            let cacheImagePathArray = [];
            for(let i = 0; i < json.Dicom.length; ++i){
              let path = "http://223.255.146.2:8042/orthanc" + json.Dicom[i]; 
              cacheImagePathArray.push(path);
            }
        // console.log(cacheImagePathArray);
        return cacheImagePathArray;
      });
          resolve(queryResult);

        });
    }

  }

  seriesImages(id){
    fetch("http://223.255.146.2:8042/orthanc/series/" + id)
    .then((res)=>{return res.json();})
    .then((json)=>{ 
      let cacheImagePathArray = [];
      for(let i = 0; i < json.Instances.length; ++i){
        let path = "http://192.168.1.126:3000/orthanc/instances/" + json.Instances[i] + "/file"; 
        cacheImagePathArray.push(path);
      }
      return cacheImagePathArray;
    });
  } 

  enableTool(toolName, mouseButtonNumber){
  };

  disableAllTools(){

  };

  dicomImageRef= el => {
    this.setState({dicomImage: el});
  };

  onSelectSeries=(event, series)=>{
    this.setState({loadingProgress: 0})
    this.setState({selectedSeries: series})

  }

  render() {
    const {selectedSeries, series, classes, theme} = this.props
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl)

    return (
      <div className={classNames(classes.root, {[classes.drawerOpen]: this.props.drawerOpen,})}>
      <AppBar className={classes.appBar}>
      <Toolbar className={classes.toolbar}>          
      <Button classes={{label: classes.label}} value="1" color="inherit" onClick={() => {}}>
      <NavigationIcon />
      Navigate
      </Button>

      <Button classes={{label: classes.label}} value="2" color="inherit" size="small" onClick={() => {}}>
      <Brightness6Icon />
      Levels
      </Button>

      <Button classes={{label: classes.label}} value="3" color="inherit" size="small" onClick={() => {}}>
      <OpenWithIcon />
      Pan
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => { }}>
      <SearchIcon />
      Zoom
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => { }}>
      <LinearScaleIcon />
      Length
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {}}>
      <ArrowBackIosIcon />
      Angle
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => { }}>
      <AdjustIcon />
      Probe
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {}}>
      <PanoramaFishEyeIcon />
      Elliptical
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {}}>
      <CropDinIcon />
      Rectangle
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {}}>
      <FreeFormIcon />
      Freeform
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {}}>
      <CropFreeIcon />
      Highlight
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {}}>
      <AnnotateIcon />
      Annotate
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small"
      onClick={() => {
      }}
      >
      <PlayIcon />
      Play
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" aria-owns={open ? "simple-popper" : null} aria-haspopup="true"
      onClick={this.handleClick}>
      <MoreIcon />
      More
      </Button>

      <Popover id="simple-popper" classes={classes.popover} open={open} anchorEl={anchorEl}
      anchorOrigin={{ vertical: "bottom", horizontal: "center"}}
      transformOrigin={{vertical: "top", horizontal: "center"}}
      onClose={this.handleClose}
      >

      <Button classes={{label: classes.label}} color="inherit" size="small" 
      onClick={() => {}}
      >
      <InvertIcon />
      Invert
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" 
      onClick={() => {                 }}>
      <TextIcon />
      Text
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" 
      onClick={() => {}}
      >
      <RotateRightIcon />
      Rotate
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" 
      onClick={() => {}}
      >
      <VFlipIcon />
      Flip V
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" 
      onClick={() => {}}
      >
      <HFlipIcon />
      Flip H
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" 
      onClick={() => {}}
      >
      <SaveIcon />
      Export
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" 
      onClick={() => {}}
      >
      <ClearIcon />
      Clear
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" 
      onClick={() => {                          }}
      >
      <ReplayIcon />
      Reset
      </Button>
      </Popover>           
      </Toolbar>
      </AppBar>

      <SeriesPreviewVertical series={series} selectedSeries={this.state.selectedSeries} onSelectSeries={this.onSelectSeries}/>

      <Paper className={classNames(classes.paper, {[classes.paperDrawerOpen]: this.props.drawerOpen,})}>
      <div
      style={this.props.drawerOpen? { 
              // flexGrow: 1,    
              // display: 'flex',
              width: "calc(100vw - 240px - 2px - 170px)",
              height: "calc(100vh - 128px - 2px)",
              position: "relative",
              color: "#6fcbff",
              backgroundColor: "black"
              // margin: 9
            } :
            {
              width: "calc(100vw - 2px - 170px)",
              height: "calc(100vh - 128px - 2px)",
              position: "relative",
              color: "#6fcbff",
              backgroundColor: "black"
            }
          }
          onContextMenu={() => false}
          className="cornerstone-enabled-image"
          unselectable="on"
          onSelectStart={() => false}
          onMouseDown={() => false}
          >

          <div
          ref={this.dicomImageRef}
          style={{
                  // flexGrow: 1,    
                  // display: 'flex',
                  width: "calc(100% - 170px)",
                  height: "calc(100vh - 128px - 2px)",
                  top: 0,
                  left: 0,
                  position: "relative",
                }}
                />

                <div id="mrtopleft" style={{ position: "absolute", top: "0.5%", left: "0.5%" }}>
                Patient Name: Chan Tai Man
                </div>

                <div id="mrtopright" style={{ position: "absolute", top: "0.5%", right: "0.5%" }}>
                Hospital: PWH
                </div>

                <div id="mrbottomright" style={{ position: "absolute", bottom: "0.5%", right: "0.5%" }}>
                Zoom:
                </div>

                <div id="mrbottomleft" style={{ position: "absolute", bottom: "0.5%", left: "0.5%", whiteSpace: 'pre'}}>
                WW/WC:
                </div>

                <div class="mrbottommiddle orientationMarkerDiv" style={{ position: "absolute", bottom: "0.5%", left: "50%" }}>
                <span class="orientationMarker">Q</span>
                </div>

                <div class="mrleftmiddle orientationMarkerDiv" style={{ position: "absolute", bottom: "50%", left: "0.5%" }}>
                <span class="orientationMarker">Q</span>
                </div>

                <div class="mrtopmiddle orientationMarkerDiv" style={{ position: "absolute", top: "0.5%", left: "50%" }}>
                <span class="orientationMarker">Q</span>
                </div>

                <div  class="mrrightmiddle orientationMarkerDiv" style={{ position: "absolute", bottom: "50%", right: "0.5%" }}>
                <span class="orientationMarker">Q</span>
                </div>

                </div>
                <Snackbar
                anchorOrigin={{vertical:'bottom',horizontal:'right'}}
              // open={this.state.loadingProgress < 100}
              open={true}
              ContentProps={{
                'aria-describedby': 'message-id',
                className: classes.loadingProgressSnackbar
              }}

              message={<span id="message-id">
              Loading: {this.state.loadingProgress}% 
              </span>}
              />
              </Paper>
              </div>

              );
}
}

export default withStyles(styles)(DicomViewer);


//<div class="orientationMarkers" style={{borderStyle:"solid", borderColor:"red",position: "absolute", top: "0%", left: "0%", width: viewerWidth, height: viewerHeight}}>

                    // <DicomHeaderDialog id='dicomHeaderDialog' open={this.state.infoDialog} onClose={this.handleInfoDialogClose}/>
                    // <Button classes={{label: classes.label}} color="inherit" size="small" onClick={this.handleInfoDialogOpen}>
                    //   <InfoIcon />
                    //   Info
                    // </Button>