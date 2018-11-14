import React from "react";
import Hammer from "hammerjs";
import classNames from 'classnames';
import {withStyles} from '@material-ui/core/styles'
import {Paper}  from '@material-ui/core'
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math";
import pngViewer from "./pngViewer"
import dcmViewer from "./dcmViewer";


const styles = theme=> ({
    root:{    
        // width: '100vw',
    },
    dicomViewer: {
      height: 'calc(50vh - 32px - 32px - 3px)', // last term is 2*borderWidth + large frame boarderWidth
      width: 'calc(50vw - 85px - 3px)',
      borderColor: "gray",
      borderStyle: "solid",
      borderWidth: 1, 
      background: "black"
    },
    drawerOpenDicomViewer:{
        width: 'calc(50vw - 85px - 120px - 3px)',
    },
})

class MprViewer extends React.Component {
  constructor(props)
  {
    super(props);
    this.state = {
      dicomImage: null,
   	};
    //Delibrately not using it as React state variable
    console.log('aaa');
    this.cornerstoneInstance = cornerstone;
    this.singleViewer = new pngViewer(null, this.cornerstoneInstance);
  }

  viewerLoadImage(){
    if (this.singleViewer.element!==null){
      this.singleViewer.displayImage('http://127.0.0.1:8081/0003.png');
      // this.singleViewer.initialiseSeries("139de8e7-ad0fb5df-be841b43-590380a5-935e427f")
    }
  }

  componentDidMount(){
    console.log('didmount');
    const self = this;
    if (this.props.orientation === "Axial")
    {
      const axialElement = document.getElementById('dicomImageAxial');
      if (axialElement!==null){
        if (this.singleViewer.element === null){
          this.singleViewer.element = document.getElementById('dicomImageAxial');
          this.singleViewer.name = 'Axial';
          this.viewerLoadImage();
        }
      }
      else {
        console.log('element not rendered')
      }
      this.setState({
        dicomImage: document.getElementById('dicomImageAxial')},
        ()=>{
          // var element = this.state.dicomImage
          // cornerstone.enable(element);
          // cornerstone.loadImage('Axial://0').then(function(image) {
          //   cornerstone.displayImage(element, image);
          // })
        })
    }
    else if (this.props.orientation === "Sagittal")
    {
      const sagittalElement = document.getElementById('dicomImageSagittal');
      if (sagittalElement!==null){
        if (this.singleViewer.element === null){
          this.singleViewer.element = document.getElementById('dicomImageSagittal');
          this.singleViewer.name = 'Sagittal';
          this.viewerLoadImage();
        }
      }
      else {
        console.log('element not rendered')
      }
      this.setState({
        dicomImage: document.getElementById('dicomImageSagittal')},
        ()=>{
          // var element = this.state.dicomImage
          // cornerstone.enable(element);
          // cornerstone.loadImage('Sagittal://0').then(function(image) {
          //   cornerstone.displayImage(element, image);
          // })
        })
    }
    else if (this.props.orientation === "Coronal")
    {
      const coronalElement = document.getElementById('dicomImageCoronal');
      if (coronalElement!==null){
        if (this.singleViewer.element === null){
          this.singleViewer.element = document.getElementById('dicomImageCoronal');
          this.singleViewer.name = 'Coronal';
          this.viewerLoadImage();
        }
      }
      else {
        console.log('element not rendered')
      }
      this.setState({
        dicomImage: document.getElementById('dicomImageCoronal')},
        ()=>{
          // var element = this.state.dicomImage
          // cornerstone.enable(element);
          // cornerstone.loadImage('Coronal://0').then(function(image) {
          //   cornerstone.displayImage(element, image);
          // })
        })
    }

    window.addEventListener('resize', (event)=>{this.handleResize(event, this.state.dicomImage)})
  }

  componentWillUnmount(){
    console.log('unmount');
    this.singleViewer.callForDelete();
    this.singleViewer = null;
    // console.log(cornerstone.getCacheInfo());
    // this.cornerstoneInstance.purgeCache();
    this.cornerstoneInstance = null;
  }

  componentWillReceiveProps(nextProps) {
    console.log('ReceiveProps');
    if (nextProps.orientation === 'Axial'){
      this.singleViewer.displayImage('http://127.0.0.1:8081/0002.png');
    }
    if (this.state.dicomImage){
      if (this.props.drawerOpen != nextProps.drawerOpen){          
        if (nextProps.drawerOpen){
          this.state.dicomImage.style.width = 'calc(50vw - 120px - 85px - 3px)'
        }
        else{
          this.state.dicomImage.style.width = 'calc(50vw - 85px - 3px)'
        }
        cornerstone.resize(this.state.dicomImage)
      } 
    }
  }


  handleResize(event,dicomImage){
    console.log('handleResize');
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
            {orientation === "Axial" 
              && <div id="dicomImageAxial" 
              className={classNames(classes.dicomViewer, {[classes.drawerOpenDicomViewer]: this.props.drawerOpen})}/>}
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