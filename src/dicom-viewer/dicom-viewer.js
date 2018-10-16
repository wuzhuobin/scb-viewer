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
import SaveIcon from '@material-ui/icons/SaveAlt';
import TextIcon from '@material-ui/icons/Title';

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

const styles = theme=> ({
    root:{    
        width: '100%',
        // flexGrow: 1,
    },
    
    appBar:{
          flexGrow: 1,    
          zIndex: 1,
          overflow: 'hidden',
          position: 'static',
          display: 'flex',
          height: '64px',
          justifyContent: 'center',
          background: theme.palette.secondary.main
        },

     paper:{
      padding: 0,
      borderColor: theme.palette.primary.main,
      borderStyle: "solid",
      borderRadius:"0px",
     },

    label: {
    // Aligns the content of the button vertically.
      flexDirection: 'column',
    },
})

class DicomViewer extends React.Component {
  
  dicomImage = null;

  constructor(props) {
        super(props);
        this.anonymized= false;
  }

  componentWillMount() {
    cornerstoneTools.external.cornerstone = cornerstone;
    cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
    cornerstoneTools.external.Hammer = Hammer;
    dicomLoader(cornerstone);
  }
  
  componentDidMount() {
    this.loadImage();
  }

  loadImage = () => {
    
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

    // Comment this out to draw only the top and left markers

    cornerstoneTools.zoom.setConfiguration(config);

    const imageId = "example://1";
    cornerstone.enable(element);
    cornerstoneTools.mouseInput.enable(element);
    cornerstoneTools.touchInput.enable(element);
    cornerstoneTools.mouseWheelInput.enable(element);

    cornerstone.loadImage(imageId).then(image => {
    cornerstone.displayImage(element, image);
    // // Enable all tools we want to use with this element
    cornerstoneTools.wwwc.activate(element, 1); // ww/wc is the default tool for left mouse button
    cornerstoneTools.pan.activate(element, 2); // pan is the default tool for middle mouse button
    cornerstoneTools.zoom.activate(element, 4); // zoom is the default tool for right mouse button
    cornerstoneTools.zoomWheel.activate(element); // zoom is the default tool for middle mouse wheel
    cornerstoneTools.probe.enable(element);
    cornerstoneTools.length.enable(element);
    cornerstoneTools.ellipticalRoi.enable(element);
    cornerstoneTools.rectangleRoi.enable(element);
    cornerstoneTools.angle.enable(element);
    cornerstoneTools.highlight.enable(element);
    cornerstoneTools.arrowAnnotate.enable(element);
    //cornerstoneTools.scaleOverlayTool.enable(element);

    cornerstoneTools.length.setConfiguration({ shadow: this.checked });
    cornerstoneTools.simpleAngle.setConfiguration({ shadow: this.checked });
  

    cornerstone.updateImage(element);

    // var enabledElement = cornerstone.getEnabledElement(element);
    // var imagePlaneMetaData = cornerstone.metaData.get('imagePlaneModule', enabledElement.image.imageId);
  
    // var rowString = cornerstoneTools.orientation.getOrientationString(imagePlaneMetaData.rowCosines);
    // var columnString = cornerstoneTools.orientation.getOrientationString(imagePlaneMetaData.columnCosines);

    // var oppositeRowString = cornerstoneTools.orientation.invertOrientationString(rowString);
    // var oppositeColumnString = cornerstoneTools.orientation.invertOrientationString(columnString);

    // console.log(imagePlaneMetaData);
    // console.log(rowString);
    // console.log(columnString);
    // console.log(oppositeRowString);
    // console.log(oppositeColumnString);

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
    cornerstoneTools.simpleAngle.deactivate(this.dicomImage, 1);
    cornerstoneTools.highlight.deactivate(this.dicomImage, 1);
    cornerstoneTools.freehand.deactivate(this.dicomImage, 1);
    cornerstoneTools.arrowAnnotate.deactivate(this.dicomImage, 1);
  };

  dicomImageRef = el => {
    this.dicomImage = el;
  };


  render() {
    const {classes, theme} = this.props

    var viewerHeight = window.innerHeight-128-6 //4 is border
    var viewerWidth = window.viewerWidth-128-6 //4 is border
    return (
      <div className={classes.root}>
          <AppBar className={classes.appBar}>
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
                      <EditIcon />
                      Freeform
                    </Button>

                    <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {this.enableTool("arrowAnnotate", 1);}}>
                      <EditIcon />
                      Annotate
                    </Button>

                    <Button classes={{label: classes.label}} color="inherit" size="small" 
                      onClick={() => {
                        const element = this.dicomImage;
                        const viewport = cornerstone.getViewport(element);
                        viewport.rotation+=90;
                        cornerstone.setViewport(element, viewport);}}
                        >
                      <RotateRightIcon />
                      Rotate
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
                        cornerstone.reset(element);
                        }}
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
                          var toolStateManager = cornerstoneTools.getElementToolStateManager(element);
                          toolStateManager.clear(element)
                          cornerstone.updateImage(element);}}
                        >
                      <ClearIcon />
                      Clear
                    </Button>

                    <Button classes={{label: classes.label}} color="inherit" size="small" 
                        onClick={() => {
                          const element = this.dicomImage;
                          cornerstoneTools.saveAs(element, "image.png");}}
                          >
                      <SaveIcon />
                      Save
                    </Button>

                    <Button classes={{label: classes.label}} color="inherit" size="small" onClick={() => {}}>
                      <MoreIcon />
                      More
                    </Button>

            </ToggleButtonGroup>
          </AppBar>

        <Paper className={classes.paper}>
          <div
            style={{
              // flexGrow: 1,    
              // display: 'flex',
              // width: "calc(100vw-4px)",
              // height: "calc(100vh-4px)",
              position: "relative",
              color: "yellow",
              // margin: 9
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
                  // flexGrow: 1,    
                  // display: 'flex',
                  // width: "calc(100vw-4px)",
                  // height: "calc(100vh-4px)",
                  width: viewerWidth,
                  height: viewerHeight,
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
        </Paper>
      </div>

    );
  }
}

export default withStyles(styles)(DicomViewer);