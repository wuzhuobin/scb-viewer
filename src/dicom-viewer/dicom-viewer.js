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
      // loader:dcmLoader.GlobalDcmLoadManager,
      previousLoaderHint:null,
      dicomImage:null,
      loadingProgress: 100,
      infoDialog:false,
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
    var enabledElement = cornerstone.getEnabledElement(element);
    var imagePlaneMetaData = cornerstone.metaData.get('imagePlaneModule', enabledElement.image.imageId);
    console.log(imagePlaneMetaData);

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
    this.setState({loader:dcmLoader.GlobalDcmLoadManager});
  }

  componentWillUnmount(){
    console.log("unmount");

    const element  = this.dicomImage;
    // const stackToolData = cornerstoneTools.getToolState(element, 'stack');
    // const stackactive = stackToolData.data[0];
    // cornerstone.disable(this.dicomImage);
    // cornerstone.disable(this.dicomImage);

    cornerstoneTools.mouseInput.disable(element);
    cornerstoneTools.mouseWheelInput.disable(element);
    //cornerstoneTools.touchInput.enable(element);
    // // Enable all tools we want to use with this element
    // cornerstoneTools.wwwc.activate(element, 1); // ww/wc is the default tool for left mouse button
    cornerstoneTools.pan.deactivate(element, 2); // pan is the default tool for middle mouse button
    cornerstoneTools.zoom.deactivate(element, 4); // zoom is the default tool for right mouse button
    // cornerstoneTools.zoomWheel.activate(element); // zoom is the default tool for middle mouse wheel
    cornerstoneTools.probe.disable(element);
    cornerstoneTools.length.disable(element);
    cornerstoneTools.ellipticalRoi.disable(element);
    cornerstoneTools.rectangleRoi.disable(element);
    cornerstoneTools.simpleAngle.disable(element);
    cornerstoneTools.highlight.disable(element);
    cornerstoneTools.arrowAnnotate.disable(element);

    cornerstoneTools.touchInput.disable(element);
    cornerstoneTools.zoomTouchPinch.deactivate(element);
    cornerstoneTools.panMultiTouch.deactivate(element);
    cornerstoneTools.stackScrollTouchDrag.deactivate(element);

    //*****Added Play clip

    // cornerstoneTools.removeStackStateManager(element, ['stack', 'playClip']);
    // cornerstoneTools.clearToolState(element, 'stack', stackactive);
    // cornerstoneTools.scrollIndicator.enable(element)
    cornerstone.disable(element);

    console.log(dcmLoader.GlobalDcmLoadManager)
    console.log(this.state.previousLoaderHint)
    dcmLoader.GlobalDcmLoadManager.removeSeries(this.state.previousLoaderHint)
    this.setState((state) =>{
        return{
        loader: state.loader.removeSeries(state.previousLoaderHint),
      }});

    console.log("unmount done");

  }

  handleResize(event,dicomImage){
    console.log(dcmLoader.GlobalDcmLoadManager)
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

  handleInfoDialogOpen = () => {
    this.setState({infoDialog: true});
  }

  handleInfoDialogClose = () =>{
    this.setState({infoDialog:false});
  }

  componentDidMount() {
    console.log("did mount")
    cornerstone.enable(this.dicomImage)
    this.readImage(this.props, this.state, cornerstone).then(res=>this.displayImage());
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


  readImage(props, state){
      //Get image path Array first
      const loadingResult = this.getImagePathList(1,1,state.selectedSeries)
      .then((queryList)=>{
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


        for (var i=0;i<queryList.length;i++){
          cacheimagePathArray.push(queryList[i]);
        // cacheArray.push("assets/Test1/0"+String((i-i%100)/100)+String((i-(i-i%100)-i%10)/10)+String(i%10)+".dcm");
      }

      // const stateLoader = this.state.loader;
      // stateLoader.loadSeries(cacheimagePathArray, loaderHint);
      this.setState((state) =>{
        return{
        imagePathArray: cacheimagePathArray,
        imageLoaderHintsArray: cacheimageLoaderHintsArray,
        hardCodeNumDcm: cacheimagePathArray.length,
        previousLoaderHint: loaderHint,
        loader: dcmLoader.GlobalDcmLoadManager.loadSeries(cacheimagePathArray, loaderHint),
      }});
      // dicomLoader(cornerstoneInstance,cacheimagePathArray,loaderHint);

    });

  // console.log('loading result')
  // console.log(loadingResult)

  return loadingResult;
  }

  

  displayImage = () => {
    console.log("display!!!!!!!!!!!!")
    const element = this.dicomImage;


    var stack = {
        currentImageIdIndex : parseInt((this.state.imageLoaderHintsArray.length / 2)|0),
        imageIds: this.state.imageLoaderHintsArray
    };

    var flagContinue = true;


    if (flagContinue===false){
      return;
    }
    cornerstone.enable(element);

    cornerstone.loadImage(this.state.imageLoaderHintsArray[stack.currentImageIdIndex]).then(image => {
      console.log(image)
      // cornerstone.displayImage(element, {width:512, height: 512});
      cornerstone.displayImage(element, image);
      //Orientation Marker
      var viewport = cornerstone.getViewport(element);

      // console.log(image.getPixelData());
      if (stack.currentImageIdIndex===parseInt((this.state.imageLoaderHintsArray.length / 2)|0)){
        console.log(image);
        if (image.patientOri){
          this.setState({
          rowCosine:image.patientOri.slice(0,3),
          columnCosine:image.patientOri.slice(3,6),
        });
        }

        if (document.getElementById("mrtopleft")){
          document.getElementById("mrtopleft").textContent = `${image.patientName}`
        }

        if (document.getElementById("mrtopright")){
          document.getElementById("mrtopright").textContent = `${image.institutionName}`
          document.getElementById("mrtopright").textContent += "\r\n";  
          document.getElementById("mrtopright").textContent += `${image.studyDescription}`;  
          document.getElementById("mrtopright").textContent += "\r\n";  
          document.getElementById("mrtopright").textContent += `${image.seriesDescription}`;  
          document.getElementById("mrtopright").textContent += "\r\n";  
          document.getElementById("mrtopright").textContent += `${image.studyDate}`;  

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
        
      }

      if (document.getElementById("mrbottomright")){
        document.getElementById("mrbottomright").textContent = `Zoom: ${viewport.scale.toFixed(2)*100}%`;
        document.getElementById("mrbottomright").textContent += "\r\n";
        document.getElementById("mrbottomright").textContent += `W:${Math.round(viewport.voi.windowWidth)} L:${Math.round(viewport.voi.windowCenter)}`;
        
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
      this.setState({loadingProgress: 0})
      this.setState({selectedSeries: series}, ()=>
        this.readImage(this.props, this.state).then(
          res=>{
            this.displayImage();
          }));
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

              <div id="mrtopleft" style={{ position: "absolute", top: "0.5%", left: "0.5%", whiteSpace: 'pre' }}>
                
              </div>
              
              <div id="mrtopright" style={{ position: "absolute", top: "0.5%", right: "0.5%", whiteSpace: 'pre', textAlign:"right" }}>
                
              </div>
              
              <div id="mrbottomright" style={{ position: "absolute", bottom: "0.5%", right: "0.5%", whiteSpace: 'pre', textAlign:"right"  }}>
               
              </div>

              <div id="mrbottomleft" style={{ position: "absolute", bottom: "0.5%", left: "0.5%", whiteSpace: 'pre'}}>
               
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