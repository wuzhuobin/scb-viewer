import React from "react";
import classNames from 'classnames';
import {withStyles} from '@material-ui/core/styles'
// import exampleImageIdLoader from "./exampleImageIdLoader";
import * as cornerstone from "cornerstone-core";
import pngViewer from "../dicom-viewer/pngViewer";
import axios from 'axios';

const styles = theme=> ({
    root:{    
        // width: '100vw',
    },
    threeDViewer: {
      height: 'calc(50vh - 32px - 32px - 3px)', // last term is 2*borderWidth + large frame boarderWidth
      width: 'calc(50vw - 85px - 3px - 150px)',
      borderColor: "gray",
      borderStyle: "solid",
      borderWidth: 1, 
      background: "black"
    },
    drawerOpenThreeDViewer:{
        width: 'calc(50vw - 85px - 120px - 3px  - 150px)',
    },
})

class ThreeDViewer extends React.Component {
  constructor(props)
  {
    super(props);
    this.state = {
      dicomImage: null,
      leaveCanvasOnDown: false,
      mouseEvent: -1,
      curMousePosX: -1,  //indicate first click
      curMousePosY: -1,  //indicate first click
      lastMousePosX: -1,  //indicate first click
      lastMousePosY: -1,  //indicate first click
      isImageUpdated2: true,
      value: 20,  //postive number indicate shift range -ve to +ve
   	};
    this.cornerstoneInstance = cornerstone;
    this.singleViewer = null;
  }

  viewerLoadImage(inputPath){
    if (this.singleViewer){
      this.singleViewer.displayImage(inputPath);
    }
  }

  componentWillUnmount(){
    console.log('unmount');
    this.singleViewer.callForDelete();
    this.singleViewer = null;
    // console.log(this.cornerstoneInstance.getCacheInfo());
    // this.cornerstoneInstance.purgeCache();
    this.cornerstoneInstance = null;
  }


  componentDidMount(){

    this.setState({
      dicomImage: document.getElementById('dicomImageThreeD')},
      ()=>{
        var element = this.state.dicomImage
        cornerstone.enable(element);
        // cornerstone.loadImage(imageId).then(function(image) {
        //   cornerstone.displayImage(element, image);
        // })
      })
    const threeDElement = document.getElementById('dicomImageThreeD');
    if (threeDElement){
      if (this.singleViewer === null){
        this.singleViewer = new pngViewer(threeDElement,this.cornerstoneInstance);
        // this.singleViewer.element = threeDElement;
        this.singleViewer.name = 'threeD';
        // this.viewerLoadImage();
      }
    }


    window.addEventListener('resize', (event)=>{this.handleResize(event, this.state.dicomImage)})
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.dicomImage){
      if (this.props.drawerOpen !== nextProps.drawerOpen){
        if (nextProps.drawerOpen){
          this.state.dicomImage.style.width = 'calc(50vw - 120px - 85px - 3px - 150px)'
            
        }
        else{
          this.state.dicomImage.style.width = 'calc(50vw - 85px - 3px - 150px)'
        }

      }
    }

    if (this.props.series !== nextProps.series){
        this.rotateView(nextProps.series);
    }

    if (this.state.dicomImage){
        if (this.props.drawerOpen !== nextProps.drawerOpen){          
          if (nextProps.drawerOpen){
              this.state.dicomImage.style.width = 'calc(50vw - 120px - 85px - 3px - 150px)'
          }
          else{
            this.state.dicomImage.style.width = 'calc(50vw - 85px - 3px - 150px)'
          }

          if (this.singleViewer){
            this.singleViewer.resizeImage();
          }
        } 
      }
  }

  componentDidUpdate(prevProps, prevState){
    if (this.props.preset !== prevProps.preset ||
      this.props.shift !== prevProps.shift||
      this.props.opacity !== prevProps.opacity){
        this.rotateView(this.props.series)
    }
  }

  rotateView(series){
    var curPreset = this.props.preset
    var curOpacity = this.props.opacity
    var curShift = this.props.shift
    var curMousePosX = this.state.curMousePosX
    var curMousePosY = this.state.curMousePosY
    var lastMousePosX = this.state.lastMousePosX
    var lastMousePosY = this.state.lastMousePosY

    if (this.state.isImageUpdated2 === true)
    {
      this.setState({isImageUpdated2:false},()=>{
        axios({
        method: 'post',
        url: 'http://223.255.146.2:8083/api/getVolumeRendering',
        data: {
          series: series,
          id: this.props.socket.id,
          input:{ preset: curPreset, 
                  shift: curShift, 
                  opacity: curOpacity,
                  size:[this.state.dicomImage.clientWidth, this.state.dicomImage.clientHeight],
                  rotate:{ 
                  current: [ -lastMousePosX, lastMousePosY ],
                  last: [ -curMousePosX, curMousePosY ],
                  motionFactor: 5}},
          // sizeX:document.getElementById("dicomImageThreeD").style.width, 
          // sizeY:document.getElementById("dicomImageThreeD").style.height
          // sizeX:this.state.dicomImage.clientWidth, 
          // sizeY:this.state.dicomImage.clientHeight
              },
        headers: {
          'Access-Control-Allow-Origin': '*',
          },
        responseType: 'arraybuffer'
        }).then(res=>{
          this.setState({isImageUpdated2:true})
          this.viewerLoadImage(res.data)
          }).catch(err=>{console.log(err)}
        )}
      );
    }     
  }

  dollyView(series){
    var curPreset = this.state.preset
    var curOpacity = this.state.opacity
    var curShift = this.state.shift
    var curMousePosX = this.state.curMousePosX
    var curMousePosY = this.state.curMousePosY
    var lastMousePosX = this.state.lastMousePosX
    var lastMousePosY = this.state.lastMousePosY

    if (this.state.isImageUpdated2 === true)
    {
      this.setState({isImageUpdated2:false},()=>{
        axios({
        method: 'post',
        url: 'http://223.255.146.2:8083/api/getVolumeRendering',
        data: {
          series: series,
          id: this.props.socket.id,
          input:{ preset: curPreset, 
                  shift: curShift, 
                  opacity: curOpacity,
                  size:[this.state.dicomImage.clientWidth, this.state.dicomImage.clientHeight],
                  dolly:{ 
                  current: [ -lastMousePosX, lastMousePosY ],
                  last: [ -curMousePosX, curMousePosY ],
                  motionFactor: 5}},
          // sizeX:document.getElementById("dicomImageThreeD").style.width, 
          // sizeY:document.getElementById("dicomImageThreeD").style.height
          // sizeX:this.state.dicomImage.clientWidth, 
          // sizeY:this.state.dicomImage.clientHeight
              },
        headers: {
          'Access-Control-Allow-Origin': '*',
          },
        responseType: 'arraybuffer'
        }).then(res=>{
          this.setState({isImageUpdated2:true})
          this.viewerLoadImage(res.data)
          }).catch(err=>{console.log(err)}
        )}
      );
    }     
  }

  panView(series){
    var curPreset = this.state.preset
    var curOpacity = this.state.opacity
    var curShift = this.state.shift
    var curMousePosX = this.state.curMousePosX
    var curMousePosY = this.state.curMousePosY
    var lastMousePosX = this.state.lastMousePosX
    var lastMousePosY = this.state.lastMousePosY

    if (this.state.isImageUpdated2 === true)
    {
      this.setState({isImageUpdated2:false},()=>{
        axios({
        method: 'post',
        url: 'http://223.255.146.2:8083/api/getVolumeRendering',
        data: {
          series: series,
          id: this.props.socket.id,
          input:{ preset: curPreset, 
                  shift: curShift, 
                  opacity: curOpacity,
                  size:[this.state.dicomImage.clientWidth, this.state.dicomImage.clientHeight],
                  pan:{ 
                  current: [ -lastMousePosX, lastMousePosY ],
                  last: [ -curMousePosX, curMousePosY ],
                  motionFactor: 1}},
          // sizeX:document.getElementById("dicomImageThreeD").style.width, 
          // sizeY:document.getElementById("dicomImageThreeD").style.height
          // sizeX:this.state.dicomImage.clientWidth, 
          // sizeY:this.state.dicomImage.clientHeight
              },
        headers: {
          'Access-Control-Allow-Origin': '*',
          },
        responseType: 'arraybuffer'
        }).then(res=>{
          this.setState({isImageUpdated2:true})
          this.viewerLoadImage(res.data)
          }).catch(err=>{console.log(err)}
        )}
      );
    }     
  }


  handleDrag(event){
    if (this.state.mouseEvent<0){
      return;
    }
    if(this.state.isImageUpdated2 ===false){
      return;
    }

    //Calcalate cursor position
    var rect = document.getElementById("dicomImageThreeD").getBoundingClientRect();
    this.state.curMousePosX= event.clientX - rect.left;
    this.state.curMousePosY = event.clientY - rect.top;

    //in case event position is smaller than 0
    if(this.state.curMousePosX<0) this.state.curMousePosX =0;
    if(this.state.curMousePosY<0) this.state.curMousePosY =0;

    //console.log(this.state.curMousePosX);
    //console.log(this.state.curMousePosY);

    //check if first click
    if(this.state.lastMousePosX<0) this.state.lastMousePosX = this.state.curMousePosX;
    if(this.state.lastMousePosY<0) this.state.lastMousePosY = this.state.curMousePosY;

    // console.log(this.state.lastMousePosX);
    // console.log(this.state.lastMousePosY);

    //Send message if 
    if ((this.state.lastMousePosX === this.state.curMousePosX) && (this.state.lastMousePosY === this.state.curMousePosY))
    {

    }
    else
    {
      if (this.state.mouseEvent === 0)
        this.rotateView(this.props.series);
      else if (this.state.mouseEvent === 1)
        this.panView(this.props.series);
      else if (this.state.mouseEvent === 2)
        this.dollyView(this.props.series);
    }

    //Update last cursor position
    this.state.lastMousePosX = this.state.curMousePosX;
    this.state.lastMousePosY = this.state.curMousePosY;
  }


  handleResize(event,dicomImage){
    if (dicomImage)
    {
        console.log('updateSize')

        dicomImage.style.height = 'calc(50vh - 32px - 32px - 3px)'
        dicomImage.style.width = 'calc(50vw - 85px - 3px - 150px)'

        try{
            cornerstone.resize(dicomImage)          
        }
        catch(error)
        {
          console.log(error)
        }
    }
  }

  render() {
    const {classes} = this.props

  	return(
        <div className={classes.paper}>
            <div id="dicomImageThreeD" 
              className={classNames(classes.threeDViewer, {[classes.drawerOpenThreeDViewer]: this.props.drawerOpen})}
              onMouseDown={(event)=>{
                    var rect = document.getElementById("dicomImageThreeD").getBoundingClientRect();
                    this.state.lastMousePosX= event.clientX - rect.left;
                    this.state.lastMousePosY = event.clientY - rect.top;
                    
                    this.setState({mouseEvent:event.button});
                    }}
              onMouseUp={(event)=>{
                      
                      this.setState({mouseEvent:-1});
                      this.handleDrag(event);
                      }}
              onMouseMove={(event)=>{this.handleDrag(event)}}
              onWheel={(event)=>{}}
              onContextMenu={event=>{event.preventDefault()}}
              onMouseLeave={(event)=>{
                      if (this.state.mouseEvent){
                        this.setState({leaveCanvasOnDown:true})
                      }
                      else {
                        this.setState({leaveCanvasOnDown:false})
                      }}}
              onMouseEnter={(event)=>{
                      if (event.buttons === 1){
                        if (this.state.leaveCanvasOnDown){
                          this.setState({mouseEvent: -1})
                        }
                        else{
                          this.setState({mouseEvent: -1})
                        }
                      } else {
                        this.setState({mouseEvent: -1})
                      }}}
            />
        </div>            
      );
  };
}


export default withStyles(styles)(ThreeDViewer);