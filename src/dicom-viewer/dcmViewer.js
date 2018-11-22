import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math";
import Hammer from "hammerjs";
import * as dcmLoader from "./dcmLoader";



export default class dcmViewer{
	constructor(inputElement){
		this.rowCosine=[1,0,0];
		this.columnCosine=[0,1,0];
		this.currentLoaderHint="noImage";
        this.element = inputElement;
        this.stack = [];
        cornerstone.enable(inputElement);
        cornerstoneTools.external.cornerstone = cornerstone;
        cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
        cornerstoneTools.external.Hammer = Hammer;


	}
	displayImage(inputLoaderHint){
		const returningPromise = new Promise((resolve,reject)=>{cornerstone.loadImage(inputLoaderHint)
        .then(image => {
            cornerstone.displayImage(this.element,image);
            resolve();
            })
        })
        return returningPromise;
	}
	readImage(inputOrderedImageList, inputLoaderHint){
		var loaderHint = inputLoaderHint;
		if (inputOrderedImageList === null){
			loaderHint = "noImage"
		}
        const cacheimageLoaderHintsArray = [...Array(inputOrderedImageList.length).keys()].map(function(number){
          return loaderHint+"://" + String(number);
        });
        dcmLoader.GlobalDcmLoadManager.loadSeries(inputOrderedImageList, loaderHint);
        this.currentLoaderHint = inputLoaderHint;
	}
    updateImageDisplaySize(){
        var viewPort = cornerstone.getViewport(this.element);
        const currentImage = cornerstone.getImage(this.element);
        if (currentImage){
            viewPort.displayedArea.brhc = {x: currentImage.columns, y:currentImage.rows};
            cornerstone.setViewport(this.element, viewPort);
            cornerstone.fitToWindow(this.element);
        }
        else {
            console.log("display image first");
        }
    }
    seriesImages(id){
        fetch("http://223.255.146.2:8042/orthanc/series/" + id)
        .then((res)=>{return res.json();})
        .then((json)=>{
            let cacheImagePathArray = [];
            for(let i=0;i<json.Instances.length;++i){
                let path =  "http://192.168.1.126:3000/orthanc/instances/" + json.Instances[i] + "/file"; 
                cacheImagePathArray.push(path);
            }
            return cacheImagePathArray;
        })
    }
    getImagePathList(IP,Port,Path1){
        // return new Promise(function(resolve,reject){
        //     resolve(['http://192.168.1.108:8080/0002.png']);
        // })

        return new Promise(function(resolve,reject){
            var queryResult = fetch("http://223.255.146.2:8042/orthanc/series/" + Path1+ "/ordered-slices")
            .then((reso)=>{
                return reso.json();
            })
            .then((json)=>{
                    let cacheImagePathArray = [];
                    for (let i=0;i<json.Dicom.length;++i){
                        let path = "http://223.255.146.2:8042/orthanc" + json.Dicom[i]; 
                        cacheImagePathArray.push(path);
                    }
                return cacheImagePathArray;
            })
            .catch(error => {
                console.log(error);
                resolve(null);
            })
            resolve(queryResult);
        })
    }
    initialiseSeries(inputSeries){
        const self = this;
        const cacheInputSeries = inputSeries;

        this.getImagePathList(1,1,cacheInputSeries)
        .then((queryList)=>{
            var cacheImagePathArray = [];
            var loaderHint = cacheInputSeries;
            if (!queryList){
                loaderHint = "noImage";
                queryList = ['http://223.255.146.2:8042/orthanc/instances/e24b90b6-a1f5ec14-9a4d7922-e7061ba6-cb87193c/file'];
            }
            const cacheimageLoaderHintsArray = [...Array(queryList.length).keys()].map(function(number){
                return loaderHint+"://" + String(number);
            });
            console.log(cacheimageLoaderHintsArray);
            for (let i=0;i<queryList.length;i++){
                cacheImagePathArray.push(queryList[i]);
            }
            dcmLoader.GlobalDcmLoadManager.loadSeries(cacheImagePathArray,loaderHint);
            const middleIndex = parseInt((cacheimageLoaderHintsArray.length / 2)|0);
            this.stack = {
                currentImageIdIndex : middleIndex,
                imageIds: cacheimageLoaderHintsArray,
            }
            return this.displayImage(cacheimageLoaderHintsArray[middleIndex]);
        })
        .then((res)=>{
            this.internalInitializeViewer();
            this.toNavigateMode();
        })
    }
    internalInitializeViewer(){
        // Now we start enable cornerstoneTools
        this.updateImageDisplaySize();
        cornerstoneTools.zoom.setConfiguration({
          minScale: 0.25,
          maxScale: 20.0,
          preventZoomOutsideImage: true,
        });
        cornerstoneTools.mouseInput.enable(this.element);
        cornerstoneTools.mouseWheelInput.enable(this.element);
        const stack = this.stack;
        cornerstoneTools.addStackStateManager(this.element, ['stack']);
        cornerstoneTools.addToolState(this.element, 'stack', this.stack);
        cornerstoneTools.stackScrollWheel.activate(this.element);

    }
    disableAllMode(){
        try{
            cornerstoneTools.zoom.deactivate(this.element);
            cornerstoneTools.pan.deactivate(this.element);
            cornerstoneTools.wwwc.disable(this.element);
            cornerstoneTools.probe.deactivate(this.element,1);
            cornerstoneTools.length.deactivate(this.element,1);
            cornerstoneTools.ellipticalRoi.deactivate(this.element,1);
            cornerstoneTools.rectangleRoi.deactivate(this.element,1);
            cornerstoneTools.simpleAngle.deactivate(this.element,1);
            if (cornerstoneTools.getToolState(this.element, 'freehand')){
                const a = cornerstoneTools.getToolState(this.element, 'freehand');
                if (a.data){
                    console.log(a.data);
                    if (a.data.active){
                        cornerstoneTools.freehand.deactivate(this.element,1);
                    }
                }
            }
            // cornerstoneTools.freehand.deactivate(this.element,1);
            // cornerstoneTools.arrowAnnotate.deactivate(this.element,1);
            // cornerstoneTools.highlight.disable(this.element);
            // cornerstoneTools.highlight.deactivate(this.element,1);
            cornerstoneTools.stackScroll.deactivate(this.element, 1);
            cornerstoneTools.pan.deactivate(this.element); // 2 is middle mouse button
            cornerstoneTools.zoom.deactivate(this.element); // 4 is right mouse button
        }
        catch(err){
            console.log("CornerstoneTools disabling failed");
        }
    }
    toNavigateMode(){
        this.disableAllMode();
        cornerstoneTools.stackScroll.activate(this.element,1);
        cornerstoneTools.pan.activate(this.element, 2); // 2 is middle mouse button
        cornerstoneTools.zoom.activate(this.element, 4); // 4 is right mouse button

    }
    toPanMode(){
        this.disableAllMode();
        cornerstoneTools.pan.activate(this.element, 3);
        cornerstoneTools.zoom.activate(this.element, 4); // 4 is right mouse button
    }
    toZoomMode(){
        this.disableAllMode();
        cornerstoneTools.pan.activate(this.element, 2);
        cornerstoneTools.zoom.activate(this.element,5);
    }
    toWindowLevelMode(){
        this.disableAllMode();
        cornerstoneTools.wwwc.activate(this.element,1);
        cornerstoneTools.pan.activate(this.element, 2); // 2 is middle mouse button
        cornerstoneTools.zoom.activate(this.element, 4); // 4 is right mouse button
    }
    toLengthMode(){
        this.disableAllMode();
        cornerstoneTools.length.activate(this.element,1);
        cornerstoneTools.pan.activate(this.element, 2); // 2 is middle mouse button
        cornerstoneTools.zoom.activate(this.element, 4); // 4 is right mouse button
    }
    toAngleMode(){
        this.disableAllMode();
        cornerstoneTools.simpleAngle.activate(this.element,1);
        cornerstoneTools.pan.activate(this.element, 2); // 2 is middle mouse button
        cornerstoneTools.zoom.activate(this.element, 4); // 4 is right mouse button
    }
    toProbeMode(){
        this.disableAllMode();
        cornerstoneTools.probe.activate(this.element,1);
        cornerstoneTools.pan.activate(this.element, 2); // 2 is middle mouse button
        cornerstoneTools.zoom.activate(this.element, 4); // 4 is right mouse button
    }
    toEllipticalROIMode(){
        this.disableAllMode();
        cornerstoneTools.ellipticalRoi.activate(this.element,1);
        cornerstoneTools.pan.activate(this.element, 2); // 2 is middle mouse button
        cornerstoneTools.zoom.activate(this.element, 4); // 4 is right mouse button
    }
    toRectangleROIMode(){
        this.disableAllMode();
        cornerstoneTools.rectangleRoi.activate(this.element,1);
        cornerstoneTools.pan.activate(this.element, 2); // 2 is middle mouse button
        cornerstoneTools.zoom.activate(this.element, 4); // 4 is right mouse button
    }
    toFreeFormROIMode(){
        this.disableAllMode();
        cornerstoneTools.freehand.activate(this.element,1);
        cornerstoneTools.pan.activate(this.element, 2); // 2 is middle mouse button
        cornerstoneTools.zoom.activate(this.element, 4); // 4 is right mouse button
        // console.log(cornerstoneTools.getToolState(this.element, 'rectangleRoi'));
        // console.log(cornerstoneTools.getToolState(this.element, 'ellipticalRoi'));
        // console.log(cornerstoneTools.getToolState(this.element, 'probe'));
    }
    resizeImage(){
        cornerstone.resize(this.element, true);
        this.updateImageDisplaySize();
    }
}

