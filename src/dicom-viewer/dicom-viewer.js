import React from "react";
import {withStyles} from '@material-ui/core/styles'
// import exampleImageIdLoader from "./exampleImageIdLoader";
import {Snackbar} from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Brightness6Icon from '@material-ui/icons/Brightness6Outlined';
import OpenWithIcon from '@material-ui/icons/OpenWith';
import SearchIcon from '@material-ui/icons/Search';
import LinearScaleIcon from '@material-ui/icons/LinearScale';
import AdjustIcon from '@material-ui/icons/Adjust';
import PanoramaFishEyeIcon from '@material-ui/icons/PanoramaFishEye';
import CropDinIcon from '@material-ui/icons/CropDin';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import AnnotateIcon from '@material-ui/icons/FontDownload';
import CropFreeIcon from '@material-ui/icons/CropFree';
import NavigationIcon from '@material-ui/icons/NavigationOutlined';
import MoreIcon from '@material-ui/icons/AddCircleOutline';
import ClearIcon from '@material-ui/icons/DeleteOutlined';
import InvertIcon from '@material-ui/icons/Tonality';
import VFlipIcon from '@material-ui/icons/MoreVert';
import HFlipIcon from '@material-ui/icons/MoreHoriz';
import RotateRightIcon from '@material-ui/icons/RotateRight';
import ReplayIcon from '@material-ui/icons/Replay';
import ExportIcon from '@material-ui/icons/SaveAlt';
import TextIcon from '@material-ui/icons/Title';
import FreeFormIcon from '@material-ui/icons/RoundedCorner';
import PlayIcon from '@material-ui/icons/PlayArrowOutlined';
import SaveIcon from '@material-ui/icons/Save';
import DrawIcon from '@material-ui/icons/Edit';
import Slider from  '@material-ui/lab/Slider';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import FilledInput from '@material-ui/core/FilledInput';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';

import Paper from '@material-ui/core/Paper';
import Popover from "@material-ui/core/Popover";
import classNames from 'classnames';

import SeriesPreviewVertical from '../components/SeriesPreviewVertical'

import dcmViewer from './dcmViewer'

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


        panel:{
          padding: "10px",
          height: "150px",
          width: "100px",
          backgroundColor: theme.palette.secondary.main,
          borderRadius: "0px",
        },

        slider: {
          padding: '15px 0px',
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
    },

    fab: {
    position: 'absolute',
    bottom: theme.spacing.unit * 5,
    right: theme.spacing.unit * 5,
    backgroundColor: theme.palette.primary.dark,
    '&:hover': {
        backgroundColor: theme.palette.primary.main,
      },
    },

    formControl: {
      margin: theme.spacing.unit,
      minWidth: 120,
      backgroundColor: theme.palette.secondary.light,
      color: theme.palette.primary.contrastText,
    },
  })

class DicomViewer extends React.Component {
  constructor(props){
    super(props);
    this.state={
      username: '',
      anchorEl:null,
      anchorDraw:null,
      selectedSeries: null,
      dicomImage:null,
      loadingProgress: 100,
      infoDialog:false,
      brushSize:4,
      brushColor:0,
    };
    this.viewer = null;
    this.anonymized = false;
  }

  componentWillReceiveProps(nextProps){
    if (this.props.drawerOpen !== nextProps.drawerOpen){
      console.log("drawer open: " + nextProps.drawerOpen)
      if (this.viewer && this.state.dicomImage){
        var element = this.state.dicomImage;
        if (nextProps.drawerOpen){
          element.style.width = 'calc(100vw - 240px - 2px - 170px)';
        }
        else{
          element.style.width = 'calc(100vw - 2px - 170px)';
        }
        this.viewer.resizeImage();
      }

    }
  }

  componentWillMount() {

  }

  componentWillUnmount(){
    window.removeEventListener('resize', this.handleResize);
    if (this.viewer){
      this.viewer.destructor();
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
  }


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

  calculateOrientationMarkers() {
    if (this.viewer){
      const currentImage = this.viewer.getImage();
      if (currentImage){
          if (currentImage.patientOri){
            const rowString = dcmViewer.getOrientationString(currentImage.patientOri.slice(0,3));
            const columnString = dcmViewer.getOrientationString(currentImage.patientOri.slice(3,6));
            const oppositeRowString = dcmViewer.invertOrientationString(rowString);
            const oppositeColumnString = dcmViewer.invertOrientationString(columnString);
            var topMid = document.querySelector('.mrtopmiddle .orientationMarker');
            var bottomMid = document.querySelector('.mrbottommiddle .orientationMarker');
            var rightMid = document.querySelector('.mrrightmiddle .orientationMarker');
            var leftMid = document.querySelector('.mrleftmiddle .orientationMarker');
            if (topMid){
              topMid.textContent = oppositeColumnString;
            }
            if (bottomMid){
              bottomMid.textContent = columnString;
            }
            if (rightMid){
              rightMid.textContent = rowString;
            }
            if (leftMid){
              leftMid.textContent = oppositeRowString;
            }
        }
        else {
          console.log("No image orientation info loaded");
        }
      }
      else {
        console.log("Image not loaded");
      }
    }
  }

  updateAnnotation(){
    if (this.viewer){
      const currentImage = this.viewer.getImage();
      if (currentImage){
        var topLeft = document.getElementById("mrtopleft");
        var topRight = document.getElementById("mrtopright");
        if (topLeft && currentImage.patientName){
          topLeft.textContent = currentImage.patientName;
        }
        if (topRight){
          topRight.textContent = '';
          if (currentImage.institutionName){
            topRight.textContent+=`${currentImage.institutionName}`;
          }
          topRight.textContent+="\r\n";
          if (currentImage.studyDescription){
            topRight.textContent+=`${currentImage.studyDescription}`;
          }
          topRight.textContent+="\r\n";
          if (currentImage.seriesDescription){
            topRight.textContent+=`${currentImage.seriesDescription}`;
          }
          topRight.textContent+="\r\n";
          if (currentImage.studyDate){
            topRight.textContent+=`${currentImage.studyDate}`;
          }
          topRight.textContent+="\r\n";
        }
      }
    }
  }

  handleInfoDialogOpen(){
    this.setState({infoDialog: true});
  }

  handleInfoDialogClose(){
    this.setState({infoDialog:false});
  }

  updateImage(){
    const curImage = this.viewer.getImage();
    if (curImage.color){//<-- indicator of faulty image
      this.viewer.reloadImage();
    }
  }

  handleResize=()=>{
    if (this.viewer && this.state.dicomImage)
    {
      var element = this.state.dicomImage;
      element.style.height = 'calc(100vh - 128px - 2px)';
      element.style.width = '100%';
      this.viewer.resizeImage();
    }
  }

  handleClick = (event)=>{
    this.setState({
      anchorEl: event.currentTarget
    });
  };

  handleClose= ()=>{
    this.setState({
      anchorEl: null
    });
  };

  handleDrawPanelOpen = (event)=>{
    this.setState({
      anchorDraw: event.currentTarget
    });
  };

  handleDrawPanelClose= ()=>{
    this.setState({
      anchorDraw: null
    });
  };

  dicomImageRef= el => {
    if (el !== this.state.dicomImage){
      this.setState({dicomImage: el});
    }
  };

  onSelectSeries=(event, series)=>{
    this.setState({loadingProgress: 0})
    this.setState({selectedSeries: series})
    if (this.viewer === null){
      this.viewer = new dcmViewer(this.state.dicomImage);
    }
    if (series){
      this.viewer.initialiseSeries(series)
      .then((res)=>{
        this.calculateOrientationMarkers();
        this.updateAnnotation();
        this.viewer.setRenderedCallBack(this.onImageRendered);
        this.viewer.setTimeoutCallBack(this.loadingProgressUpdater, 1000);
      })
    }
    else {
      console.log('input series is empty');
    }
  }



  onImageRendered= ()=>{
    var bottomLeft = document.getElementById("mrbottomleft");
    var bottomRight = document.getElementById("mrbottomright");
    if (this.viewer){
      this.updateImage();
      if (bottomLeft){
        const stack = this.viewer.stack;
        if (stack){
          bottomLeft.textContent = `Slices: ${stack.currentImageIdIndex+1}/${stack.imageIds.length}`;
        }
      }
      if (bottomRight){
        // console.log(this.viewer.getZoom());
        bottomRight.textContent = `Zoom: ${this.viewer.getZoom().toFixed(2)*100}%`;
        bottomRight.textContent += "\r\n";
        bottomRight.textContent +=`W:${Math.round(this.viewer.getWW())} L:${Math.round(this.viewer.getWC())}`
      }
    }
    
  }

  loadingProgressUpdater = ()=>{
    const curLoadProgress = Math.round(100*this.viewer.getLoadingProgress());
    // console.log(curLoadProgress);
    this.setState({loadingProgress:curLoadProgress});
    if (curLoadProgress === 100){
      try{
        this.viewer.clearTimer();
      }
      catch(error){
        console.log("Stop timer failed");
      }
    }

  }

  render() {
    const {series, classes} = this.props
    const { anchorEl, anchorDraw, brushSize, brushColor} = this.state;
    const open = Boolean(anchorEl)
    const open2 = Boolean(anchorDraw)

    return (
      <div className={classNames(classes.root, {[classes.drawerOpen]: this.props.drawerOpen,})}>
      <AppBar className={classes.appBar}>
      <Toolbar className={classes.toolbar}>          
      <Button classes={{label: classes.label}} value="1" color="inherit" onClick={() => {
        if (this.viewer){
          this.viewer.toNavigateMode();
        }
      }}>
      <NavigationIcon />
      Navigate
      </Button>

      <Button classes={{label: classes.label}} value="2" color="inherit" size="small" onClick={() => {
        if (this.viewer){
          this.viewer.toWindowLevelMode();
        }
      }}>
      <Brightness6Icon />
      Levels
      </Button>

      <Button classes={{label: classes.label}} value="3" color="inherit" size="small" onClick={() => {
        if (this.viewer){
          this.viewer.toPanMode();
        }
      }}>
      <OpenWithIcon />
      Pan
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => { 
        if (this.viewer){
          this.viewer.toZoomMode();
        }
      }}>
      <SearchIcon />
      Zoom
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {
        if (this.viewer){
          this.viewer.toLengthMode();
        }
      }}>
      <LinearScaleIcon />
      Length
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {
        if (this.viewer){
          this.viewer.toAngleMode();
        }
      }}>
      <ArrowBackIosIcon />
      Angle
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {
        if (this.viewer){
          this.viewer.toProbeMode();
        }
       }}>
      <AdjustIcon />
      Probe
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {
        if (this.viewer){
          this.viewer.toEllipticalROIMode();
        }
      }}>
      <PanoramaFishEyeIcon />
      Elliptical
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {
        if (this.viewer){
          this.viewer.toRectangleROIMode();
        }
      }}>
      <CropDinIcon />
      Rectangle
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {
        if (this.viewer){
          this.viewer.toFreeFormROIMode();
        }
      }}>
      <FreeFormIcon />
      Freeform
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {
        if (this.viewer){
          this.viewer.toHighLightMode();
        }
      }}>
      <CropFreeIcon />
      Highlight
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {
        if (this.viewer){
          this.viewer.toArrowAnnotateMode();
        }
      }}>
      <AnnotateIcon />
      Annotate
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small"
      onClick={() => {
        if (this.viewer){
        }
      }}
      >
      <DrawIcon />
      Draw
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small"
      onClick={() => {
        if (this.viewer){
          this.viewer.toPlayMode();
        }
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
      onClick={() => {
        if (this.viewer){
          this.viewer.invertImage();
        }
        this.handleClose()
      }}
      >
      <InvertIcon />
      Invert
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" 
      onClick={() => {
          this.anonymized=!this.anonymized;

          var bottomLeft = document.getElementById("mrbottomleft");
          var bottomRight = document.getElementById("mrbottomright");
          var topLeft = document.getElementById("mrtopleft");
          var topRight = document.getElementById("mrtopright");
          var correctedVisibility = "hidden"
          if (this.anonymized){
            correctedVisibility = "visible";
          }
          if (bottomLeft){
            if (bottomLeft.style){
              bottomLeft.style.visibility = correctedVisibility;
            }
          }
          if (bottomRight){
            if (bottomRight.style){
              bottomRight.style.visibility = correctedVisibility;
            }
          }
          if (topLeft){
            if (topLeft.style){
              topLeft.style.visibility = correctedVisibility;
            }
          }
          if (topRight){
            if (topRight.style){
              topRight.style.visibility = correctedVisibility;
            }
          }
          this.handleClose()
        }}>
      <TextIcon />
      Text
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" 
      onClick={() => {
        if (this.viewer){
          this.viewer.rotateImage();
          var topMid = document.querySelector('.mrtopmiddle .orientationMarker');
          var bottomMid = document.querySelector('.mrbottommiddle .orientationMarker');
          var rightMid = document.querySelector('.mrrightmiddle .orientationMarker');
          var leftMid = document.querySelector('.mrleftmiddle .orientationMarker');
          if (topMid && bottomMid && rightMid && leftMid){
            var temp = bottomMid.textContent;
            bottomMid.textContent = rightMid.textContent;
            rightMid.textContent=topMid.textContent;
            topMid.textContent=leftMid.textContent;
            leftMid.textContent=temp;
          }
        }
        this.handleClose()
      }}
      >
      <RotateRightIcon />
      Rotate
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" 
      onClick={() => {
        if (this.viewer){
          this.viewer.vflipImage();
          var topMid = document.querySelector('.mrtopmiddle .orientationMarker');
          var bottomMid = document.querySelector('.mrbottommiddle .orientationMarker');
          if (topMid && bottomMid){
            const temp = topMid.textContent;
            topMid.textContent = bottomMid.textContent;
            bottomMid.textContent = temp;
          }
        }
        this.handleClose()
      }}
      >
      <VFlipIcon />
      Flip V
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" 
      onClick={() => {
        if (this.viewer){
          this.viewer.hflipImage();
          var rightMid = document.querySelector('.mrrightmiddle .orientationMarker');
          var leftMid = document.querySelector('.mrleftmiddle .orientationMarker');
          if (rightMid && leftMid){
            const temp = rightMid.textContent;
            rightMid.textContent = leftMid.textContent;
            leftMid.textContent = temp;
          }
        }
        this.handleClose()
      }}
      >
      <HFlipIcon />
      Flip H
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" 
      onClick={() => {
        if (this.viewer){
          this.viewer.exportImage();
        }
        this.handleClose()
      }}
      >
      <ExportIcon />
      Export
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" 
      onClick={() => {
        if (this.viewer){
          
          
        }
        this.handleClose()
      }}
      >
      <SaveIcon />
      Save
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" 
      onClick={() => {
        if (this.viewer){
          this.viewer.clearImage();
        }
        this.handleClose()
      }}
      >
      <ClearIcon />
      Clear
      </Button>

      <Button classes={{label: classes.label}} color="inherit" size="small" 
      onClick={() => {
        if (this.viewer){
          this.viewer.resetImage();
          this.calculateOrientationMarkers();
        }
        this.handleClose()
      }}
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
          onContextMenu={event=>{event.preventDefault()}}
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
                  MozUserSelect:'none',
                  WebkitUserSelect:'none',
                  msUserSelect:'none',
                }}
                />


              <div id="mrtopleft" style={{ position: "absolute", top: "0.5%", left: "0.5%", whiteSpace: 'pre', MozUserSelect:'none', WebkitUserSelect:'none', msUserSelect:'none'}}>
                
              </div>
              
              <div id="mrtopright" style={{ position: "absolute", top: "0.5%", right: "0.5%", whiteSpace: 'pre', textAlign:"right" , MozUserSelect:'none', WebkitUserSelect:'none', msUserSelect:'none'}}>
                
              </div>
              
              <div id="mrbottomright" style={{ position: "absolute", bottom: "0.5%", right: "0.5%", whiteSpace: 'pre', textAlign:"right" , MozUserSelect:'none', WebkitUserSelect:'none', msUserSelect:'none' }}>
               
              </div>

              <div id="mrbottomleft" style={{ position: "absolute", bottom: "0.5%", left: "0.5%", whiteSpace: 'pre', MozUserSelect:'none', WebkitUserSelect:'none', msUserSelect:'none'}}>
               
              </div>

                <div class="mrbottommiddle orientationMarkerDiv" style={{ position: "absolute", bottom: "0.5%", left: "50%", MozUserSelect:'none', WebkitUserSelect:'none', msUserSelect:'none' }}>
                <span class="orientationMarker">Q</span>
                </div>

                <div class="mrleftmiddle orientationMarkerDiv" style={{ position: "absolute", bottom: "50%", left: "0.5%", MozUserSelect:'none', WebkitUserSelect:'none', msUserSelect:'none' }}>
                <span class="orientationMarker">Q</span>
                </div>

                <div class="mrtopmiddle orientationMarkerDiv" style={{ position: "absolute", top: "0.5%", left: "50%", MozUserSelect:'none', WebkitUserSelect:'none', msUserSelect:'none' }}>
                <span class="orientationMarker">Q</span>
                </div>

                <div  class="mrrightmiddle orientationMarkerDiv" style={{ position: "absolute", bottom: "50%", right: "0.5%" , MozUserSelect:'none', WebkitUserSelect:'none', msUserSelect:'none'}}>
                <span class="orientationMarker">Q</span>
                </div>

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
              Loading: {this.state.loadingProgress}% 
              </span>}
              />
              </Paper>

              <Button variant="fab" color="secondary" className={classes.fab} aria-owns={open2 ? "simple-popper2" : null} aria-haspopup="true"
                   onClick={this.handleDrawPanelOpen}>
                <DrawIcon />
              </Button>

              <Popover id="simple-popper2" className={classes.popover} open={open2} anchorEl={anchorDraw}
                anchorOrigin={{ vertical: "top", horizontal: "center"}}
                transformOrigin={{vertical: "bottom", horizontal: "center"}}
                onClose={this.handleDrawPanelClose}
              >
                <Paper className={classes.panel}>                
                  <Typography  color="primary">
                    Size
                  </Typography>

                <Slider
                  classes={{ container: classes.slider }}
                  value={brushSize}
                  min={1}
                  max={10}
                  aria-labelledby="label"
                    onChange={(event,brushSize)=>{
                      this.setState({brushSize})
                    }}
                />

                <FormControl variant="filled" className={classes.formControl}>
                <InputLabel htmlFor="filled-color-simple" >Color</InputLabel>
                  <Select
                    value={this.state.brushColor}
                     onChange={(event)=>{
                      this.setState({ brushColor: event.target.value });}}
                    input={<FilledInput name="Color" id="filled-color-simple" />}
                  >
                    <MenuItem value={0}>Red</MenuItem>
                    <MenuItem value={1}>Cyan</MenuItem>
                    <MenuItem value={2}>Yellow</MenuItem>
                    <MenuItem value={3}>Blue</MenuItem>
                    <MenuItem value={4}>Orange</MenuItem>
                  </Select>
                </FormControl>

                </Paper>
              </Popover>
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