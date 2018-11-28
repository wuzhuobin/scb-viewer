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
        this.stack = null;
        this.playingClip = null;
        this.currentMode = null;
        this.renderedCallBack = null;
        this.timer = null;
        this.checkFlag = false;
        cornerstone.enable(inputElement);
        cornerstoneTools.external.cornerstone = cornerstone;
        cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
        cornerstoneTools.external.Hammer = Hammer;
	}
    destructor(){
        if (this.element){
            dcmLoader.GlobalDcmLoadManager.abortLoadingSeries(this.currentLoaderHint);
            if (this.renderedCallBack){
                try{
                    this.element.removeEventListener("cornerstoneimagerendered", this.callBack);
                }
                catch(error){
                    console.log("Failed to remove callBack");
                }
            }
            if (this.timer){
                try{
                    clearInterval(this.timer);
                }
                catch(error){
                    console.log("Failed to remove timeout");
                }
            }
        }
    }
    reloadImage(){
        if (this.element){
            if (this.checkFlag){
                console.log("Busying checking for invalid image");
                return;
            }
            this.checkFlag = true;
            var cache = cornerstone.imageCache;
            if (cache){
                if (cache.cachedImages){
                    if (cache.cachedImages.length){
                        for (var i=0;i<cache.cachedImages.length;i++){
                            var image = cache.cachedImages[i];
                            if (image.loaded && image.imageLoadObject){
                                if (image.imageLoadObject.promise){
                                    const imageId = image.imageId;
                                    image.imageLoadObject.promise.then(res=>{
                                        if (res.color){
                                            cornerstone.imageCache.removeImageLoadObject(imageId);
                                            cornerstone.loadAndCacheImage(imageId);
                                        }
                                    })
                                }
                            }
                        }
                    }
                }
            }
        }
        this.checkFlag = false;
    }
	displayImage(inputLoaderHint){
		const returningPromise = new Promise((resolve,reject)=>{cornerstone.loadAndCacheImage(inputLoaderHint)
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
        // const cacheimageLoaderHintsArray = [...Array(inputOrderedImageList.length).keys()].map(function(number){
        //   return loaderHint+"://" + String(number);
        // });
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
                let path =  "http://223.255.146.2:8042/orthanc/instances/" + json.Instances[i] + "/file"; 
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
        const cacheInputSeries = inputSeries;

        var returningPromise = new Promise((resolve,reject)=>{
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
                this.currentLoaderHint = loaderHint;
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
                resolve("done");
            })
        })
        return returningPromise;
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
        cornerstoneTools.addStackStateManager(this.element, ['stack']);
        cornerstoneTools.addToolState(this.element, 'stack', this.stack);
        cornerstoneTools.stackScrollWheel.activate(this.element);

    }
    disableAllMode(){
        try{
            // console.log(cornerstoneTools.getElementToolStateManager(this.element))
            cornerstoneTools.stackScroll.disable(this.element);
            cornerstoneTools.zoom.disable(this.element);
            cornerstoneTools.pan.disable(this.element);
            cornerstoneTools.wwwc.disable(this.element);

            cornerstoneTools.probe.deactivate(this.element,1);
            cornerstoneTools.length.deactivate(this.element,1);
            cornerstoneTools.ellipticalRoi.deactivate(this.element,1);
            cornerstoneTools.rectangleRoi.deactivate(this.element,1);
            cornerstoneTools.simpleAngle.deactivate(this.element,1);
            cornerstoneTools.arrowAnnotate.deactivate(this.element,1);
            cornerstoneTools.highlight.disable(this.element);

            if (cornerstoneTools.getToolState(this.element, 'freehand')){
                const a = cornerstoneTools.getToolState(this.element, 'freehand');
                if (a.data){
                    if (a.data){
                        cornerstoneTools.freehand.deactivate(this.element,1);
                        cornerstoneTools.freehand.disable(this.element);
                        cornerstoneTools.freehand.enable(this.element);
                    }
                }
            }
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
        this.currentMode = 'navigate';

    }
    toPanMode(){
        this.disableAllMode();
        cornerstoneTools.pan.activate(this.element, 3);
        cornerstoneTools.zoom.activate(this.element, 4); // 4 is right mouse button
        this.currentMode = 'pan';
    }
    toZoomMode(){
        this.disableAllMode();
        cornerstoneTools.pan.activate(this.element, 2);
        cornerstoneTools.zoom.activate(this.element,5);
        this.currentMode = 'zoom';
    }
    toWindowLevelMode(){
        this.disableAllMode();
        cornerstoneTools.wwwc.activate(this.element,1);
        cornerstoneTools.pan.activate(this.element, 2); // 2 is middle mouse button
        cornerstoneTools.zoom.activate(this.element, 4); // 4 is right mouse button
        this.currentMode = 'wwwc';
    }
    toLengthMode(){
        this.disableAllMode();
        cornerstoneTools.length.enable(this.element);
        cornerstoneTools.length.activate(this.element,1);
        cornerstoneTools.pan.activate(this.element, 2); // 2 is middle mouse button
        cornerstoneTools.zoom.activate(this.element, 4); // 4 is right mouse button
        this.currentMode = 'length';
    }
    toAngleMode(){
        this.disableAllMode();
        cornerstoneTools.simpleAngle.enable(this.element);
        cornerstoneTools.simpleAngle.activate(this.element,1);
        cornerstoneTools.pan.activate(this.element, 2); // 2 is middle mouse button
        cornerstoneTools.zoom.activate(this.element, 4); // 4 is right mouse button
        this.currentMode = 'angle';
    }
    toProbeMode(){
        this.disableAllMode();
        cornerstoneTools.probe.enable(this.element);
        cornerstoneTools.probe.activate(this.element,1);
        cornerstoneTools.pan.activate(this.element, 2); // 2 is middle mouse button
        cornerstoneTools.zoom.activate(this.element, 4); // 4 is right mouse button
        this.currentMode = 'probe';
    }
    toEllipticalROIMode(){
        this.disableAllMode();
        cornerstoneTools.ellipticalRoi.enable(this.element);
        cornerstoneTools.ellipticalRoi.activate(this.element,1);
        cornerstoneTools.pan.activate(this.element, 2); // 2 is middle mouse button
        cornerstoneTools.zoom.activate(this.element, 4); // 4 is right mouse button
        this.currentMode = 'ellipticalRoi';
    }
    toRectangleROIMode(){
        this.disableAllMode();
        cornerstoneTools.rectangleRoi.enable(this.element);
        cornerstoneTools.rectangleRoi.activate(this.element,1);
        cornerstoneTools.pan.activate(this.element, 2); // 2 is middle mouse button
        cornerstoneTools.zoom.activate(this.element, 4); // 4 is right mouse button
        this.currentMode = 'rectangleRoi';
    }
    toFreeFormROIMode(){
        this.disableAllMode();
        cornerstoneTools.freehand.enable(this.element);
        cornerstoneTools.freehand.activate(this.element,1);
        cornerstoneTools.pan.activate(this.element, 2); // 2 is middle mouse button
        cornerstoneTools.zoom.activate(this.element, 4); // 4 is right mouse button
        this.currentMode = 'freehand';
    }
    toHighLightMode(){
        this.disableAllMode();
        cornerstoneTools.highlight.enable(this.element);
        cornerstoneTools.highlight.activate(this.element,1);
        cornerstoneTools.pan.activate(this.element, 2); // 2 is middle mouse button
        cornerstoneTools.zoom.activate(this.element, 4); // 4 is right mouse button
        this.currentMode = 'highlight';
    }
    toArrowAnnotateMode(){
        this.disableAllMode();
        cornerstoneTools.arrowAnnotate.enable(this.element);
        cornerstoneTools.arrowAnnotate.activate(this.element,1);
        cornerstoneTools.pan.activate(this.element, 2); // 2 is middle mouse button
        cornerstoneTools.zoom.activate(this.element, 4); // 4 is right mouse button
        this.currentMode = 'arrowAnnotate';
    }
    toPlayMode(){
        this.disableAllMode();
        if (this.playingClip){
            cornerstoneTools.stopClip(this.element);
            this.playingClip = null;
            cornerstoneTools.pan.activate(this.element, 2); // 2 is middle mouse button
            cornerstoneTools.zoom.activate(this.element, 4); // 4 is right mouse button
        }
        else {
            this.playingClip = {
                previousMode: this.currentMode,
            }
            cornerstoneTools.playClip(this.element,24);
            this.currentMode = 'playClip';
        }
    }
    invertImage(){
        var viewPort = cornerstone.getViewport(this.element);
        if (viewPort){
            viewPort.invert = !viewPort.invert;
        }
        cornerstone.setViewport(this.element, viewPort);
    }
    vflipImage(){
        var viewPort = cornerstone.getViewport(this.element);
        if (viewPort){
            viewPort.vflip = !viewPort.vflip;
        }
        cornerstone.setViewport(this.element, viewPort)
    }
    rotateImage(){
        var viewPort = cornerstone.getViewport(this.element);
        if (viewPort){
            viewPort.rotation += 90;
        }
        cornerstone.setViewport(this.element, viewPort)
    }
    hflipImage(){
        var viewPort = cornerstone.getViewport(this.element);
        if (viewPort){
            viewPort.hflip = !viewPort.hflip;
        }
        cornerstone.setViewport(this.element, viewPort)
    }
    exportImage(){
        try{
            cornerstoneTools.saveAs(this.element,"image.png");
        }
        catch(error){
            console.log("Export image failed");
        }
    }
    clearImage(){
        cornerstoneTools.clearToolState(this.element, "length");
        cornerstoneTools.clearToolState(this.element, "simpleAngle");
        cornerstoneTools.clearToolState(this.element, "probe");
        cornerstoneTools.clearToolState(this.element, "ellipticalRoi");
        cornerstoneTools.clearToolState(this.element, "rectangleRoi");
        cornerstoneTools.clearToolState(this.element, "freehand");
        cornerstoneTools.clearToolState(this.element, "arrowAnnotate");
        cornerstone.updateImage(this.element);
    }
    resetImage(){
        cornerstone.reset(this.element);
        // var viewPort = cornerstone.getViewport(this.element);
        // console.log(viewPort);
    }
    getImage(){
        return cornerstone.getImage(this.element);
    }
    getElement(){
        return this.element;
    }
    static getOrientationString(inputCosine){
        return cornerstoneTools.orientation.getOrientationString(inputCosine);
    }
    static invertOrientationString(inputString){
        return cornerstoneTools.orientation.invertOrientationString(inputString);
    }
    resizeImage(){
        cornerstone.resize(this.element, true);
        this.updateImageDisplaySize();
    }
    setRenderedCallBack(inputCallBack){
        if (this.element){
            this.renderedCallBack = inputCallBack;
            this.element.addEventListener("cornerstoneimagerendered", inputCallBack);
        }
    }
    setTimeoutCallBack(inputCallBack, interval){
        if (this.timer){
            clearInterval(this.timer);
        }
        this.timer = setInterval(inputCallBack, interval);
    }
    clearTimer(){
        if (this.timer){
            clearInterval(this.timer);
        }
    }
    getZoom(){
        if (this.element){
            const viewport = cornerstone.getViewport(this.element);
            return viewport.scale;
        }
        return '';

    }
    getWW(){
        if (this.element){
            const viewport = cornerstone.getViewport(this.element);
            if (viewport.voi){
                return viewport.voi.windowWidth;
            }
        }
        return '';
    }
    getWC(){
        if (this.element){
            const viewport = cornerstone.getViewport(this.element);
            if (viewport.voi){
                return viewport.voi.windowCenter;
            }
        }
        return '';
    }
    getLoadingProgress(){
        const hitIndex = dcmLoader.GlobalDcmLoadManager.findSeries(this.currentLoaderHint);
        if (hitIndex===null){
            return 0;
        }
        const loader = dcmLoader.GlobalDcmLoadManager.loadedBuffer[hitIndex].dcmLoader;
        if (loader){
            return loader.numLoaded/loader.numDcm;
        }
        return 0;
    }
}

