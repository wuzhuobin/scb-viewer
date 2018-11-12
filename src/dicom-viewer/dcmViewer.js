import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math";
import * as dcmLoader from "./dcmLoader";
import * as pngLoader from "./pngLoader.js"

Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 4)) {s = "0" + s;}
    return s;
}

export class dcmViewer{
	constructor(inputElement){
		this.imagePathArray=[];
		this.imageLoaderHintArray=[];
		this.currentInteractionMode=1;
		this.rowCosine=[1,0,0];
		this.columnCosine=[0,1,0];
		this.currentLoaderHint="noImage";
        this.element = inputElement;
	}
	displayImage(inputLoaderHint){
        console.log(inputLoaderHint)
		cornerstone.loadImage(inputLoaderHint)
        .then(image => {
            cornerstone.enable(this.element)
            cornerstone.displayImage(this.element,image);
        })
	}
	readImage(inputOrderedImageList, inputLoaderHint){
		var loaderHint = inputLoaderHint
		if (inputOrderedImageList === null){
			loaderHint = "noImage"
		}
        const cacheimageLoaderHintsArray = [...Array(inputOrderedImageList.length).keys()].map(function(number){
          return loaderHint+"://" + String(number);
        });
        dcmLoader.GlobalDcmLoadManager.loadSeries(inputOrderedImageList, loaderHint);
        this.imagePathArray = inputOrderedImageList
        this.currentLoaderHint = inputLoaderHint
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

          self.getImagePathList(1,1,cacheInputSeries)
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
            for (let i=0;i<queryList.length;i++){
                cacheImagePathArray.push(queryList[i]);
            }
            self.imagePathArray = cacheImagePathArray;
            self.imageLoaderHintArray = cacheimageLoaderHintsArray;
            dcmLoader.GlobalDcmLoadManager.loadSeries(cacheImagePathArray,loaderHint);
            const middleIndex = parseInt((cacheimageLoaderHintsArray.length / 2)|0);
            self.displayImage(cacheimageLoaderHintsArray[middleIndex]);
        })  
    }
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
        cornerstone.loadImage(path, 'http://127.0.0.1:8081/0003.png')
        .then(image => {
            cornerstone.enable(this.element)
            cornerstone.displayImage(this.element,image);
        })
        this.currentId++;
    }
}