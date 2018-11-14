import pngjs from "pngjs";
import * as cornerstone from "cornerstone-core";

function getArrayMinMax(a){
	const dataArray = a;
	var min = dataArray[0];
	var max = dataArray[0];
	for (var i=0;i<dataArray.length;i++){
		if (min>dataArray[i]){
			min = dataArray[i];
		}
		if (max<dataArray[i]){
			max = dataArray[i];
		}
	}
	return [min,max];
};

function httpFetch(url, requestMethod){
	// const fetch = require('node-fetch');
	// var output;

	return fetch(url)
	.then(response=> {console.log(response);response.arrayBuffer()})
	.catch(error=>null);
	// return output;
}


export class pngLoader{
	constructor(inputLoaderHint){
		this.inputLoaderHint = inputLoaderHint;
		this.imageSeries = [];
	}
	loadImage(inputPath){
		this.imageSeries.push(null);
		this.imageSeries[this.imageSeries.length-1] = new Promise(function(resolve,reject){
			httpFetch(inputPath)
			.then(response=>{
				if (response===null){
					reject("Get image failed");
				}
				else {
					// console.log(response);
					var png = new pngjs.PNG().parse(response,function(error,data){
						if (error){
							reject(null);
						}
						else {
							var array = data.data;
							const range = getArrayMinMax(array);
							resolve({
								minPixelValue:range[0],
								maxPixelValue:range[1],
								getPixelData:()=>array,
								rows: data.height,
								columns:data.width,
								height:data.height,
								width:data.width,
								color:true,
								columnPixelSpacing:1,
								rowPixelSpacing:1,
								sizeInBytes:data.width*data.height*2,
							});
						}//else (err) end
					})
				}
			})
		})
		return this.imageSeries[this.imageSeries.length-1]
	}
	loadImageFromBuffer(inputArrayBuffer){
		this.imageSeries.push(null);
		this.imageSeries[this.imageSeries.length-1] = new Promise(function(resolve,reject){
			var png = new pngjs.PNG().parse(inputArrayBuffer,function(error,data){
				if (error){
					reject(null);
				}
				else {
					var array = data.data;
					const range = getArrayMinMax(array);
					resolve({
						minPixelValue:range[0],
						maxPixelValue:range[1],
						getPixelData:()=>array,
						rows: data.height,
						columns:data.width,
						height:data.height,
						width:data.width,
						color:true,
						columnPixelSpacing:1,
						rowPixelSpacing:1,
						sizeInBytes:data.width*data.height*2,
					});
				}//else (err) end
			})

		})
		return this.imageSeries[this.imageSeries.length-1]
	}
}

export class pngManager{
	constructor(){
		this.loadedBuffer = [];
	}
	loadSeries(inputImagePathArray, inputLoaderHint){
		const self = this;
		if (this.findSeries(inputLoaderHint)!== null){
			console.log('The series '+inputLoaderHint+' is already loaded');
			return;
		}
		else {
			//then we should "new" a dcm loader and use a object to contain it
			console.log(inputLoaderHint);
			this.loadedBuffer.push({
				loaderHint: inputLoaderHint,
				pngLoader: new pngLoader(this.cs, inputImagePathArray,inputLoaderHint),
			});
			cornerstone.registerImageLoader(inputLoaderHint, self.getImage);
		}
	}
	findSeries(inputLoaderHint){
		var hitIndex = null;
		for (var i in this.loadedBuffer){
			if (this.loadedBuffer[i].loaderHint === inputLoaderHint){
				hitIndex = i;
				break;
			}
		}
		return hitIndex;
	}
    callForDelete(inputLoaderHint){
		console.log('remove')
		const hitIndex = this.findSeries(inputLoaderHint)
		if (hitIndex === null){
			console.log("no need to delete");
		}
		else {
			console.log(hitIndex)
			console.log(this.loadedBuffer)
			console.log(this.loadedBuffer[hitIndex])
			// this.loadedBuffer[hitIndex].dcmLoader.callForDestructor();
			this.loadedBuffer.splice(hitIndex,1);
			console.log(this.loadedBuffer)
			console.log(this)
		}
    }

	getImage(imageId, inputImagePath){
		function getPixelData(){
			const signatureLocation1 = String(imageId).indexOf("://");
			if (signatureLocation1 === -1 ){
				console.log("failed to locate");
				return;
			}
			const currentId = parseInt(String(imageId).substring(signatureLocation1+3, String(imageId).length));
			const currentLoaderHint = String(imageId).substring(0,signatureLocation1)
			const currentIndex = GlobalPngLoadManager.findSeries(currentLoaderHint);
			console.log("Accessing " + currentId + "-th image of "+ currentLoaderHint);
			if (currentIndex === null){
				console.log("Load series first");
			}
			else {
				if (inputImagePath.length < 1000){
					console.log(inputImagePath)
					return GlobalPngLoadManager.loadedBuffer[currentIndex].pngLoader.loadImage(inputImagePath);
				}
				else {
					return GlobalPngLoadManager.loadedBuffer[currentIndex].pngLoader.loadImageFromBuffer(inputImagePath);
				}
				// return GlobalPngLoadManager.loadedBuffer[currentIndex].pngLoader.loadImage('http://127.0.0.1:8081/0002.png');
			}
		}


		return {
			promise: new Promise(resolve => getPixelData()
				.then(pixelData => {
					resolve({
						imageId,
						minPixelValue: 0,
						maxPixelValue: 500,
						slope: 1.0,
						intercept: 0,
						windowCenter: 127,
						windowWidth: 256,
						rows: pixelData.height,
						columns: pixelData.width,
						height:1024,
						width:1024,
						color: false,
						// columnPixelSpacing: 1,
						// rowPixelSpacing: 1,
						// sizeInBytes: 128 * 128 * 2,
						// getPixelData: pixelData.getPixelData,
						...pixelData
					})
				})),
			cancelFn: undefined,
		}
	}


}

export var GlobalPngLoadManager = new pngManager
