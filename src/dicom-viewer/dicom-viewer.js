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
import Brightness6Icon from '@material-ui/icons/Brightness6';
import OpenWithIcon from '@material-ui/icons/OpenWith';
import SearchIcon from '@material-ui/icons/Search';
import StraightenIcon from '@material-ui/icons/Straighten';
import AdjustIcon from '@material-ui/icons/Adjust';
import PanoramaFishEyeIcon from '@material-ui/icons/PanoramaFishEye';
import CropDinIcon from '@material-ui/icons/CropDin';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import EditIcon from '@material-ui/icons/Edit';

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
            }
})

class DicomViewer extends React.Component {
  componentWillMount() {
    cornerstoneTools.external.cornerstone = cornerstone;
    cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
    cornerstoneTools.external.Hammer = Hammer;
    dicomLoader(cornerstone);
  }
  componentDidMount() {
    this.loadImage();
  }
  dicomImage = null;
  loadImage = () => {
    const element = this.dicomImage;
    // Listen for changes to the viewport so we can update the text overlays in the corner
    function onImageRendered(e) {
      const viewport = cornerstone.getViewport(e.target);
      document.getElementById(
        "mrbottomleft"
      ).textContent = `WW/WC: ${Math.round(
        viewport.voi.windowWidth
      )}/${Math.round(viewport.voi.windowCenter)}`;
      document.getElementById(
        "mrbottomright"
      ).textContent = `Zoom: ${viewport.scale.toFixed(2)}`;
    }
    element.addEventListener("cornerstoneimagerendered", onImageRendered);
    const config = {
      // invert: true,
      minScale: 0.25,
      maxScale: 20.0,
      preventZoomOutsideImage: true
    };
    cornerstoneTools.zoom.setConfiguration(config);
    document.getElementById("chkshadow").addEventListener("change", () => {
      cornerstoneTools.length.setConfiguration({ shadow: this.checked });
      cornerstoneTools.angle.setConfiguration({ shadow: this.checked });
      cornerstone.updateImage(element);
    });
    const imageId = "example://1";
    cornerstone.enable(element);
    cornerstone.loadImage(imageId).then(image => {
      cornerstone.displayImage(element, image);
      cornerstoneTools.mouseInput.enable(element);
      cornerstoneTools.mouseWheelInput.enable(element);
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
                <Toolbar>

                  <Tooltip title="Window Level"> 
                    <Button color="inherit" size="medium" onClick={() => { this.enableTool("wwwc", 1); }}>
                      <Brightness6Icon />
                    </Button>
                  </Tooltip>

                  <Tooltip title="Pan"> 
                    <Button color="inherit" size="medium" onClick={() => {this.enableTool("pan", 3);}}>
                      <OpenWithIcon />
                    </Button>
                  </Tooltip>

                  <Tooltip title="Zoom">                   
                    <Button color="inherit" size="medium" onClick={() => {this.enableTool("zoom", 5);}}>
                      <SearchIcon />
                    </Button>
                  </Tooltip>

                  <Tooltip title="Length">   
                    <Button color="inherit" size="medium" onClick={() => {this.enableTool("length", 1);}}>
                      <StraightenIcon />
                    </Button>
                  </Tooltip>

                  <Tooltip title="Angle">   
                    <Button color="inherit" size="medium" onClick={() => {this.enableTool("angle", 1);}}>
                      <ArrowBackIosIcon />
                    </Button>
                  </Tooltip>

                  <Tooltip title="Probe">   
                    <Button color="inherit" size="medium" onClick={() => {this.enableTool("probe", 1);}}>
                      <AdjustIcon />
                    </Button>
                  </Tooltip>
                  
                  <Tooltip title="Elliptical ROI">  
                    <Button color="inherit" size="medium" onClick={() => {this.enableTool("ellipticalRoi", 1);}}>
                      <PanoramaFishEyeIcon />
                    </Button>
                  </Tooltip>
                  
                  <Tooltip title="Rectangle ROI">  
                    <Button color="inherit" size="medium" onClick={() => {this.enableTool("rectangleRoi", 1);}}>
                      <CropDinIcon />
                    </Button>
                  </Tooltip>

                  
                  <Tooltip title="Freeform ROI">  
                    <Button color="inherit" size="medium" onClick={() => {this.enableTool("freehand", 1);}}>
                      <EditIcon />
                    </Button>
                  </Tooltip>

                  <Tooltip title="Highlight">  
                    <Button color="inherit" size="medium" onClick={() => {this.enableTool("highlight", 1);}}>
                      <EditIcon />
                    </Button>
                  </Tooltip>

                  <div className="checkbox">
                     <Checkbox value="chkshadow" id="chkshadow" label="Apply shadow"/>
                     Apply shadow
                  </div>

                </Toolbar>
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