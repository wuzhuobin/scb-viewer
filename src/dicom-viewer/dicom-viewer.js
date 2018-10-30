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
import Typography from '@material-ui/core/Typography';

import classNames from 'classnames';

import SeriesPreviewVertical from '../components/SeriesPreviewVertical'

const styles = theme=> ({
    root:{    
        width: '100vw',
        height: 'calc(100vh - 128px)',
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
      selectedSeries: null,
      loader:null,
      previousLoaderHint:null,
      dicomImage:null,
    };

  }

  componentWillReceiveProps(nextProps) {
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
    this.readImage(this.props, this.state, cornerstone).then(res=>this.displayImage())
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

  componentDidMount() {
    console.log("did mount")
    window.addEventListener('resize', (event)=>{this.handleResize(event, this.dicomImage)})
  }

  getImagePathList(IP,Port,Path1){//sync request for now
    // return ['./assets/Test1/0000.dcm'];
    // return ['http://192.168.1.126:3000/orthanc/instances/2d3e243d-8b918a6f-b3456d3e-0546d044-dab91ee0/file'];
    // return ['http://127.0.0.1:8080/0100.dcm'];
    
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
    // console.log(cacheImagePathArray);
    return cacheImagePathArray;
   });
} 


  readImage(props, state, cornerstoneInstance){
      //Get image path Array first
      const loadingResult = this.getImagePathList(1,1,state.selectedSeries)
      .then((queryList)=>{
        console.log(queryList)

        console.log(this.state.selectedSeries)
        var cacheimagePathArray = [];
        var loaderHint = "";
        if (this.state.selectedSeries){
          loaderHint = this.state.selectedSeries;
        }
        else {
          loaderHint = "noImage";
        }
        const cacheimageLoaderHintsArray = [...Array(queryList.length).keys()].map(function(number){
          return loaderHint+"://" + String(number);
        });
        if (this.state.previousLoaderHint && this.state.previousLoaderHint!==loaderHint){
          for (var j=0;j<this.state.imageLoaderHintsArray.length;j++){
            try{
              cornerstone.imageCache.removeImageLoadObject(this.state.imageLoaderHintsArray[j]);
            }
            catch(error){
              console.log(j+"-th image no need to delete, "+ this.state.imageLoaderHintsArray[j]);
            }
          }
        }




        for (var i=0;i<queryList.length;i++){
          cacheimagePathArray.push(queryList[i]);
        // cacheArray.push("assets/Test1/0"+String((i-i%100)/100)+String((i-(i-i%100)-i%10)/10)+String(i%10)+".dcm");
      }
      this.setState(state => ({
        imagePathArray:cacheimagePathArray,
        imageLoaderHintsArray:cacheimageLoaderHintsArray,
        hardCodeNumDcm:cacheimagePathArray.length,
        previousLoaderHint:loaderHint,
        loader:dicomLoader(cornerstoneInstance,cacheimagePathArray,loaderHint),
      }));
      // dicomLoader(cornerstoneInstance,cacheimagePathArray,loaderHint);
    });

  console.log('loading result')
  console.log(loadingResult)

  return loadingResult;
  }

  

  displayImage = () => {

    const element = this.dicomImage;


    var stack = {
        currentImageIdIndex : parseInt((this.state.imageLoaderHintsArray.length / 2)|0),
        imageIds: this.state.imageLoaderHintsArray
    };

    var flagContinue = true;
    try{
      cornerstone.enable(element);
    }
    catch(error){
      console.log("cornerstone load abort");
      flagContinue = false;
    }
    if (flagContinue===false){
      return;
    }
    // cornerstone.enable(element);

    cornerstone.loadImage(this.state.imageLoaderHintsArray[stack.currentImageIdIndex]).then(image => {
      cornerstone.displayImage(element, image);
      //Orientation Marker
      var viewport = cornerstone.getViewport(element);

      // console.log(image.getPixelData());
      if (stack.currentImageIdIndex===parseInt((this.state.imageLoaderHintsArray.length / 2)|0)){
        if (image.patientOri){
          this.setState({
          rowCosine:image.patientOri.slice(0,3),
          columnCosine:image.patientOri.slice(3,6),
        });
        }
        if (document.getElementById("mrtopleft")){
          document.getElementById("mrtopleft").textContent = `Patient Name: ${image.patientName}`
        }
      }

      element.style.height = 'calc(100vh - 128px - 2px)'
      element.style.width = '100%'
      try{
          cornerstone.resize(element)          
      }
      catch(error)
      {
        console.log(error)
      }

      this.calculateOrientationMarkers(element, viewport, this.state);

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

      cornerstoneTools.touchInput.enable(element);
      cornerstoneTools.zoomTouchPinch.activate(element);
      cornerstoneTools.panMultiTouch.activate(element);
      cornerstoneTools.stackScrollTouchDrag.activate(element);

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

    function onImageRendered(e) {
      const viewport = cornerstone.getViewport(e.target);


      // var bottomLeftTag = document.getElementById("mrbottomleft"), bottomRightTag = document.getElementById("mrbottomright");
      // if (bottomLeftTag){
      //   bottomLeftTag.textContent = `WW/WC: ${Math.round(viewport.voi.windowWidth)}/${Math.round(viewport.voi.windowCenter)} , Slices: ${stack.currentImageIdIndex+1}/${stack.imageIds.length}`;
      // }
      // if (bottomRightTag){
      //   bottomRightTag.textContent = `Zoom: ${viewport.scale.toFixed(2)}`;
      // }


      //document.getElementById("mrbottomleft").setAttribute('style', 'white-space: pre;');
      if (document.getElementById("mrbottomleft")){
        document.getElementById("mrbottomleft").textContent = `Slices: ${stack.currentImageIdIndex+1}/${stack.imageIds.length}`;
        document.getElementById("mrbottomleft").textContent += "\r\n";
        document.getElementById("mrbottomleft").textContent += `WW/WC: ${Math.round(viewport.voi.windowWidth)}/${Math.round(viewport.voi.windowCenter)}`;
      }
      if (document.getElementById("mrbottomright")){
        document.getElementById("mrbottomright").textContent = `Zoom: ${viewport.scale.toFixed(2)}`;
      }

    }

    element.addEventListener("cornerstoneimagerendered", onImageRendered);
    
    const config = {

      // invert: true,
      minScale: 0.25,
      maxScale: 20.0,
      preventZoomOutsideImage: true,
    };

    cornerstoneTools.zoom.setConfiguration(config);
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
          cornerstoneTools.pan.deactivate(this.dicomImage,1);
          cornerstoneTools.zoom.deactivate(this.dicomImage,1);
          cornerstoneTools.stackScroll.deactivate(this.dicomImage, 1);
          cornerstoneTools.stackScrollTouchDrag.deactivate(this.dicomImage);
          cornerstoneTools.pan.activate(this.dicomImage, 2); // pan is the default tool for middle mouse button
          cornerstoneTools.zoom.activate(this.dicomImage, 4); // zoom is the default tool for right mouse button
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
        cornerstoneTools.panTouchDrag.deactivate(this.dicomImage);
        cornerstoneTools.rotateTouchDrag.deactivate(this.dicomImage);
        cornerstoneTools.rotateTouch.disable(this.dicomImage);
        cornerstoneTools.ellipticalRoiTouch.deactivate(this.dicomImage);
        cornerstoneTools.simpleAngleTouch.deactivate(this.dicomImage);
        cornerstoneTools.rectangleRoiTouch.deactivate(this.dicomImage);
        cornerstoneTools.lengthTouch.deactivate(this.dicomImage);
        cornerstoneTools.probeTouch.deactivate(this.dicomImage);
        cornerstoneTools.zoomTouchDrag.deactivate(this.dicomImage);
        cornerstoneTools.wwwcTouchDrag.deactivate(this.dicomImage);
        cornerstoneTools.stackScrollTouchDrag.deactivate(this.dicomImage);
        cornerstoneTools.arrowAnnotateTouch.deactivate(this.dicomImage);
  };

  dicomImageRef = el => {
    this.dicomImage = el;
  };

  onSelectSeries = (event, series)=>{
      this.setState({selectedSeries: series}, ()=>
        this.readImage(this.props, this.state, cornerstoneTools.external.cornerstone).then(res=>this.displayImage()));
  }

  render() {
    const {selectedSeries, series, classes, theme} = this.props
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl)

    return (
      <div className={classNames(classes.root, {[classes.drawerOpen]: this.props.drawerOpen,})}>
          <AppBar className={classes.appBar}>
            <Toolbar>
                    <Button classes={{label: classes.label}} color="inherit" onClick={() => { this.enableTool("stackScroll", 1);  cornerstoneTools.stackScrollTouchDrag.activate(this.dicomImage);}}>
                      <NavigationIcon />
                      Navigate
                    </Button>

                    <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => { this.enableTool("wwwc", 1);  cornerstoneTools.wwwcTouchDrag.activate(this.dicomImage); }}>
                      <Brightness6Icon />
                      Levels
                    </Button>

                    <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {this.enableTool("pan", 3);  cornerstoneTools.panTouchDrag.activate(this.dicomImage); }}>
                      <OpenWithIcon />
                      Pan
                    </Button>
              
                    <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {this.enableTool("zoom", 5);  cornerstoneTools.zoomTouchDrag.activate(this.dicomImage); }}>
                      <SearchIcon />
                      Zoom
                    </Button>

                    <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {this.enableTool("length", 1); cornerstoneTools.lengthTouch.activate(this.dicomImage); }}>
                      <LinearScaleIcon />
                      Length
                    </Button>

                    <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {this.enableTool("simpleAngle", 1); cornerstoneTools.simpleAngleTouch.activate(this.dicomImage); }}>
                      <ArrowBackIosIcon />
                      Angle
                    </Button>

                    <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {this.enableTool("probe", 1); cornerstoneTools.probeTouch.activate(this.dicomImage); }}>
                      <AdjustIcon />
                      Probe
                    </Button>
                  
                    <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {this.enableTool("ellipticalRoi", 1); cornerstoneTools.ellipticalRoiTouch.activate(this.dicomImage); }}>
                      <PanoramaFishEyeIcon />
                      Elliptical
                    </Button>

                    <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {this.enableTool("rectangleRoi", 1); cornerstoneTools.rectangleRoiTouch.activate(this.dicomImage); }}>
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

                    <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {this.enableTool("arrowAnnotate", 1); cornerstoneTools.arrowAnnotateTouch.activate(this.dicomImage);}}>
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
              // margin: 9
            } :
            {
              width: "calc(100vw - 2px - 170px)",
              height: "calc(100vh - 128px - 2px)",
              position: "relative",
              color: "#6fcbff",
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
        </Paper>

      </div>

    );
  }
}

export default withStyles(styles)(DicomViewer);


//<div class="orientationMarkers" style={{borderStyle:"solid", borderColor:"red",position: "absolute", top: "0%", left: "0%", width: viewerWidth, height: viewerHeight}}>