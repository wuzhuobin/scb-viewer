import React from "react";
import classNames from 'classnames';
import {withStyles} from '@material-ui/core/styles'
import {Paper}  from '@material-ui/core'
import * as cornerstone from "cornerstone-core";
import pngViewer from "./pngViewer"
import axios from 'axios';

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
    canvas: {
      height: 'calc(50vh - 32px - 32px - 3px)', // last term is 2*borderWidth + large frame boarderWidth
      width: 'calc(50vw - 85px - 3px)',
      backgroundColor: "transparent",
      position: "fixed",
    },
    drawerOpenDicomViewer:{
      width: 'calc(50vw - 85px - 120px - 3px)',
    },
    drawerOpenCanvas:{
      width: 'calc(50vw - 85px - 120px - 3px)',
    }
})

class MprViewer extends React.Component {
  constructor(props)
  {
    super(props);
    this.state = {
      dicomImage: null,
      cursorViewportX: 0.5,
      cursorViewportY: 0.5,
      isMouseDown: false,
      leaveCanvasOnDown: false,
      slice: 255,
   	};
    //Delibrately not using it as React state variable
    this.cornerstoneInstance = cornerstone;
    // this.singleViewer = new pngViewer(null, this.cornerstoneInstance);
    this.singleViewer = null;
  }

  viewerLoadImage(inputPath){
    if (this.singleViewer){
      // this.singleViewer.cornerstoneInstance = this.cornerstoneInstance;
      this.singleViewer.displayImage(inputPath);
      // this.singleViewer.initialiseSeries("139de8e7-ad0fb5df-be841b43-590380a5-935e427f")
    }
  }
  
  componentDidMount(){
    console.log('did mount');
    if (this.props.orientation === "Axial")
    {
      const element = document.getElementById('dicomImageAxial');
      var canvas = document.getElementById('canvasAxial');

      canvas.width = element.clientWidth;
      canvas.height = element.clientHeight;

      this.setState({
        dicomImage: element},
        ()=>{
          this.setCursor()
        })

      if (element!==null){
        if (this.singleViewer === null){
          this.singleViewer = new pngViewer(element, this.cornerstoneInstance);
          this.singleViewer.name = 'Axial';
          // this.viewerLoadImage('http://192.168.1.108:8081/0002.png');
        }
      }
      else {
        console.log('element not rendered')
      }
    }
    else if (this.props.orientation === "Sagittal")
    {
      const element = document.getElementById('dicomImageSagittal');
      var canvas = document.getElementById('canvasSagittal');

      canvas.width = element.clientWidth;
      canvas.height = element.clientHeight;

      this.setState({
        dicomImage: element},
        ()=>{
          this.setCursor()
        })

      if (element!==null){
        if (this.singleViewer === null){
          this.singleViewer = new pngViewer(element, this.cornerstoneInstance);
          // this.singleViewer.element = document.getElementById('dicomImageSagittal');
          this.singleViewer.name = 'Sagittal';
          // this.viewerLoadImage('http://192.168.1.108:8081/0001.jpg');
        }
      }
      else {
        console.log('element not rendered')
      }
    }
    else if (this.props.orientation === "Coronal")
    {
      const element = document.getElementById('dicomImageCoronal');
      var canvas = document.getElementById('canvasCoronal');

      canvas.width = element.clientWidth;
      canvas.height = element.clientHeight;

      this.setState({
        dicomImage: element},
        ()=>{
          this.setCursor()
        })

      if (element!==null){
        if (this.singleViewer === null){
          this.singleViewer = new pngViewer(element, this.cornerstoneInstance);
          // this.singleViewer.element = document.getElementById('dicomImageCoronal');
          this.singleViewer.name = 'Coronal';
          // this.viewerLoadImage('http://192.168.1.108:8081/0002.png');
        }
      }
      else {
        console.log('element not rendered')
      }
    }
    window.addEventListener('resize', (event)=>{this.handleResize(event, this.state.dicomImage)})
  }



  componentWillUnmount(){
    //Remove window resize event listener
    console.log('unmount');
    window.removeEventListener("mousemove",  (event)=>{this.handleResize(event, this.state.dicomImage)});
    if (this.singleViewer){
      this.singleViewer.callForDelete();
      this.singleViewer = null;
      console.log(cornerstone.imageCache.getCacheInfo());
      // this.cornerstoneInstance.removeElementData(this.state.dicomImage);
      this.cornerstoneInstance.disable(this.state.dicomImage);
      this.cornerstoneInstance.imageCache.purgeCache();
      this.cornerstoneInstance = null;
    }

    window.removeEventListener("resize", (event)=>{this.handleResize(event, this.state.dicomImage)})

  }

  setCursor = () =>{
    // check if within bound first
    if (!this.props.cursor3D.cursorWithinBound()){
      return
    }

    var canvas;
    var element = this.state.dicomImage
    if (this.props.orientation === "Axial"){
      canvas = document.getElementById("canvasAxial")
    }
    else if (this.props.orientation === "Sagittal"){
      canvas = document.getElementById("canvasSagittal")
    }
    else if (this.props.orientation === "Coronal"){
      canvas = document.getElementById("canvasCoronal")
    }
    if (canvas){
      var ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      canvas.width = element.clientWidth
      canvas.height = element.clientHeight

      ctx.lineWidth = 2;

      // horizontal
      ctx.beginPath();
      ctx.strokeStyle = '#6fcbff';
      ctx.moveTo(0, canvas.height*this.state.cursorViewportY);
      ctx.lineTo(canvas.width, canvas.height*this.state.cursorViewportY);
      ctx.stroke();

      // vertical
      ctx.beginPath();
      ctx.strokeStyle = '#6fcbff';
      ctx.moveTo(canvas.width*this.state.cursorViewportX, 0);
      ctx.lineTo(canvas.width*this.state.cursorViewportX, canvas.height);
      ctx.stroke(); 
    }
   
  }

  loadSlice(){
    if (this.props.orientation === "Axial"){
      axios({
        method: 'post',
        url: 'http://223.255.146.2:8083/api/getReslice',
        data: {
          series: this.props.series,
          id: this.props.socket.id,
          direction: 2,
          slice: this.state.slice
        },
        headers:  {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store'
        },
        responseType: 'arraybuffer',
      }).then(res=>{
        this.viewerLoadImage(res.data)
      }).catch(err=>{
        console.log(err)
      })
    }else if (this.props.orientation === "Sagittal"){
      axios({
        method: 'post',
        url: 'http://223.255.146.2:8083/api/getReslice',
        data: {
          series: this.props.series,
          id: this.props.socket.id,
          direction: 0,
          slice: this.state.slice
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
    }else if (this.props.orientation === "Coronal"){
      axios({
        method: 'post',
        url: 'http://223.255.146.2:8083/api/getReslice',
        data: {
          series: this.props.series,
          id: this.props.socket.id,
          direction: 1,
          slice: this.state.slice
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

  }
  componentWillReceiveProps(nextProps) {
    // cursor 3d
    if (this.props.ijkPos !=  nextProps.ijkPos){
      // cursor3D update
      if (this.props.orientation === "Axial"){
        if (this.props.ijkPos[0] === nextProps.ijkPos[0] && this.props.ijkPos[1] === nextProps.ijkPos[1]){
          return;
        }
        
        var canvas = document.getElementById("canvasAxial")
        this.props.cursor3D.setViewportAxialSize(canvas.width,canvas.height);

        this.props.cursor3D.update()

        this.setState({
          "cursorViewportX": this.props.cursor3D.getAxialViewportPosition()[0],
          "cursorViewportY": this.props.cursor3D.getAxialViewportPosition()[1]
        }, ()=>{
          this.setCursor()
          // change slice
          var ijkPos = this.props.cursor3D.getIjkPositionFromAxial(this.state.cursorViewportX, this.state.cursorViewportY)
          if ((this.state.slice | 0) === (ijkPos[2] | 0)){
            return;
          }
          this.setState({slice: ijkPos[2]}, ()=>{
            if (nextProps.series){
                this.loadSlice()
            }
          })})
      }
      if (this.props.orientation === "Sagittal"){
        if (this.props.ijkPos[1] === nextProps.ijkPos[1] && this.props.ijkPos[2] === nextProps.ijkPos[2]){
          return;
        }
        var canvas = document.getElementById("canvasSagittal")
        this.props.cursor3D.setViewportSagittalSize(canvas.width,canvas.height);

        this.props.cursor3D.update()

          this.setState({
            "cursorViewportX": this.props.cursor3D.getSagittalViewportPosition()[0],
            "cursorViewportY": this.props.cursor3D.getSagittalViewportPosition()[1]
        }, ()=>{
            
            this.setCursor()
            // change slice
            var ijkPos = this.props.cursor3D.getIjkPositionFromSagittal(this.state.cursorViewportX, this.state.cursorViewportY)
            if ((this.state.slice | 0) === (ijkPos[0] | 0)){
              return;
            }
            this.setState({slice: ijkPos[0]}, ()=>{
              if (nextProps.series){
                  this.loadSlice()
                }
            })
          })
      }
      if (this.props.orientation === "Coronal"){
        if (this.props.ijkPos[0] === nextProps.ijkPos[0] && this.props.ijkPos[2] === nextProps.ijkPos[2]){
          return;
        }

        var canvas = document.getElementById("canvasCoronal")
        this.props.cursor3D.setViewportCoronalSize(canvas.width,canvas.height);

        this.props.cursor3D.update()

        this.setState({
          "cursorViewportX": this.props.cursor3D.getCoronalViewportPosition()[0],
          "cursorViewportY": this.props.cursor3D.getCoronalViewportPosition()[1]
          }, ()=>{
            this.setCursor()
            // change slice
            var ijkPos = this.props.cursor3D.getIjkPositionFromCoronal(this.state.cursorViewportX, this.state.cursorViewportY)
            if ((this.state.slice | 0) === (ijkPos[1] | 0)){
              return;
            }
            this.setState({slice: ijkPos[1]}, ()=>{
              if (nextProps.series){
                  this.loadSlice()
                }
              })
            })
        }
    }

      if (this.state.dicomImage){
        if (this.props.drawerOpen != nextProps.drawerOpen){          
          if (nextProps.drawerOpen){
              this.state.dicomImage.style.width = 'calc(50vw - 120px - 85px - 3px)'
          }
          else{
            this.state.dicomImage.style.width = 'calc(50vw - 85px - 3px)'
          }

          if (this.singleViewer){
            this.singleViewer.resizeImage();
          }
          // need to setCursor again
          this.setCursor()
        } 
      }

      if (this.props.series != nextProps.series){
        if (!nextProps.series){
          return;
        }

        if (this.props.orientation === "Axial"){
          this.setState({slice: this.props.cursor3D.sizeZ/2 | 0},
            ()=>{
              this.loadSlice()
            })
        }else if (this.props.orientation === "Sagittal"){
          this.setState({slice: this.props.cursor3D.sizeX/2 | 0},
            ()=>{
              this.loadSlice()
            })
        }else if (this.props.orientation === "Coronal"){
          this.setState({slice: this.props.cursor3D.sizeY/2 | 0},
            ()=>{
              this.loadSlice()
            })
        }
        
        
        }
        
      //   var loadingPromise = axios({
      //     method: 'post',
      //     url: 'http://192.168.1.112:8080/api/loadDicom',
      //     // timeout: 1 * 1000,
      //     data: {
      //       series: series,
      //       id: this.props.socket.id
      //     },
      //     headers:  {'Access-Control-Allow-Origin': '*'},
      // })

      // loadingPromise.then((res)=>{
      //     if (series === this.state.selectedSeries){
      //       this.setState({loadingProgress: 100})
      //       this.setState({serverStatus: "MPR Server Load Success: " + this.state.selectedSeries , serverStatusOpen:true})
      //       this.setState({displaySeries: series})
      //     }
          
      //     console.log(series)
      //     console.log("server side load complete: " + this.state.selectedSeries)
      // }).catch((err)=>{
      //   // server side error
      //   if (err.response.status === 500){
      //     // console.log("error 500")
      //     // console.log(err.response)
      //     // console.log(err.response.data)

      //     if (err.response.data === "No Key Found"){
      //       this.setState({loadingProgress: 0})
      //       // this.setState({loadingProgress: 100})
      //       // this.setState({serverStatus: "No Key Found", serverStatusOpen:true})
      //     }
      //     else{
      //       this.setState({loadingProgress: 100})
      //       this.setState({serverStatus: "MPR Server Error", serverStatusOpen:true})
      //     }
      //   }
      //   if (err.code === "ECONNABORTED"){
      //     this.setState({loadingMessage: "Server connection timeout!"})
      //     this.setState({loadingProgress: 100})
      //   }
      // })
    }




  handleResize(event, dicomImage){
    console.log('handleResize');
    // this.viewerLoadImage('http://192.168.1.108:8081/0001.png');
    // console.log(cornerstone.getImage(dicomImage))
    if (dicomImage)
    {
      console.log('updateSize')

        dicomImage.style.height = 'calc(50vh - 32px - 32px - 3px)'
        dicomImage.style.width = 'calc(50vw - 85px - 3px)'

        if (this.singleViewer){
          this.singleViewer.element = dicomImage;
          this.singleViewer.resizeImage();
        }
        this.setCursor()
    }
  }

  handleCursorDrag(event, orientation){
    if (! this.state.isMouseDown){
      return;
    }

    if (orientation === "Axial"){
      var canvas = document.getElementById("canvasAxial")
    }
    else if (orientation === "Sagittal"){
      var canvas = document.getElementById("canvasSagittal")
    }
    else if (orientation === "Coronal"){
      var canvas = document.getElementById("canvasCoronal")
    }

    var rect = canvas.getBoundingClientRect();

    this.setState({cursorViewportX: (event.clientX - rect.left)/canvas.width, cursorViewportY: (event.clientY - rect.top)/canvas.height},()=>{
      this.setCursor()
    })

    if (orientation === "Axial"){
      var canvas = document.getElementById("canvasAxial")
      this.props.cursor3D.setViewportAxialSize(canvas.width, canvas.height) 

      this.props.cursor3D.update()
      var ijkPos = this.props.cursor3D.getIjkPositionFromAxial(this.state.cursorViewportX, this.state.cursorViewportY)
      
      if (this.props.cursor3D.cursorWithinBound()){
        this.props.onCursorChange()
      }
    }
    if (orientation === "Sagittal"){
      var canvas = document.getElementById("canvasSagittal")
      this.props.cursor3D.setViewportSagittalSize(canvas.width, canvas.height) 

      this.props.cursor3D.update()
      var ijkPos = this.props.cursor3D.getIjkPositionFromSagittal(this.state.cursorViewportX, this.state.cursorViewportY)
     
      if (this.props.cursor3D.cursorWithinBound()){
        this.props.onCursorChange()
      }
    }
    if (orientation === "Coronal"){
      var canvas = document.getElementById("canvasCoronal")
      this.props.cursor3D.setViewportCoronalSize(canvas.width, canvas.height) 

      this.props.cursor3D.update()
      var ijkPos = this.props.cursor3D.getIjkPositionFromCoronal(this.state.cursorViewportX, this.state.cursorViewportY)
      if (this.props.cursor3D.cursorWithinBound()){
        this.props.onCursorChange()
      }
    }
  }

  handleWheelChange(event, orientation){
    if (event.deltaY < 0 ){
      // mouse wheel up
      // console.log("wheel up")
      // update cursor position
      // if (!this.props.cursor3D.cursorWithinBound()){
      //   return;
      // }

      if (this.props.orientation === "Axial"){
        // check if at bound 
        if (Math.round(this.props.cursor3D.getIjkPosition()[2]) < this.props.cursor3D.sizeZ-1){
          // console.log("within z axis bound")
          this.props.cursor3D.setIjkPosition(
            this.props.cursor3D.getIjkPosition()[0],
            this.props.cursor3D.getIjkPosition()[1],
            this.props.cursor3D.getIjkPosition()[2] + 1)
          this.setCursor()
          this.setState({slice: this.state.slice + 1}, ()=>{this.loadSlice();})
        }
      }else if(this.props.orientation === "Sagittal"){
        // check if at bound 
        if (Math.round(this.props.cursor3D.getIjkPosition()[0]) < this.props.cursor3D.sizeX-1){
          // console.log("within x axis bound")
          this.props.cursor3D.setIjkPosition(
            this.props.cursor3D.getIjkPosition()[0] + 1,
            this.props.cursor3D.getIjkPosition()[1],
            this.props.cursor3D.getIjkPosition()[2])
          this.setCursor()
          this.setState({slice: this.state.slice + 1}, ()=>{this.loadSlice();})
        }
      }else if(this.props.orientation === "Coronal"){
        // check if at bound 
        if (Math.round(this.props.cursor3D.getIjkPosition()[1]) < this.props.cursor3D.sizeY-1){
          // console.log("within y axis bound")
          this.props.cursor3D.setIjkPosition(
          this.props.cursor3D.getIjkPosition()[0],
          this.props.cursor3D.getIjkPosition()[1] + 1,
          this.props.cursor3D.getIjkPosition()[2])
          this.setCursor()
          this.setState({slice: this.state.slice + 1}, ()=>{this.loadSlice();})
      }}

      this.props.cursor3D.update(); 
      this.props.onCursorChange();
      this.setCursor();
      
    }
    if (event.deltaY > 0){
      // mouse wheel down
      // console.log("wheel down")

      // update cursor position
      if (this.props.orientation === "Axial"){
        // check if at bound 
        if (Math.round(this.props.cursor3D.getIjkPosition()[2]) >= 1){
          // console.log("within z axis bound")
          this.props.cursor3D.setIjkPosition(
            this.props.cursor3D.getIjkPosition()[0],
            this.props.cursor3D.getIjkPosition()[1],
            this.props.cursor3D.getIjkPosition()[2] - 1)
          this.setCursor()
          this.setState({slice: this.state.slice - 1}, ()=>{this.loadSlice()})
        }
      }else if(this.props.orientation === "Sagittal"){
        // check if at bound 
        if (Math.round(this.props.cursor3D.getIjkPosition()[0]) >= 1){
          // console.log("within x axis bound")
          this.props.cursor3D.setIjkPosition(
          this.props.cursor3D.getIjkPosition()[0] - 1,
          this.props.cursor3D.getIjkPosition()[1],
          this.props.cursor3D.getIjkPosition()[2])
          this.setCursor()
          this.setState({slice: this.state.slice - 1}, ()=>{this.loadSlice()})
        }
      }else if(this.props.orientation === "Coronal"){
        // check if at bound 
        if (Math.round(this.props.cursor3D.getIjkPosition()[1]) >= 1){
          // console.log("within y axis bound")
          this.props.cursor3D.setIjkPosition(
          this.props.cursor3D.getIjkPosition()[0],
          this.props.cursor3D.getIjkPosition()[1] - 1,
          this.props.cursor3D.getIjkPosition()[2])
          this.setCursor()
          this.setState({slice: this.state.slice - 1}, ()=>{this.loadSlice()})
        }
      }

      this.props.cursor3D.update(); 
      this.props.onCursorChange();
      this.setCursor();
    }
  }

    render() {
      const {series, drawerOpen, orientation, classes} = this.props
      const {canvasWidth, canvasHeight} = this.state

    	return(
          <div className={classes.paper}>
            {orientation === "Axial" 
              && 
                <div id="dicomImageAxial" 
                  className={classNames(classes.dicomViewer, {[classes.drawerOpenDicomViewer]: this.props.drawerOpen})}>
                  <canvas id="canvasAxial" 
                    className={classNames(classes.canvas, {[classes.drawerOpenCanvas]: this.props.drawerOpen})} 
                    // onClick={(event)=>{this.handleCursorClick(event, orientation)}} 
                    onMouseDown={(event)=>{
                      if (event.button === 0){
                        this.setState({isMouseDown:true})
                      }}}
                    onMouseUp={(event)=>{this.setState({isMouseDown:false})}}
                    onMouseMove={(event)=>{this.handleCursorDrag(event, orientation)}}
                    onWheel={(event)=>{this.handleWheelChange(event, orientation)}}
                    onContextMenu={event=>{event.preventDefault()}}
                    onMouseLeave={(event)=>{
                      if (this.state.isMouseDown){
                        this.setState({leaveCanvasOnDown:true})
                      }
                      else {
                        this.setState({leaveCanvasOnDown:false})
                      }}}
                    onMouseEnter={(event)=>{
                      if (event.buttons === 1){
                        if (this.state.leaveCanvasOnDown){
                          this.setState({isMouseDown: true})
                        }
                        else{
                          this.setState({isMouseDown: false})
                        }
                      } else {
                        this.setState({isMouseDown: false})
                      }}}
                  />
                </div>
            }
            {orientation === "Sagittal" 
              && <div id="dicomImageSagittal" 
                  className={classNames(classes.dicomViewer, {[classes.drawerOpenDicomViewer]: this.props.drawerOpen})}>
                  <canvas id="canvasSagittal" 
                  className={classNames(classes.canvas, {[classes.drawerOpenCanvas]: this.props.drawerOpen})} 
                  // onClick={(event)=>{this.handleCursorClick(event, orientation)}}
                  onMouseDown={(event)=>{
                    if (event.button === 0){
                      this.setState({isMouseDown:true})
                    }}}
                  onMouseUp={(event)=>{this.setState({isMouseDown:false})}}
                  onMouseMove={(event)=>{this.handleCursorDrag(event, orientation)}}
                  onWheel={(event)=>{this.handleWheelChange(event, orientation)}}
                  onContextMenu={event=>{event.preventDefault()}}
                  onMouseLeave={(event)=>{
                      if (this.state.isMouseDown){
                        this.setState({leaveCanvasOnDown:true})
                      }
                      else {
                        this.setState({leaveCanvasOnDown:false})
                      }}}
                  onMouseEnter={(event)=>{
                      if (event.buttons === 1){
                        if (this.state.leaveCanvasOnDown){
                          this.setState({isMouseDown: true})
                        }
                        else{
                          this.setState({isMouseDown: false})
                        }
                      } else {
                        this.setState({isMouseDown: false})
                      }}}
                  />
                </div>
            }
            {orientation === "Coronal" 
              && <div id="dicomImageCoronal" 
                  className={classNames(classes.dicomViewer, {[classes.drawerOpenDicomViewer]: this.props.drawerOpen})}>
                  <canvas id="canvasCoronal" 
                  className={classNames(classes.canvas, {[classes.drawerOpenCanvas]: this.props.drawerOpen})} 
                  // onClick={(event)=>{this.handleCursorClick(event, orientation)}}
                  onMouseDown={(event)=>{
                    if (event.button === 0){
                      this.setState({isMouseDown:true})
                    }}}
                  onMouseUp={(event)=>{this.setState({isMouseDown:false})}}
                  onMouseMove={(event)=>{this.handleCursorDrag(event, orientation)}}
                  onWheel={(event)=>{this.handleWheelChange(event, orientation)}}
                  onContextMenu={event=>{event.preventDefault()}}
                  onMouseLeave={(event)=>{
                      if (this.state.isMouseDown){
                        this.setState({leaveCanvasOnDown:true})
                      }
                      else {
                        this.setState({leaveCanvasOnDown:false})
                      }}}
                  onMouseEnter={(event)=>{
                      if (event.buttons === 1){
                        if (this.state.leaveCanvasOnDown){
                          this.setState({isMouseDown: true})
                        }
                        else{
                          this.setState({isMouseDown: false})
                        }
                      } else {
                        this.setState({isMouseDown: false})
                      }}}
                  />
                </div>
            }
          </div>            
        );
    };
}

export default withStyles(styles)(MprViewer);