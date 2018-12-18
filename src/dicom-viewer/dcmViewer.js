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
                // console.log(cacheimageLoaderHintsArray);
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
        // cornerstoneTools.brush.enable(this.element);


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
            if (cornerstoneTools.getToolState(this.element, 'brush')){
                cornerstoneTools.brush.deactivate(this.element,1);
            }


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
    toDrawMode(){
        this.disableAllMode();
        cornerstoneTools.brush.enable(this.element);
        cornerstoneTools.brush.activate(this.element,1);
        cornerstoneTools.pan.activate(this.element, 2); // 2 is middle mouse button
        cornerstoneTools.zoom.activate(this.element, 4); // 4 is right mouse button
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

        //clear brush data
        if (cornerstoneTools.globalImageIdSpecificToolStateManager){
            var curToolState = cornerstoneTools.globalImageIdSpecificToolStateManager.toolState
            console.log(curToolState)
            console.log(Array.from(curToolState))
            for (var imageid in curToolState){
                console.log(imageid)
                if (curToolState.hasOwnProperty(imageid)){
                    if(curToolState[imageid].brush){
                        if (curToolState[imageid].brush.data){
                            for (var i=0;i<curToolState[imageid].brush.data.length;i++){
                                curToolState[imageid].brush.data[i].pixelData.fill(0)
                            } 
                        }
                    }
                }

            }
        }
        
        cornerstone.updateImage(this.element);
    }
    resetImage(){
        cornerstone.reset(this.element);
        // var viewPort = cornerstone.getViewport(this.element);
        // console.log(viewPort);
    }
    saveState(){
        var appState = cornerstoneTools.appState.save([this.element]);
        var serializedState = JSON.stringify(appState);
        console.log(serializedState);
    }
    loadState(){
        const hardCode = '{"imageIdToolState":{"8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://28":{"length":{"data":[{"visible":true,"active":false,"handles":{"start":{"x":213.22772277227722,"y":89.34653465346534,"highlight":true,"active":false},"end":{"x":116.27722772277227,"y":180.59405940594058,"highlight":true,"active":false},"textBox":{"active":false,"hasMoved":false,"movesIndependently":false,"drawnIndependently":true,"allowedOutsideImage":true,"hasBoundingBox":true,"x":213.22772277227722,"y":89.34653465346534,"boundingBox":{"width":76.6943359375,"height":25,"left":355,"top":128.5}}},"length":41.605369413607434,"invalidated":true}]},"simpleAngle":{"data":[{"visible":true,"active":false,"handles":{"start":{"x":273.42574257425747,"y":77.94059405940594,"highlight":true,"active":false},"middle":{"x":257.5841584158416,"y":168.55445544554456,"highlight":true,"active":false},"end":{"x":348.19801980198025,"y":117.86138613861387,"highlight":true,"active":false},"textBox":{"active":false,"hasMoved":false,"movesIndependently":false,"drawnIndependently":true,"allowedOutsideImage":true,"hasBoundingBox":true,"x":214.15594059405944,"y":168.55445544554456,"boundingBox":{"width":53.53515625,"height":25,"left":346.46484375000006,"top":253.5}}},"rAngle":50.76}]},"probe":{"data":[{"visible":true,"active":false,"handles":{"end":{"x":194.21782178217822,"y":182.4950495049505,"highlight":true,"active":false}},"invalidated":true}]},"ellipticalRoi":{"data":[{"visible":true,"active":false,"invalidated":false,"handles":{"start":{"x":112.47524752475248,"y":252.1980198019802,"highlight":true,"active":false},"end":{"x":217.02970297029702,"y":359.28712871287127,"highlight":true,"active":false},"textBox":{"active":false,"hasMoved":false,"movesIndependently":false,"drawnIndependently":true,"allowedOutsideImage":true,"hasBoundingBox":true,"x":217.02970297029702,"y":305.74257425742576,"boundingBox":{"width":130.05126953125,"height":65,"left":351,"top":450}}},"meanStdDev":{"count":8796,"mean":309.84515688949523,"variance":23412.773204147743,"stdDev":153.0123302356635},"area":861.713707594759}]},"rectangleRoi":{"data":[{"visible":true,"active":false,"invalidated":false,"handles":{"start":{"x":313.34653465346537,"y":244.59405940594058,"highlight":true,"active":false},"end":{"x":389.3861386138614,"y":382.73267326732673,"highlight":true,"active":false},"textBox":{"active":false,"hasMoved":false,"movesIndependently":false,"drawnIndependently":true,"allowedOutsideImage":true,"hasBoundingBox":true,"x":389.3861386138614,"y":313.66336633663366,"boundingBox":{"width":142.56103515625,"height":65,"left":623,"top":462.5}}},"meanStdDev":{"count":10703,"mean":332.54068952630104,"variance":16108.833974559588,"stdDev":126.92058136708793},"area":1025.7817860994023}]}}},"elementToolState":{"":{"stack":{"data":[{"currentImageIdIndex":28,"imageIds":["8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://0","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://1","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://2","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://3","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://4","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://5","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://6","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://7","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://8","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://9","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://10","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://11","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://12","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://13","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://14","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://15","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://16","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://17","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://18","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://19","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://20","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://21","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://22","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://23","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://24","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://25","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://26","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://27","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://28","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://29","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://30","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://31","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://32","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://33","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://34","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://35","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://36","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://37","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://38","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://39","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://40","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://41","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://42","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://43","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://44","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://45","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://46","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://47","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://48","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://49","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://50","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://51","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://52","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://53","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://54","8fc4af35-81453fdd-94399d36-7cc2c958-a6965de4://55"]}]}}},"elementViewport":{"":{"scale":1.578125,"translation":{"x":0,"y":0},"voi":{"windowWidth":1503,"windowCenter":751},"pixelReplication":false,"rotation":0,"hflip":false,"vflip":false,"labelmap":false,"displayedArea":{"tlhc":{"x":1,"y":1},"brhc":{"x":512,"y":512},"rowPixelSpacing":0.3125,"columnPixelSpacing":0.3125,"presentationSizeMode":"NONE"}}}}'
        var appState = JSON.parse(hardCode);
        cornerstoneTools.appState.restore(appState);
        cornerstoneTools.length.enable(this.element);
        cornerstoneTools.simpleAngle.enable(this.element);
        cornerstoneTools.probe.enable(this.element);
        cornerstoneTools.ellipticalRoi.enable(this.element);
        cornerstoneTools.rectangleRoi.enable(this.element);
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
    setBrushSize(input_size){
        var size = Math.round(input_size);
        if(input_size >=20){
            size = 20;
        }
        if (input_size<=1){
            size = 1;
        }
        // console.log(size);
        var brushConfig = cornerstoneTools['brush'].getConfiguration();
        if(brushConfig){
            brushConfig.radius = size
            cornerstoneTools['brush'].setConfiguration(brushConfig)
        }
    }
    setBrushColor(input_colour_enum){
        var color_enum = Math.round(input_colour_enum);
        if(input_colour_enum >=5){
            color_enum = 5;
        }
        if (input_colour_enum<=1){
            color_enum = 1;
        }
        // console.log(color_enum);
        cornerstoneTools['brush'].changeDrawColor(color_enum)
    }

}

