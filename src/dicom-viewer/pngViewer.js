import * as cornerstone from "cornerstone-core";
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
    }
    displayImage(inputPath){
        const path = this.name+"://"+ this.currentId.pad();
        pngLoader.GlobalPngLoadManager.loadSeries([inputPath], this.name);
        cornerstone.loadImage(path, inputPath)
        .then(image => {
            this.cornerstoneInstance.enable(this.element);
            this.cornerstoneInstance.displayImage(this.element,image);
        })
        this.currentId++;
    }
    callForDelete(){
        this.cornerstoneInstance.disable(this.element);
        pngLoader.GlobalPngLoadManager.callForDelete(this.name);
    }
    resizeImage(){
        this.cornerstoneInstance.resize(this.element);
    }
}