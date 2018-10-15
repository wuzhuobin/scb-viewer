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
import EditIcon from '@material-ui/icons/Edit';
import CropFreeIcon from '@material-ui/icons/CropFree';
import NavigationIcon from '@material-ui/icons/NavigationOutlined';
import MoreIcon from '@material-ui/icons/AddCircleOutline';
import ClearIcon from '@material-ui/icons/DeleteOutlined';
import InvertIcon from '@material-ui/icons/Tonality';
import VFlipIcon from '@material-ui/icons/MoreVert';
import HFlipIcon from '@material-ui/icons/MoreHoriz';
import RotateRightIcon from '@material-ui/icons/RotateRight';
import ReplayIcon from '@material-ui/icons/Replay';


import Grid from '@material-ui/core/Grid';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

const styles = theme=> ({
    root:{    
        zIndex: 1,
        display: 'flex',
        height: '93vh',
        backgroundColor: theme.palette.background.default,
        minWidth: 0, // So the Typography noWrap works
        padding: 0,
    },

    appBar:{
            // flexGrow: 1,
            zIndex: 1,
            // width: '100%',
            overflow: 'auto',
            display: 'flex',
            position: 'relative',
            // display: 'flex',
    },

    functionBar:{
          width: '100%',
          overflow: 'auto',
            },

    label: {
    // Aligns the content of the button vertically.
      flexDirection: 'column'
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
    }
  }


  componentWillMount() {
    cornerstoneTools.external.cornerstone = cornerstone;
    cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
    cornerstoneTools.external.Hammer = Hammer;
  }

  componentDidMount() {
    this.readImage(this.state, cornerstone).then(res=>this.displayImage());
  }

  getImagePathList(IP,Port,GET){//sync request for now
    // return ['./assets/Test1/0000.dcm'];
    // return ['http://192.168.1.126:3000/orthanc/instances/2d3e243d-8b918a6f-b3456d3e-0546d044-dab91ee0/file'];
    // return ['http://127.0.0.1:8080/0100.dcm'];
    
    // return new Promise(function(resolve,reject){
    //   resolve(['http://127.0.0.1:8080/0100.dcm','http://127.0.0.1:8080/0010.dcm','http://127.0.0.1:8080/0400.dcm','http://127.0.0.1:8080/0250.dcm','http://127.0.0.1:8080/0410.dcm']);
    // })

    return new Promise(function(resolve,reject){
      var queryResult =   fetch("http://223.255.146.2:8042/orthanc/series/" + GET).
      then((res)=>{return res.json();}).
      then((json)=>{ 
        let cacheImagePathArray = [];
        for(let i = 0; i < json.Instances.length; ++i){
          let path = "http://192.168.1.126:3000/orthanc/instances/" + json.Instances[i] + "/file"; 
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


  readImage(state, cornerstoneInstance){
      //Get image path Array first
      const loadingResult = this.getImagePathList(1,1,"cf8192f8-50e817d9-2aae4764-3c85d142-dc59a8d0")
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
    }

    element.addEventListener("cornerstoneimagerendered", onImageRendered);
    
    const config = {

      // invert: true,
      minScale: 0.25,
      maxScale: 20.0,
      preventZoomOutsideImage: true,
    };

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
      cornerstoneTools.mouseInput.enable(element);
      cornerstoneTools.mouseWheelInput.enable(element);
      // // Enable all tools we want to use with this element
      cornerstoneTools.wwwc.activate(element, 1); // ww/wc is the default tool for left mouse button
      cornerstoneTools.pan.activate(element, 2); // pan is the default tool for middle mouse button
      cornerstoneTools.zoom.activate(element, 4); // zoom is the default tool for right mouse button
      // cornerstoneTools.zoomWheel.activate(element); // zoom is the default tool for middle mouse wheel
      cornerstoneTools.probe.enable(element);
      cornerstoneTools.length.enable(element);
      cornerstoneTools.ellipticalRoi.enable(element);
      cornerstoneTools.rectangleRoi.enable(element);
      cornerstoneTools.angle.enable(element);
      cornerstoneTools.highlight.enable(element);

      cornerstoneTools.addStackStateManager(element, ['stack']);
      cornerstoneTools.addToolState(element, 'stack', stack);

      cornerstoneTools.length.setConfiguration({ shadow: this.checked });
      cornerstoneTools.angle.setConfiguration({ shadow: this.checked });
      cornerstone.updateImage(element);

      // Enable all tools we want to use with this element
      //cornerstoneTools.stackScroll.activate(element, 1);//<--------------ui button of enablt scrolling through left button
      cornerstoneTools.stackScrollWheel.activate(element);

      // Uncomment below to enable stack prefetching
      // With the example images the loading will be extremely quick, though
      // cornerstoneTools.stackPrefetch.enable(element, 3);
    });
  };

  enableTool = (toolName, mouseButtonNumber) => {
    this.disableAllTools();
    cornerstoneTools[toolName].activate(this.dicomImage, mouseButtonNumber);
  };

  // helper function used by the tool button handlers to disable the active tool
  // before making a new tool active
  disableAllTools = () => {
    cornerstoneTools.wwwc.disable(this.dicomImage);
    cornerstoneTools.pan.activate(this.dicomImage, 2); // 2 is middle mouse button
    cornerstoneTools.zoom.activate(this.dicomImage, 4); // 4 is right mouse button
    cornerstoneTools.probe.deactivate(this.dicomImage, 1);
    cornerstoneTools.length.deactivate(this.dicomImage, 1);
    cornerstoneTools.ellipticalRoi.deactivate(this.dicomImage, 1);
    cornerstoneTools.rectangleRoi.deactivate(this.dicomImage, 1);
    cornerstoneTools.angle.deactivate(this.dicomImage, 1);
    cornerstoneTools.highlight.deactivate(this.dicomImage, 1);
    cornerstoneTools.freehand.deactivate(this.dicomImage, 1);
  };

  dicomImageRef = el => {
    this.dicomImage = el;
  };


  render() {
    const {classes} = this.props

    return (
      <div className={classes.root}>
           <div className={classes.functionBar}>
              <AppBar position="static" className={classes.appBar}>
                <ToggleButtonGroup exclusive >

                    <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => { this.enableTool("wwwc", 1); }}>
                      <NavigationIcon />
                      Navigate
                    </Button>

                    <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => { this.enableTool("wwwc", 1); }}>
                      <Brightness6Icon />
                      Levels
                    </Button>

                    <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {this.enableTool("pan", 3);}}>
                      <OpenWithIcon />
                      Pan
                    </Button>
              
                    <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {this.enableTool("zoom", 5);}}>
                      <SearchIcon />
                      Zoom
                    </Button>

                    <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {this.enableTool("length", 1);}}>
                      <LinearScaleIcon />
                      Length
                    </Button>

                    <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {this.enableTool("angle", 1);}}>
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
                      <EditIcon />
                      Freeform
                    </Button>

                    <Button classes={{label: classes.label}} color="inherit" size="small" 
                      onClick={() => {
                        const element = this.dicomImage;
                        const viewport = cornerstone.getViewport(element);
                        viewport.rotation+=90;
                        cornerstone.setViewport(element, viewport);}}
                        >
                      <RotateRightIcon />
                      Rotatet
                    </Button>

                    <Button classes={{label: classes.label}} color="inherit" size="small" 
                      onClick={() => {
                        const element = this.dicomImage;
                        const viewport = cornerstone.getViewport(element);
                        viewport.vflip = !viewport.vflip;
                        cornerstone.setViewport(element, viewport);}}
                        >
                      <VFlipIcon />
                      Flip V
                    </Button>

                    <Button classes={{label: classes.label}} color="inherit" size="small" 
                      onClick={() => {
                        const element = this.dicomImage;
                        const viewport = cornerstone.getViewport(element);
                        viewport.hflip = !viewport.hflip;
                        cornerstone.setViewport(element, viewport);}}
                        >
                      <HFlipIcon />
                      Flip H
                    </Button>

                    <Button classes={{label: classes.label}} color="inherit" size="small" 
                      onClick={() => {
                        const element = this.dicomImage;
                        cornerstone.reset(element);}}
                        >
                      <ReplayIcon />
                      Reset
                    </Button>


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

                    <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {this.enableTool("highlight", 1);}}>
                      <CropFreeIcon />
                      Highlight
                    </Button>

                    <Button classes={{label: classes.label}} color="inherit" size="small" 
                        onClick={() => {
                          const element = this.dicomImage;
                          var toolStateManager = cornerstoneTools.getElementToolStateManager(element);
                          toolStateManager.clear(element)
                          cornerstone.updateImage(element);}}
                        >
                      <ClearIcon />
                      Clear
                    </Button>

                    <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {}}>
                      <MoreIcon />
                      More
                    </Button>

                </ToggleButtonGroup>
              </AppBar>

              <div
                style={{
                  flexGrow: 1,    
                  display: 'flex',
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  display: "inline-block",
                  color: "yellow"
                }}
                onContextMenu={() => false}
                className="cornerstone-enabled-image"
                unselectable="on"
                onSelectStart={() => false}
                onMouseDown={() => false}
            >
              
              <div
                ref={this.dicomImageRef}
                style={{
                  flexGrow: 1,    
                  display: 'flex',
                  width: "100%",
                  height: "100%",
                  top: 0,
                  left: 0,
                  position: "relative",
                }}
              />

              <div id="mrtopleft" style={{ position: "absolute", top: 3, left: 3 }}>
                Patient Name: Chan Tai Man
              </div>
              
              <div id="mrtopright" style={{ position: "absolute", top: 3, right: 3 }}>
                Hospital: PWH
              </div>
              
              <div id="mrbottomright" style={{ position: "absolute", bottom: 3, right: 3 }}>
                Zoom:
              </div>

              <div id="mrbottomleft" style={{ position: "absolute", bottom: 3, left: 3 }}>
                WW/WC:
              </div>

          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(DicomViewer);