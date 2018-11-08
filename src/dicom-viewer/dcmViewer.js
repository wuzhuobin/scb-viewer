import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math";
import * as dcmLoader from "./dcmLoader";



export default class dcmViewer{
	constructor(inputElement){
        console.log("abc");
		this.imagePathArray=[];
		this.imageLoaderHintArray=[];
		this.currentInteractionMode=1;
		this.rowCosine=[1,0,0];
		this.columnCosine=[0,1,0];
		this.currentLoaderHint="noImage";
        this.element = inputElement
		cornerstone.enable(this.element)
	}
	displayImage(){
        console.log("display!")
		cornerstone.loadImage(this.imageLoaderHintArray[ parseInt((this.imageLoaderHintsArray.length / 2)|0)])
        .then(image => {
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
        return new Promise(function(resolve,reject){
            resolve(['http://192.168.1.108:8080/0002.png']);
        })

        return new Promise(function(resolve,reject){
            var queryResult =   fetch("http://223.255.146.2:8042/orthanc/series/" + Path1+ "/ordered-slices")
            .then((res)=>{return res.json();})
            .then((json)=>{
                let cacheImagePathArray = [];
                for (let i=0;i<json.Dicom.length;++i){
                    let path = "http://223.255.146.2:8042/orthanc" + json.Dicom[i]; 
                    cacheImagePathArray.push(path);
                }
            return cacheImagePathArray
            })
            resolve(queryResult);
        })
    }
    loadImageFromPacs(inputSeries){
        console.log(inputSeries)
        const self = this
        const returningPromise = new Promise(function(resolve,reject){
            const cacheInputSeries = inputSeries;
            self.getImagePathList(1,1,cacheInputSeries)
            .then((queryList)=>{
                var cacheImagePathArray = [];
                var loaderHint = cacheInputSeries;
                if (queryList === null){
                    loaderHint = "noImage";
                }
                const cacheimageLoaderHintsArray = [...Array(queryList.length).keys()].map(function(number){
                    return loaderHint+"://" + String(number);
                });
                for (let i=0;i<queryList.length;i++){
                    cacheImagePathArray.push(queryList[i]);
                }
                self.imagePathArray = cacheImagePathArray;
                self.imageLoaderHintArray = cacheimageLoaderHintsArray;
                console.log(cacheImagePathArray)
                console.log(loaderHint)
                console.log(cacheimageLoaderHintsArray)
                console.log(queryList)
                console.log(self)
                dcmLoader.GlobalDcmLoadManager.loadSeries(cacheImagePathArray,loaderHint);
            })
        })
        return returningPromise;
    }








}