import * as cornerstone from "cornerstone-core";
import * as pngLoader from "./pngLoader.js";

Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 4)) {s = "0" + s;}
    return s;
}

export class pngViewer{
    constructor(inputElement){
        this.currentLoaderHint="noImage";
        this.name = null;
        this.currentId = 0;
        this.element = inputElement;
    }
    displayImage(inputPath){
        const path = this.name+"://"+ this.currentId.pad();
        pngLoader.GlobalPngLoadManager.loadSeries([inputPath], this.name);
        console.log(this.name)
        console.log(path)
        cornerstone.loadImage(path, inputPath)
        .then(image => {
            cornerstone.enable(this.element)
            cornerstone.displayImage(this.element,image);
        })
        this.currentId++;
    }
}