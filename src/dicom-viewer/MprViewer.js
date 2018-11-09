import React from "react";
import Hammer from "hammerjs";
import classNames from 'classnames';
import {withStyles} from '@material-ui/core/styles'
import {Paper}  from '@material-ui/core'
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math";
import dcmViewer from "./dcmViewer"
import * as dcmLoader from "./dcmLoader";

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
    // dicomViewer:{
    //   height: 'calc(50vh - 32px - 32px)',
    //   width: 'calc(50vw - 85px)'
    // },
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
  }
  getImagePathList(IP,Port,Path1){//sync request for now

    if (Path1 == 'Axial'){
      return new Promise(function(resolve,reject){
        resolve(['http://192.168.1.112:8080/api/getReslice/2/255']);
      })   
    }
    if (Path1 == 'Sagittal'){
      return new Promise(function(resolve,reject){
        resolve(['http://192.168.1.112:8080/api/getReslice/1/255']);
      })   
    }
    if (Path1 == 'Coronal'){
      return new Promise(function(resolve,reject){
        resolve(['http://192.168.1.112:8080/api/getReslice/0/255']);
      })   
    }
    
    return new Promise(function(resolve,reject){
      resolve(['http://192.168.1.108:8080/0002.png']);
    })

    // if (Path1===null){
    //   return new Promise(function(resolve,reject){resolve(["http://223.255.146.2:8042/orthanc/instances/fedab2d3-b15265e7-fa7f9b03-55568349-ef5d91ad/file"])});
    // }
    // else{
    //   return new Promise(function(resolve,reject){
    //     var queryResult =   fetch("http://223.255.146.2:8042/orthanc/series/" + Path1+ "/ordered-slices").then(
    //       (res)=>{return res.json();}).then((json)=>{ 
    //         let cacheImagePathArray = [];
    //         for(let i = 0; i < json.Dicom.length; ++i){
    //           let path = "http://223.255.146.2:8042/orthanc" + json.Dicom[i]; 
    //           cacheImagePathArray.push(path);
    //         }
    //     // console.log(cacheImagePathArray);
    //     return cacheImagePathArray;
    //   });
    //       resolve(queryResult);

    //     });
    // }

  }

  readImage(props, state, hardCodeHint){
      //Get image path Array first
      const loadingResult = this.getImagePathList(1,1,hardCodeHint)
      .then((queryList)=>{
        var cacheimagePathArray = [];
        var loaderHint = hardCodeHint;

        const cacheimageLoaderHintsArray = [...Array(queryList.length).keys()].map(function(number){
          return loaderHint+"://" + String(number);
        });


        for (var i=0;i<queryList.length;i++){
          cacheimagePathArray.push(queryList[i]);
        // cacheArray.push("assets/Test1/0"+String((i-i%100)/100)+String((i-(i-i%100)-i%10)/10)+String(i%10)+".dcm");
      }

      // const stateLoader = this.state.loader;
      // stateLoader.loadSeries(cacheimagePathArray, loaderHint);
      dcmLoader.GlobalDcmLoadManager.loadSeries(cacheimagePathArray, loaderHint)
      // this.setState((state) =>{
      //   return{
      //   imagePathArray: cacheimagePathArray,
      //   imageLoaderHintsArray: cacheimageLoaderHintsArray,
      //   hardCodeNumDcm: cacheimagePathArray.length,
      //   previousLoaderHint: loaderHint,
      //   loader: dcmLoader.GlobalDcmLoadManager.loadSeries(cacheimagePathArray, loaderHint),
      // }});

    });
  return loadingResult;
  }

  componentDidMount(){
    this.readImage(null,null,this.props.orientation).then(res=>{
    // const imageId = 'example://1';
    console.log(dcmLoader.GlobalDcmLoadManager)
    if (this.props.orientation === "Axial")
    {
      this.setState({
        dicomImage: document.getElementById('dicomImageAxial')},
        ()=>{
          var element = this.state.dicomImage
          cornerstone.enable(element);
          cornerstone.loadImage('Axial://0').then(function(image) {
            cornerstone.displayImage(element, image);
            cornerstone.resize(element)
          })
        })
    }
    else if (this.props.orientation === "Sagittal")
    {
      this.setState({
        dicomImage: document.getElementById('dicomImageSagittal')},
        ()=>{
          var element = this.state.dicomImage
          cornerstone.enable(element);
          cornerstone.loadImage('Sagittal://0').then(function(image) {
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
          cornerstone.loadImage('Coronal://0').then(function(image) {
            cornerstone.displayImage(element, image);
          })
        })
    }

    window.addEventListener('resize', (event)=>{this.handleResize(event, this.state.dicomImage)})
    })
  }

  componentWillReceiveProps(nextProps) {
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