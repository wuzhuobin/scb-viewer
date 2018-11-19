import React from "react";
import classNames from 'classnames';
import {withStyles} from '@material-ui/core/styles'
import {Paper}  from '@material-ui/core'
// import exampleImageIdLoader from "./exampleImageIdLoader";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math";
import pngViewer from "./pngViewer";
import axios from 'axios';

const styles = theme=> ({
    root:{    
        // width: '100vw',
    },
    threeDViewer: {
      height: 'calc(50vh - 32px - 32px - 3px)', // last term is 2*borderWidth + large frame boarderWidth
      width: 'calc(50vw - 85px - 3px)',
      borderColor: "gray",
      borderStyle: "solid",
      borderWidth: 1, 
      background: "black"
    },
    drawerOpenThreeDViewer:{
        width: 'calc(50vw - 85px - 120px - 3px)',
    },
})

class ThreeDViewer extends React.Component {
  constructor(props)
  {
    super(props);
    this.state = {
      dicomImage: null,
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
    console.log("receivedProps");
      // if (true){
      if (this.state.dicomImage){
        if (this.props.drawerOpen != nextProps.drawerOpen){
        if (nextProps.drawerOpen){
            this.state.dicomImage.style.width = 'calc(50vw - 120px - 85px - 3px)'
        }
        else{
          this.state.dicomImage.style.width = 'calc(50vw - 85px - 3px)'
        }

      }
    }
    this.setState(()=>{
      if (nextProps.series){
        this.loadSlice();
      }
    })
  }



  loadSlice(){
      axios({
        method: 'post',
        url: 'http://192.168.1.112:8080/api/getVolumeRendering',
        data: {
          series: this.props.series,
          id: this.props.socket.id,
          // direction: 1,
          // slice: this.state.slice
        },
        headers:  {
          'Access-Control-Allow-Origin': '*',
        },
        responseType: 'arraybuffer'
      }).then(res=>{
        this.viewerLoadImage(res.data)
      }).catch(err=>{
        console.log(err)
      })
    

  }


  handleResize(event,dicomImage){
    if (dicomImage)
    {
        console.log('updateSize')

        dicomImage.style.height = 'calc(50vh - 32px - 32px - 3px)'
        dicomImage.style.width = 'calc(50vw - 85px - 3px)'
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
    const {drawerOpen, orientation, classes} = this.props

  	return(
        <div className={classes.paper}>
            <div id="dicomImageThreeD" 
              className={classNames(classes.threeDViewer, {[classes.drawerOpenThreeDViewer]: this.props.drawerOpen})}/>
        </div>            
      );
  };
}


export default withStyles(styles)(ThreeDViewer);