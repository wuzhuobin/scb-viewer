import React from "react";
import Hammer from "hammerjs";
import classNames from 'classnames';
import {withStyles} from '@material-ui/core/styles'
import {Paper}  from '@material-ui/core'
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math";
import dcmViewer from "./dcmViewer"
// import * as dcmLoader from "./dcmLoader";

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
    //Delibrately not using it as React state variable
    this.singleViewer = new dcmViewer(null)
  }

  viewerLoadImage(){
    const self = this;

    if (this.singleViewer.element!==null){
      this.singleViewer.initialiseSeries("139de8e7-ad0fb5df-be841b43-590380a5+935e427f")
      // .then(res=>{
      //   console.log(self)
      //   console.log(this);
      //   console.log(self.singleViewer);
      //   console.log(this.singleViewer);
      //   this.singleViewer.displayImage();
      // })
    }

  }


  componentDidMount(){
    const self = this;
    if (this.props.orientation === "Axial")
    {
      const axialElement = document.getElementById('dicomImageAxial');

      if (axialElement!==null){
        console.log(axialElement)
        console.log(this.singleViewer.element)
        if (this.singleViewer.element === null){
          this.singleViewer.element = document.getElementById('dicomImageAxial');
          console.log(this.singleViewer.element)
          this.viewerLoadImage()
        }
      }
      else {
        console.log('element not rendered')
      }
      // this.setState({
      //   dicomImage: document.getElementById('dicomImageAxial')},
      //   ()=>{
      //     var element = this.state.dicomImage
      //     cornerstone.enable(element);
      //     cornerstone.loadImage('Axial://0').then(function(image) {
      //       cornerstone.displayImage(element, image);
      //       cornerstone.resize(element)
      //     })
      //   })
    }
    else if (this.props.orientation === "Sagittal")
    {
      // this.setState({
      //   dicomImage: document.getElementById('dicomImageSagittal')},
      //   ()=>{
      //     var element = this.state.dicomImage
      //     cornerstone.enable(element);
      //     cornerstone.loadImage('Sagittal://0').then(function(image) {
      //       cornerstone.displayImage(element, image);
      //     })
      //   })
    }
    else if (this.props.orientation === "Coronal")
    {
      // this.setState({
      //   dicomImage: document.getElementById('dicomImageCoronal')},
      //   ()=>{
      //     var element = this.state.dicomImage
      //     cornerstone.enable(element);
      //     cornerstone.loadImage('Coronal://0').then(function(image) {
      //       cornerstone.displayImage(element, image);
      //     })
      //   })
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