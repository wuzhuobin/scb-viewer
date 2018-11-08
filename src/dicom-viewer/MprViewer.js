import React from "react";
import Hammer from "hammerjs";
import classNames from 'classnames';
import {withStyles} from '@material-ui/core/styles'
import {Paper}  from '@material-ui/core'
import exampleImageIdLoader from "./exampleImageIdLoader";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math";
import dcmViewer from "./dcmViewer"

const styles = theme=> ({
    root:{    
        // width: '100vw',
    },
    paper: {
      height: 'calc(50vh - 32px - 32px)',
      textAlign: 'center',
      color: theme.palette.text.secondary,
      borderRadius: 0,
      background: "black"
    },
    dicomViewer:{
      height: 'calc(50vh - 32px - 32px)',
      width: 'calc(50vw - 85px)'
    },
    drawerOpenDicomViewer:{
        width: 'calc(50vw - 85px - 120px - 2px)',
    },
})

class MprViewer extends React.Component {
  constructor(props)
  {
    super(props);
    this.state = {
      dicomImage: null,
   	};
  }


  componentDidMount(){

    const imageId = 'example://1';

    const viewer = new dcmViewer(document.getElementById('dicomImageAxial'))
    viewer.loadImageFromPacs("4e8739a-f032e726-38354e44-9e636c11-648b3306").then(res=>{
      console.log('done')
      viewer.displayImage();
    })




    if (this.props.orientation === "Axial")
    {
      // const viewerA = document.getElementById('dicomImageAxial');
      // console.log(viewerA);
      // viewerA = new dcmViewer()
      // viewerA.loadImageFromPacs("4e8739a-f032e726-38354e44-9e636c11-648b3306").then(res=>viewerA.displayImage())


      this.setState({
        dicomImage: document.getElementById('dicomImageAxial')},
        ()=>{
            // const viewer = new dcmViewer(this.state.dicomImage)
            // viewer.loadImageFromPacs("4e8739a-f032e726-38354e44-9e636c11-648b3306").then(res=>viewer.displayImage())


          // var element = this.state.dicomImage
          // cornerstone.enable(element);
          // cornerstone.loadImage(imageId).then(function(image) {
          //   cornerstone.displayImage(element, image);
          // })
          // console.log(this.state.dicomImage)
          // this.state.dicomImage.readImage(null,'')
        })
    }
    else if (this.props.orientation === "Sagittal")
    {
      this.setState({
        dicomImage: document.getElementById('dicomImageSagittal')},
        ()=>{
          var element = this.state.dicomImage
          cornerstone.enable(element);
          cornerstone.loadImage(imageId).then(function(image) {
            cornerstone.displayImage(element, image);
          })
        })
    }
    else if (this.props.orientation === "Coronal")
    {
      this.setState({
        dicomImage: document.getElementById('dicomImageCoronal')},
        ()=>{
          var element = this.state.dicomImage
          cornerstone.enable(element);
          cornerstone.loadImage(imageId).then(function(image) {
            cornerstone.displayImage(element, image);
          })
        })
    }

    window.addEventListener('resize', (event)=>{this.handleResize(event, this.state.dicomImage)})
  }

  componentWillReceiveProps(nextProps) {
      if (this.state.dicomImage){
        if (this.props.drawerOpen != nextProps.drawerOpen){
        if (nextProps.drawerOpen){
            this.state.dicomImage.style.width = 'calc(50vw - 120px - 85px - 1px)'
        }
        else{
          this.state.dicomImage.style.width = 'calc(50vw - 85px)'
        }
        // cornerstone.resize(this.state.dicomImage)
      }
    }
    }


  handleResize(event,dicomImage){
    // if (dicomImage)
    // {
    //     console.log('updateSize')

    //     dicomImage.style.height = 'calc(50vh - 32px - 32px)'
    //     dicomImage.style.width = 'calc(50vw - 85px)'
    //     try{
    //         cornerstone.resize(dicomImage)          
    //     }
    //     catch(error)
    //     {
    //       console.log(error)
    //     }
    // }
  }

    render() {
      const {drawerOpen, orientation, classes} = this.props

    	return(
          <div className={classes.paper}>
            {orientation === "Axial" 
              && <div id="dicomImageAxial" 
              className={classNames(classes.dcmViewer, {[classes.drawerOpenDicomViewer]: this.props.drawerOpen})}/>}
            {orientation === "Sagittal" 
              && <div id="dicomImageSagittal" 
              className={classNames(classes.dicomViewer, {[classes.drawerOpenDicomViewer]: this.props.drawerOpen})}/>}
            {orientation === "Coronal" 
              && <div id="dicomImageCoronal" 
              className={classNames(classes.dicomViewer, {[classes.drawerOpenDicomViewer]: this.props.drawerOpen})}/>}
          </div>            
        );
    };
}

export default withStyles(styles)(MprViewer);