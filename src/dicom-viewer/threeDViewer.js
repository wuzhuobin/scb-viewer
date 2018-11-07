import React from "react";
import Hammer from "hammerjs";
import classNames from 'classnames';
import {withStyles} from '@material-ui/core/styles'
import {Paper}  from '@material-ui/core'
import exampleImageIdLoader from "./exampleImageIdLoader";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math";

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

class ThreeDViewer extends React.Component {
  constructor(props)
  {
    super(props);
    this.state = {
      dicomImage: null,
   	};
  }


  componentDidMount(){

    const imageId = 'example://1';

    this.setState({
      dicomImage: document.getElementById('dicomImageAxial')},
      ()=>{
        var element = this.state.dicomImage
        cornerstone.enable(element);
        cornerstone.loadImage(imageId).then(function(image) {
          cornerstone.displayImage(element, image);
        })
      })

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
        cornerstone.resize(this.state.dicomImage)
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
          orientation === "threeD" 
            && <div id="dicomImageThreeD" 
            className={classNames(classes.dicomViewer, {[classes.drawerOpenDicomViewer]: this.props.drawerOpen})}/>
        </div>            
      );
  };
}


export default withStyles(styles)(ThreeDViewer);