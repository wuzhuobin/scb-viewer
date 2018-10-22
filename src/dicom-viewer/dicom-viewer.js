import React from "react";
import Hammer from "hammerjs";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math";
import dicomLoader from "./dicom-loader";
import {withStyles} from '@material-ui/core/styles'
// import exampleImageIdLoader from "./exampleImageIdLoader";
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

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Popover from "@material-ui/core/Popover";

import classNames from 'classnames';

const styles = theme=> ({
    root:{    
        width: '100vw',
        height: 'calc(100vh - 128px)',
        // overflow: 'auto',
        // flexGrow: 1,
    },
    drawerOpen:{
        width: 'calc(100vw - 240px)',
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
          background: theme.palette.secondary.main
        },

     paper:{
      padding: 0,
      borderColor: theme.palette.primary.main,
      borderStyle: "solid",
      borderRadius:"0px",
      marginTop: "64px",
      height: "calc(100vh - 128px - 6px)",
      width: "calc(100vw - 6px)"
     },
     paperDrawerOpen:{
      width: "calc(100vw - 6px - 240px)"
     },

    label: {
    // Aligns the content of the button vertically.
      flexDirection: 'column',
    },
})

class DicomViewer extends React.Component {

  constructor(props){
    super(props);
    this.state={
      username: '',
      imageId: 0,
      imagePathArray:[],
      imageLoaderHintsArray:[],
      hardCodeNumDcm:1,
      currentInteractionode: 1,
      anonymized: false,
      anchorEl:null,
      playingClip:false,
      rowCosine:[1,0,0],
      columnCosine:[0,1,0],
      initialized:false,
    }
  }

  componentWillReceiveProps(nextProps) {
      console.log("willrecieve")
      if (this.props.series !== nextProps.series && nextProps.series!=null) {
        
        console.log(nextProps.series)
      }
    }

  handleClick = event => {
    this.setState({
      anchorEl: event.currentTarget
    });
  };

  handleClose = () => {
    this.setState({
      anchorEl: null
    });
  };

    updateOrientationMarkers(element, viewport) {
    // Apply rotations
    // var orientationMarkers = document.querySelector('.orientationMarkers');
    // console.log(orientationMarkers);
    // this.rotateMarker(orientationMarkers, viewport.rotation);
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
    // var enabledElement = cornerstone.getEnabledElement(element);
    // var imagePlaneMetaData = cornerstone.metaData.get('imagePlaneModule', enabledElement.image.imageId);
    // console.log(imagePlaneMetaData);

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
    console.log(element);
    var topMid = document.querySelector('.mrtopmiddle .orientationMarker');
    var bottomMid = document.querySelector('.mrbottommiddle .orientationMarker');
    var rightMid = document.querySelector('.mrrightmiddle .orientationMarker');
    var leftMid = document.querySelector('.mrleftmiddle .orientationMarker');


    topMid.textContent = markers.top;
    bottomMid.textContent = markers.bottom;
    rightMid.textContent = markers.right;
    leftMid.textContent = markers.left;
  }





  componentWillMount() {
    cornerstoneTools.external.cornerstone = cornerstone;
    cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
    cornerstoneTools.external.Hammer = Hammer;
  }

  componentDidMount() {
    console.log("didmount")
    console.log(this.props.series)
    this.readImage(this.props, this.state, cornerstone).then(res=>this.displayImage());
  }

  getImagePathList(IP,Port,GET){//sync request for now
    // return ['./assets/Test1/0000.dcm'];
    // return ['http://192.168.1.126:3000/orthanc/instances/2d3e243d-8b918a6f-b3456d3e-0546d044-dab91ee0/file'];
    // return ['http://127.0.0.1:8080/0100.dcm'];
    
    // return new Promise(function(resolve,reject){
    //   resolve(['http://127.0.0.1:8080/0100.dcm','http://127.0.0.1:8080/0010.dcm','http://127.0.0.1:8080/1400.dcm','http://127.0.0.1:8080/0250.dcm','http://127.0.0.1:8080/0410.dcm']);
    // })

    // return new Promise(function(resolve,reject){
    //   resolve(['http://192.168.1.108:8080/0100.dcm','http://192.168.1.108:8080/0010.dcm','http://192.168.1.108:8080/1400.dcm','http://192.168.1.108:8080/0250.dcm','http://192.168.1.108:8080/0410.dcm']);
    // })

    return new Promise(function(resolve,reject){
      var queryResult =   fetch("http://223.255.146.2:8042/orthanc/series/" + GET+ "/ordered-slices").then(
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

  seriesImages(id){
  fetch("http://223.255.146.2:8042/orthanc/series/" + id)
  .then((res)=>{return res.json();})
  .then((json)=>{ 
    let cacheImagePathArray = [];
    for(let i = 0; i < json.Instances.length; ++i){
      let path = "http://192.168.1.126:3000/orthanc/instances/" + json.Instances[i] + "/file"; 
      cacheImagePathArray.push(path);
    }
    // console.log(cacheImagePathArray);
    return cacheImagePathArray;
   });
} 


  readImage(props, state, cornerstoneInstance){
      //Get image path Array first
      const loadingResult = this.getImagePathList(1,1,props.series)
      // const loadingResult = this.getImagePathList(1,1,"cf8192f8-50e817d9-2aae4764-3c85d142-dc59a8d0")
      .then((queryList)=>{
        var cacheimagePathArray = [];
        const cacheimageLoaderHintsArray = [...Array(queryList.length).keys()].map(function(number){
          return "example://" + String(number);
        });
        for (var i=0;i<queryList.length;i++){
          cacheimagePathArray.push(queryList[i]);
        // cacheArray.push("assets/Test1/0"+String((i-i%100)/100)+String((i-(i-i%100)-i%10)/10)+String(i%10)+".dcm");
      }
      // console.log('abcd');
      console.log(cacheimagePathArray);
      console.log(cacheimageLoaderHintsArray);
      // console.log('abcd');
      this.setState(state => ({
        imagePathArray:cacheimagePathArray,
        imageLoaderHintsArray:cacheimageLoaderHintsArray,
        hardCodeNumDcm:cacheimagePathArray.length
      }));
      dicomLoader(cornerstoneInstance,cacheimagePathArray);
    });

  return loadingResult;


  }



  dicomImage = null;

  displayImage = () => {



    const element = this.dicomImage;
    // Listen for changes to the viewport so we can update the text overlays in the corner
    
    function onImageRendered(e) {
      const viewport = cornerstone.getViewport(e.target);

      document.getElementById("mrbottomleft").textContent = `WW/WC: ${Math.round(viewport.voi.windowWidth)}/${Math.round(viewport.voi.windowCenter)}`;
      document.getElementById("mrbottomright").textContent = `Zoom: ${viewport.scale.toFixed(2)}`;
      //updateOrientationMarkers(e.target, viewport);
    }

    element.addEventListener("cornerstoneimagerendered", onImageRendered);
    
    const config = {

      // invert: true,
      minScale: 0.25,
      maxScale: 20.0,
      preventZoomOutsideImage: true,
    };

    // Comment this out to draw only the top and left markers

    cornerstoneTools.zoom.setConfiguration(config);

    // const wheelEvents = ['mousewheel', 'DOMMouseScroll'];
    // for (var i=0;i<wheelEvents.length;i++){
    //   element.addEventListener(wheelEvents[i],this.wheelEventsHandler);
    // }

    var stack = {
        currentImageIdIndex : 0,
        imageIds: this.state.imageLoaderHintsArray
    };



    // console.log(this.currentstate);
    cornerstone.enable(element);

    cornerstone.loadImage(this.state.imageLoaderHintsArray[stack.currentImageIdIndex]).then(image => {
      cornerstone.displayImage(element, image);

      //Orientation Marker
      var viewport = cornerstone.getViewport(element);

        console.log(this.state.rowCosine);
      if (stack.currentImageIdIndex===0){
        this.setState({
          rowCosine:image.patientOri.slice(0,3),
          columnCosine:image.patientOri.slice(3,6),
        });
      }

      this.calculateOrientationMarkers(element, viewport, this.state);
      this.updateOrientationMarkers(element, viewport);




      cornerstoneTools.mouseInput.enable(element);
      cornerstoneTools.mouseWheelInput.enable(element);
      //cornerstoneTools.touchInput.enable(element);
      // // Enable all tools we want to use with this element
      // cornerstoneTools.wwwc.activate(element, 1); // ww/wc is the default tool for left mouse button
      cornerstoneTools.pan.activate(element, 2); // pan is the default tool for middle mouse button
      cornerstoneTools.zoom.activate(element, 4); // zoom is the default tool for right mouse button
      // cornerstoneTools.zoomWheel.activate(element); // zoom is the default tool for middle mouse wheel
      cornerstoneTools.probe.enable(element);
      cornerstoneTools.length.enable(element);
      cornerstoneTools.ellipticalRoi.enable(element);
      cornerstoneTools.rectangleRoi.enable(element);
      cornerstoneTools.simpleAngle.enable(element);
      cornerstoneTools.highlight.enable(element);
      cornerstoneTools.arrowAnnotate.enable(element);

      // console.log(image.columnPixelSpacing);//<----

      // cornerstoneTools.touchInput.enable(element);
      // cornerstoneTools.zoomTouchPinch.activate(element);
      // cornerstoneTools.panMultiTouch.activate(element);

      //*****Added Play clip

      cornerstoneTools.addStackStateManager(element, ['stack', 'playClip']);
      cornerstoneTools.addToolState(element, 'stack', stack);
      // cornerstoneTools.scrollIndicator.enable(element)

      var playClipToolData = cornerstoneTools.getToolState(element, 'playClip');
      if (!playClipToolData.data.length) {
      playClipToolData.data.push({
        intervalId: undefined,
        framesPerSecond: 30,
        lastFrameTimeStamp: undefined,
        frameRate: 0,
        frameTimeVector: undefined,
        ignoreFrameTimeVector: false,
        usingFrameTimeVector: false,
        speed: 1,
        reverse: false,
        loop: true,
      });
    };
      //*************

      cornerstoneTools.length.setConfiguration({ shadow: this.checked });
      cornerstoneTools.simpleAngle.setConfiguration({ shadow: this.checked });
      cornerstone.updateImage(element);

      // Enable all tools we want to use with this element
      cornerstoneTools.stackScroll.activate(element, 1);//<--------------ui button of enablt scrolling through left button
      cornerstoneTools.stackScrollWheel.activate(element);
      // cornerstoneTools.scrollIndicator.enable(element);
      // Uncomment below to enable stack prefetching
      // With the example images the loading will be extremely quick, though
      // cornerstoneTools.stackPrefetch.enable(element, 3);
    });
  };

  enableTool = (toolName, mouseButtonNumber) => {
    this.disableAllTools();
    console.log(toolName+" "+this.state.currentInteractionMode);
    // cornerstone.enable(this.dicomImage);
    cornerstoneTools.highlight.disable(this.dicomImage);
    cornerstoneTools.highlight.deactivate(this.dicomImage,1);

    if (["pan", "zoom", "stackScroll"].includes(toolName)){
      if (this.state.currentInteractionMode!== 1){
        cornerstoneTools.wwwc.disable(this.dicomImage,1);
        cornerstoneTools.probe.disable(this.dicomImage, 1);
        cornerstoneTools.length.disable(this.dicomImage, 1);
        cornerstoneTools.ellipticalRoi.disable(this.dicomImage, 1);
        cornerstoneTools.rectangleRoi.disable(this.dicomImage, 1);
        cornerstoneTools.simpleAngle.disable(this.dicomImage, 1);
        cornerstoneTools.highlight.disable(this.dicomImage, 1);
        cornerstoneTools.freehand.disable(this.dicomImage, 1);
        cornerstoneTools.arrowAnnotate.disable(this.dicomImage, 1);
        this.setState(state=>({currentInteractionMode:1}));
      }
      else {
          cornerstoneTools.stackScroll.deactivate(this.dicomImage, 1);
          cornerstoneTools.stackScrollTouchDrag.deactivate(this.dicomImage);
          console.log("Abc");
      }

    }
    else if (["probe", "length","ellipticalRoi", "rectangleRoi", "simpleAngle", "arrowAnnotate", "highlight"].includes(toolName)){
      cornerstoneTools.probe.enable(this.dicomImage);     
      cornerstoneTools.length.enable(this.dicomImage);
      cornerstoneTools.ellipticalRoi.enable(this.dicomImage);
      cornerstoneTools.rectangleRoi.enable(this.dicomImage);
      cornerstoneTools.simpleAngle.enable(this.dicomImage);
      cornerstoneTools.highlight.enable(this.dicomImage);
      cornerstoneTools.freehand.enable(this.dicomImage);
      cornerstoneTools.arrowAnnotate.enable(this.dicomImage);
      if (this.state.currentInteractionMode!= 2){
          cornerstoneTools.wwwc.disable(this.dicomImage,1);
          cornerstoneTools.stackScroll.deactivate(this.dicomImage, 1);
          cornerstoneTools.pan.activate(this.dicomImage, 2); // 2 is middle mouse button
          cornerstoneTools.zoom.activate(this.dicomImage, 4); // 4 is right mouse button
          this.setState(state=>({currentInteractionMode:2}));

      }
      else {
        //No disable
        cornerstoneTools.length.deactivate(this.dicomImage, 1);
        cornerstoneTools.ellipticalRoi.deactivate(this.dicomImage, 1);
        cornerstoneTools.rectangleRoi.deactivate(this.dicomImage, 1);
        cornerstoneTools.angle.deactivate(this.dicomImage, 1);
        cornerstoneTools.highlight.deactivate(this.dicomImage, 1);
        cornerstoneTools.freehand.deactivate(this.dicomImage, 1);
      }
    }
    else if (["wwwc"].includes(toolName)){
        cornerstoneTools.zoom.deactivate(this.dicomImage,1);
        cornerstoneTools.pan.deactivate(this.dicomImage,1);

        cornerstoneTools.zoomTouchDrag.deactivate(this.dicomImage);
        cornerstoneTools.panTouchDrag.deactivate(this.dicomImage);
        cornerstoneTools.wwwcTouchDrag.deactivate(this.dicomImage);

        cornerstoneTools.wwwc.disable(this.dicomImage,1);
        cornerstoneTools.probe.disable(this.dicomImage, 1);
        cornerstoneTools.length.disable(this.dicomImage, 1);
        cornerstoneTools.ellipticalRoi.disable(this.dicomImage, 1);
        cornerstoneTools.rectangleRoi.disable(this.dicomImage, 1);
        cornerstoneTools.simpleAngle.disable(this.dicomImage, 1);
        cornerstoneTools.arrowAnnotate.disable(this.dicomImage, 1);
        cornerstoneTools.highlight.disable(this.dicomImage, 1);
        cornerstoneTools.freehand.disable(this.dicomImage, 1);
        cornerstoneTools.stackScroll.deactivate(this.dicomImage, 1);
        cornerstoneTools.pan.activate(this.dicomImage, 2); // 2 is middle mouse button
        cornerstoneTools.zoom.activate(this.dicomImage, 4); // 4 is right mouse button
        this.setState(state=>({currentInteractionMode:3}));
    }

    cornerstoneTools.probe.enable(this.dicomImage);
    cornerstoneTools.length.enable(this.dicomImage);
    cornerstoneTools.ellipticalRoi.enable(this.dicomImage);
    cornerstoneTools.rectangleRoi.enable(this.dicomImage);
    cornerstoneTools.simpleAngle.enable(this.dicomImage);
    cornerstoneTools.highlight.enable(this.dicomImage);
    cornerstoneTools.freehand.enable(this.dicomImage);
    cornerstoneTools.arrowAnnotate.enable(this.dicomImage);   
    cornerstoneTools[toolName].activate(this.dicomImage, mouseButtonNumber);
  };

  // helper function used by the tool button handlers to disable the active tool
  // before making a new tool active
  disableAllTools = () => {
    // cornerstoneTools.wwwc.disable(this.dicomImage,1);
    // cornerstoneTools.probe.disable(this.dicomImage, 1);
    // cornerstoneTools.length.disable(this.dicomImage, 1);
    // cornerstoneTools.ellipticalRoi.disable(this.dicomImage, 1);
    // cornerstoneTools.rectangleRoi.disable(this.dicomImage, 1);
    // cornerstoneTools.angle.disable(this.dicomImage, 1);
    // cornerstoneTools.highlight.disable(this.dicomImage, 1);
    // cornerstoneTools.freehand.disable(this.dicomImage, 1);

    // cornerstoneTools.stackScroll.deactivate(this.dicomImage, 1);
    // cornerstoneTools.pan.activate(this.dicomImage, 2); // 2 is middle mouse button
    // cornerstoneTools.zoom.activate(this.dicomImage, 4); // 4 is right mouse button
  };

  dicomImageRef = el => {
    this.dicomImage = el;
  };


  render() {
    const {series, classes, theme} = this.props
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl)

    if (this.dicomImage !== null)
    {
      if (this.dicomImage.getElementsByClassName("cornerstone-canvas")[0]){
        this.dicomImage.getElementsByClassName("cornerstone-canvas")[0].style.height = 'calc(100vh - 128px - 6px)'
        this.dicomImage.getElementsByClassName("cornerstone-canvas")[0].style.width = 'calc(100%)'
      }
    }
    

    return (
      <div className={classNames(classes.root, {[classes.drawerOpen]: this.props.drawerOpen,})}>
          <AppBar className={classes.appBar}>
            <Toolbar>
                    <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => { this.enableTool("stackScroll", 1);  }}>

                      <NavigationIcon />
                      Navigate
                    </Button>

                    <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => { this.enableTool("wwwc", 1); }}>
                      <Brightness6Icon />
                      Levels
                    </Button>

                    <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {this.enableTool("pan", 3); }}>
                      <OpenWithIcon />
                      Pan
                    </Button>
              
                    <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {this.enableTool("zoom", 5); }}>
                      <SearchIcon />
                      Zoom
                    </Button>

                    <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {this.enableTool("length", 1);}}>
                      <LinearScaleIcon />
                      Length
                    </Button>

                    <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {this.enableTool("simpleAngle", 1);}}>
                      <ArrowBackIosIcon />
                      Angle
                    </Button>

                    <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {this.enableTool("probe", 1);}}>
                      <AdjustIcon />
                      Probe
                    </Button>
                  
                    <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {this.enableTool("ellipticalRoi", 1);}}>
                      <PanoramaFishEyeIcon />
                      Elliptical
                    </Button>

                    <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {this.enableTool("rectangleRoi", 1);}}>
                      <CropDinIcon />
                      Rectangle
                    </Button>
                   
                    <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {this.enableTool("freehand", 1);}}>
                      <FreeFormIcon />
                      Freeform
                    </Button>

                    <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {this.enableTool("highlight", 1);}}>
                      <CropFreeIcon />
                      Highlight
                    </Button>

                    <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {this.enableTool("arrowAnnotate", 1);}}>
                      <AnnotateIcon />
                      Annotate
                    </Button>

                    <Button classes={{label: classes.label}} color="inherit" size="small"
                      onClick={() => {
                        if(this.state.playingClip==false)
                        {
                          const element = this.dicomImage;
                          cornerstoneTools.playClip(element, 31);
                          this.state.playingClip=true;
                        }
                        else
                        {
                          const element = this.dicomImage;
                          cornerstoneTools.stopClip(element, 31);
                          this.state.playingClip=false;
                        }
                      }}
                      >
                      <PlayIcon />
                      Play
                    </Button>

                    <Button classes={{label: classes.label}} color="inherit" size="small" aria-owns={open ? "simple-popper" : null} aria-haspopup="true" variant="contained"
                      onClick={this.handleClick}>
                      <MoreIcon />
                      More
                    </Button>

                    <Popover id="simple-popper" open={open} anchorEl={anchorEl}
                        anchorOrigin={{ vertical: "bottom", horizontal: "center"}}
                        transformOrigin={{vertical: "top", horizontal: "center"}}
                        onClose={this.handleClose}
                    >

                      <Button classes={{label: classes.label}} color="inherit" size="small" 
                          onClick={() => {
                            const element = this.dicomImage;
                            var viewport = cornerstone.getViewport(element);
                            if (viewport.invert === true) {
                                viewport.invert = false;
                            } else {
                                viewport.invert = true;
                            }
                            cornerstone.setViewport(element, viewport);}}
                            >
                        <InvertIcon />
                        Invert
                      </Button>

                      <Button classes={{label: classes.label}} color="inherit" size="small" 
                        onClick={() => {

                          this.anonymized=!this.anonymized;

                          const element = this.dicomImage;
                          var viewport = cornerstone.getViewport(element);

                          if(this.anonymized != true)
                          {
                            document.getElementById("mrbottomleft").style.visibility = "visible";
                            document.getElementById("mrbottomright").style.visibility = "visible";
                            document.getElementById("mrtopleft").style.visibility = "visible";
                            document.getElementById("mrtopright").style.visibility = "visible";
                          }
                          else
                          {
                            document.getElementById("mrbottomleft").style.visibility = "hidden";
                            document.getElementById("mrbottomright").style.visibility = "hidden";;
                            document.getElementById("mrtopleft").style.visibility = "hidden";
                            document.getElementById("mrtopright").style.visibility = "hidden";
                          }
                        }}>
                        <TextIcon />
                        Text
                      </Button>

                      <Button classes={{label: classes.label}} color="inherit" size="small" 
                        onClick={() => {
                          const element = this.dicomImage;
                          const viewport = cornerstone.getViewport(element);
                          viewport.rotation+=90;
                          cornerstone.setViewport(element, viewport);

                          var leftMid = document.querySelector('.mrleftmiddle .orientationMarker');
                          var topMid = document.querySelector('.mrtopmiddle .orientationMarker');
                          var rightMid = document.querySelector('.mrrightmiddle .orientationMarker');
                          var bottomMid = document.querySelector('.mrbottommiddle .orientationMarker');
                          
                          var temp = bottomMid.textContent;
                          bottomMid.textContent = rightMid.textContent;
                          rightMid.textContent=topMid.textContent;
                          topMid.textContent=leftMid.textContent;
                          leftMid.textContent=temp;}}
                          >
                        <RotateRightIcon />
                        Rotate
                      </Button>

                      <Button classes={{label: classes.label}} color="inherit" size="small" 
                        onClick={() => {
                          const element = this.dicomImage;
                          const viewport = cornerstone.getViewport(element);
                          viewport.vflip = !viewport.vflip;
                          cornerstone.setViewport(element, viewport);

                          var topMid = document.querySelector('.mrtopmiddle .orientationMarker');
                          var bottomMid = document.querySelector('.mrbottommiddle .orientationMarker');
                          var temp = topMid.textContent;
                          topMid.textContent = bottomMid.textContent;
                          bottomMid.textContent = temp;}}
                          >
                        <VFlipIcon />
                        Flip V
                      </Button>

                      <Button classes={{label: classes.label}} color="inherit" size="small" 
                        onClick={() => {
                          const element = this.dicomImage;
                          const viewport = cornerstone.getViewport(element);
                          viewport.hflip = !viewport.hflip;
                          cornerstone.setViewport(element, viewport);

                          var rightMid = document.querySelector('.mrrightmiddle .orientationMarker');
                          var leftMid = document.querySelector('.mrleftmiddle .orientationMarker');
                          var temp = rightMid.textContent;
                          rightMid.textContent = leftMid.textContent;
                          leftMid.textContent = temp;}}
                          >
                        <HFlipIcon />
                        Flip H
                      </Button>

                      <Button classes={{label: classes.label}} color="inherit" size="small" 
                        onClick={() => {
                            const element = this.dicomImage;
                            cornerstoneTools.saveAs(element, "image.png");}}
                            >
                        <SaveIcon />
                        Export
                      </Button>

                      <Button classes={{label: classes.label}} color="inherit" size="small" 
                          onClick={() => {
                            const element = this.dicomImage;
                            cornerstoneTools.clearToolState(element, "length");
                            cornerstoneTools.clearToolState(element, "simpleAngle");
                            cornerstoneTools.clearToolState(element, "probe");
                            cornerstoneTools.clearToolState(element, "ellipticalRoi");
                            cornerstoneTools.clearToolState(element, "rectangleRoi");
                            cornerstoneTools.clearToolState(element, "freehand");
                            cornerstoneTools.clearToolState(element, "arrowAnnotate");
                            cornerstoneTools.clearToolState(element, "highlight");
                            cornerstone.updateImage(element);}}
                          >
                        <ClearIcon />
                        Clear
                      </Button>

                      <Button classes={{label: classes.label}} color="inherit" size="small" 
                        onClick={() => {
                          const element = this.dicomImage;
                          cornerstone.reset(element);

                          const viewport = cornerstone.getViewport(element);
                          viewport.hflip = false;
                          viewport.vflip = false;
                          viewport.rotation = 0;
                          cornerstone.setViewport(element, viewport);
                          this.calculateOrientationMarkers(element, viewport,this.state);
                          }}
                          >
                        <ReplayIcon />
                        Reset
                      </Button>
                    </Popover>             
            </Toolbar>
          </AppBar>

        <Paper className={classNames(classes.paper, {[classes.paperDrawerOpen]: this.props.drawerOpen,})}>
          <div
            style={this.props.drawerOpen? {
              // flexGrow: 1,    
              // display: 'flex',
              width: "calc(100vw - 240px - 6px)",
              height: "calc(100vh - 128px - 6px)",
              position: "relative",
              color: "yellow",
              // margin: 9
            } :
            {
              width: "calc(100vw - 6px)",
              height: "calc(100vh - 128px - 6px)",
              position: "relative",
              color: "yellow",
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
                  width: "100%",
                  height: "calc(100vh - 128px - 6px)",
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

              <div id="mrbottomleft" style={{ position: "absolute", bottom: "0.5%", left: "0.5%" }}>
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
        </Paper>

      </div>

    );
  }
}

export default withStyles(styles)(DicomViewer);


//<div class="orientationMarkers" style={{borderStyle:"solid", borderColor:"red",position: "absolute", top: "0%", left: "0%", width: viewerWidth, height: viewerHeight}}>