// import * as cornerstone from "cornerstone-core";
import * as pngLoader from "./pngLoader.js";


Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 4)) {s = "0" + s;}
    return s;
}

export default class pngViewer{
    constructor(inputElement, inputCornerstoneInstance){
        this.currentLoaderHint="noImage";
        this.name = null;
        this.currentId = 0;
        this.element = inputElement;
        this.cornerstoneInstance = inputCornerstoneInstance;
        this.cornerstoneInstance.enable(this.element);
        if (pngLoader.GlobalPngLoadManager.cs === null){
            pngLoader.GlobalPngLoadManager.cs = inputCornerstoneInstance;
        }
    }
    displayImage(inputPath){
        const path = this.name+"://"+ this.currentId.pad();
        pngLoader.GlobalPngLoadManager.loadSeries([inputPath], this.name);
        // console.log(inputPath)
        this.cornerstoneInstance.loadImage(path, inputPath)
        .then(image => {
            // this.cornerstoneInstance.enable(this.element);
            // console.log(this.element);
            this.cornerstoneInstance.displayImage(this.element,image);
            this.updateImageDisplaySize();
        })
        this.currentId++;
    }
    callForDelete(){
        this.cornerstoneInstance.disable(this.element);
        pngLoader.GlobalPngLoadManager.callForDelete(this.name);
    }
    resizeImage(){
        this.cornerstoneInstance.resize(this.element, true);
        this.updateImageDisplaySize();
    }
    updateImageDisplaySize(){
        var viewPort = this.cornerstoneInstance.getViewport(this.element);
        const currentImage = this.cornerstoneInstance.getImage(this.element);
        if (currentImage){
            viewPort.displayedArea.brhc = {x: currentImage.columns, y:currentImage.rows};
            this.cornerstoneInstance.setViewport(this.element, viewPort);
            this.cornerstoneInstance.fitToWindow(this.element);
        }
        else {
            console.log("display image first");
        }
    }
}