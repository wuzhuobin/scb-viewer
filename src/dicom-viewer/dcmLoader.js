// import daikon from "daikon";
import * as daikon from "daikon";
import pngjs from "pngjs";
import * as cornerstone from "cornerstone-core";
// import * as cornerstoneTools from "cornerstone-tools";
// import * as cornerstoneMath from "cornerstone-math";

function getString(inputObject){
	if (inputObject === null){
		return '';
	}
	else {
		return inputObject.toString();
	}
}

function fakeImage(){
	return [0];
}

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

function centerRange(center, numElement, exclusiveMax){
	var returnArray = [];
	for (var i=0;i<=numElement;i++){
		const j = parseInt(((i+1)/2)|0);
		if (i%2){
			if (center+j<exclusiveMax){
				returnArray.push(center+j);
			}
		}
		else {
			if (center-j>=0){
				returnArray.push(center-j);
			}
		}
	}
	return returnArray;
}

function newAbortController(){
	signal = null;
	controller = null;
	controller = new AbortController();
	signal = controller.signal;
}

function httpFetch(url){
	// const fetch = require('node-fetch');
	var output;
	// console.log(signal);
	output = fetch(url, {signal})
	.then(response=> response.arrayBuffer())
	.catch(error=>{
		// console.log(error)
		console.log("Stop http request");
		return null;
	});
	return output;
}


class dcmLoader{
	constructor(inputCs, inputImagePathArray, inputLoaderHint){
		this.numDcm = inputImagePathArray.length;
		this.imagePathArray = inputImagePathArray;
		this.cs = inputCs;
		this.loaderHint = inputLoaderHint;
		this.maxQueriedId = 0;
		this.minQueriedId = inputImagePathArray.length;
		this.imageSeries = [];
		for (var i=0;i<this.numDcm;i++){
			this.imageSeries.push(null);
		}
		this.failedSeries = [];
		this.onceReadSeries = [];
		this.bufferSize = this.numDcm;
		this.cacheBuffer = 5;
		this.numLoaded = 0;
		this.BatchLoadImage(centerRange(parseInt((inputImagePathArray.length/2)|0),this.bufferSize, inputImagePathArray.length));
	}


	BatchLoadImage(inputArray){//The input array is expected to contain only number, corresponding to the n-th slice of the required
		const self = this;
		newAbortController();
		for (var i=0;i<inputArray.length;i++){
			const imageId = inputArray[i];
			this.onceReadSeries.push(imageId);
			this.failedSeries = this.failedSeries.filter(item=>item!==imageId);
			if (this.imageSeries[imageId]!== null){
				// console.log("rewriting " + imageId + " -th image to null");
				this.imageSeries[imageId] = null;
			}
			this.imageSeries[imageId] = new Promise(function (resolve, reject){
				httpFetch(self.imagePathArray[imageId])
				.then(response=>{
					if (response===null){
						self.failedSeries.push(imageId);
						resolve({
							minPixelValue: 0,
							maxPixelValue: 255,
							patientPos: [0,0,0],
							patientOri: [1,0,0,0,1,0],
							patientName:'',
							windowCenter: 0,
							windowWidth: 0,
							getPixelData: fakeImage,
							rows: 1,
							columns: 1,
							height: 1,
							width: 1,
							color:true,
							columnPixelSpacing: 1,
							rowPixelSpacing: 1,
							sliceThickness:1,
							studyDescription : '',
							seriesDescription: '',
							studyDate:'',
							protocolName: '',
							institutionName: '',
							seriesNumber:'',
							sliceLocation: '',
							sizeInBytes: 2,
						});
					}
					else {
						const data = new DataView(response);
						const image = daikon.Series.parseImage(data);
						var isDicom = true;
						try{
							image.getInterpretedData();
						}
						catch(err){
							console.log("assumed reading png");
							isDicom = false;
						}
						if (isDicom){
							const spacing = image.getPixelSpacing();
							const imageData = image.getInterpretedData();
							var imageMin, imageMax, colSpacing = 1, rowSpacing = 1, imageDir = [1,0,0,0,1,0], imagePos = [0,0,0], name = '';
							var imageSliceThickness = '', imageStudyDescription = '', imageSeriesDescription = '', imageRows = '', imageColumns = '';
							var imageStudyDate = '', imageProtocolName = '', imageInstitutionName = '', imageSeriesNumber = '', imageSliceLocation = '';
							if (image.getImageMin() && image.getImageMax()){
								imageMin = image.getImageMin();
								imageMax = image.getImageMax();
							}
							else {
								const range = getArrayMinMax(imageData);
								imageMin = range[0];
								imageMax = range[1];
							}
							if (spacing){
								colSpacing = spacing[1];
								rowSpacing = spacing[0];
							}
							if (image.getImageDirections()){
								imageDir = image.getImageDirections();
							}
							if (image.getImagePosition()){
								imagePos = image.getImagePosition();
							}
							if (image.getPatientName()){
								name = image.getPatientName();
							}
							if (image.getTag(0x0018, 0x0050)){
								imageSliceThickness = getString(image.getTag(0x0018, 0x0050)['value']);
							}
							if (image.getTag(0x0008, 0x1030)){
								imageStudyDescription = getString(image.getTag(0x0008, 0x1030)['value']);
							}
							if (image.getTag(0x0008, 0x103E)){
								imageSeriesDescription = getString(image.getTag(0x0008, 0x103E)['value']);
							}
							if (image.getTag(0x0028, 0x0010)){
								imageRows = getString(image.getTag(0x0028, 0x0010)['value']);
							}
							if (image.getTag(0x0028, 0x0011)){
								imageColumns = getString(image.getTag(0x0028, 0x0011)['value']);
							}
							if (image.getTag(0x0008, 0x0020)){
								imageStudyDate = getString(image.getTag(0x0008, 0x0020)['value']);
							}
							if (image.getTag(0x0018, 0x0030)){
								imageProtocolName = getString(image.getTag(0x0018, 0x0030)['value']);
							}
							if (image.getTag(0x0008, 0x0080)){
								imageInstitutionName = getString(image.getTag(0x0008, 0x0080)['value']);
							}
							if (image.getTag(0x0020, 0x0011)){
								imageSeriesNumber = getString(image.getTag(0x0020, 0x0011)['value']);
							}
							if (image.getTag(0x0020, 0x1041)){
								imageSliceLocation = getString(image.getTag(0x0020, 0x1041)['value']);
							}
							self.numLoaded++;
							resolve({
								minPixelValue: imageMin,
								maxPixelValue: imageMax,
								patientPos: imagePos,
								patientOri: imageDir,
								patientName:name,
								windowCenter: image.getWindowCenter(),
								windowWidth: image.getWindowWidth(),
								getPixelData: () => image.getInterpretedData(),
								rows: image.getRows(),
								columns: image.getCols(),
								height: image.getCols(),
								width: image.getRows(),
								color:false,
								columnPixelSpacing: colSpacing,
								rowPixelSpacing: rowSpacing,
								sliceThickness:imageSliceThickness,
								studyDescription : imageStudyDescription,
								seriesDescription: imageSeriesDescription,
								studyDate:imageStudyDate,
								protocolName: imageProtocolName,
								institutionName: imageInstitutionName,
								seriesNumber:imageSeriesNumber,
								sliceLocation: imageSliceLocation,
								sizeInBytes: image.getRows()*image.getCols()*2,
							});
						}
						else {
						//we shall assume it is png
						var png = new pngjs.PNG().parse(response,function(error,data){
							if (error){
								reject(null);
							}
							else {
								var array = data.data;
								const range = getArrayMinMax(array);
								self.numLoaded++;
								resolve({
									minPixelValue:range[0],
									maxPixelValue:range[1],
									getPixelData:()=>array,
									rows: data.height,
									columns:data.width,
									height:data.height,
									width:data.width,
									color:false,
									columnPixelSpacing:1,
									rowPixelSpacing:1,
									sizeInBytes:data.width*data.height*2,
								});
							}//else (err) end
						})
					}//else (isDicom) end
				}//else (response null) end
			})//then() end
			});

		}//for(imageSeries) end
	}//function BatchLoadImage() end


	UpdateImagesData(inputId){
		for (var i=0;i<this.numDcm;i++){
			if (this.imageSeries[i].color){
				console.log("abc");
			}
		}
		const numFailed = this.failedSeries.length;
		if (numFailed){
			console.log(numFailed+" image(s) is not loaded properly");
			this.BatchLoadImage(this.failedSeries);
		}
		if (this.onceReadSeries.length){
			var minMax = getArrayMinMax(this.onceReadSeries);
			if (this.maxQueriedId > minMax[1] - this.cacheBuffer){
				const currentMaxRead = minMax[1];
				const numAdditionalRead = Math.min(this.numDcm-1-currentMaxRead, this.bufferSize);
				var toReadArray = [];
				for (var j=0;j<numAdditionalRead;j++){
					toReadArray.push(currentMaxRead+j+1);
				}
				if (numAdditionalRead){
					this.BatchLoadImage(toReadArray);
				}
			}
			else if (this.minQueriedId<minMax[0]+this.cacheBuffer){
				const currentMinRead = minMax[0];
				const numAdditionalRead = Math.min(currentMinRead,this.bufferSize);
				var toReadArray = [];
				for (var j=0;j<numAdditionalRead;j++){
					toReadArray.push(currentMinRead-j-1);
				}
				if (numAdditionalRead){
					this.BatchLoadImage(toReadArray);
				}
			}
		}
	}

	callForDestructor(){
		for (var i in this.imageSeries){
			this.imageSeries[i] = null;
		}
	}
	getSlice(sliceId){
		if (sliceId>this.maxQueriedId){
			this.maxQueriedId = sliceId;
		}
		if (sliceId<this.minQueriedId){
			this.minQueriedId = sliceId;
		}
		if (this.failedSeries.includes(sliceId)){
			// alert("The " + sliceId + "-th image is not loaded");
			return null;
		}
		this.UpdateImagesData(sliceId);
		return this.imageSeries[sliceId];
	}
	stopLoading(){
		console.log("Abort!!!!!!!!!!!!!!!!!!!!!!");
		controller.abort();
	}
}


export class dcmManager{
	constructor(cornerStone){
		this.loadedBuffer = [];
		this.cs = cornerStone;
	}

	getProgress(inputLoaderHint){
		const self = this;
		const hitIndex = self.findSeries(inputLoaderHint)
		if (hitIndex!==null){
			return (self.loadedBuffer[hitIndex].dcmLoader.numLoaded) / self.loadedBuffer[hitIndex].dcmLoader.numDcm;
		}
		else {
			console.log("can't find loader hint "+ inputLoaderHint)
			return 0
		}
	}

	loadSeries(inputImagePathArray, inputLoaderHint){
		const self = this;
		if (this.findSeries(inputLoaderHint)!== null){
			console.log('The series '+inputLoaderHint+' is already loaded');
			return;
		}
		else {
			//then we should "new" a dcm loader and use a object to contain it
			this.loadedBuffer.push({
				loaderHint: inputLoaderHint,
				dcmLoader: new dcmLoader(this.cs, inputImagePathArray,inputLoaderHint),
			});
			this.cs.registerImageLoader(inputLoaderHint, self.getImage);
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
	abortLoadingSeries(inputLoaderHint){
		const hitIndex = this.findSeries(inputLoaderHint)
		if (hitIndex === null){
			console.log("no need to delete");
		}
		else {
			this.loadedBuffer[hitIndex].dcmLoader.stopLoading();
		}
	}
	removeSeries(inputLoaderHint){
		console.log('remove')
		var self = this
		const hitIndex = self.findSeries(inputLoaderHint)
		if (hitIndex === null){
			console.log("no need to delete");
		}
		else {
			console.log(hitIndex)
			console.log(self.loadedBuffer)
			console.log(self.loadedBuffer[hitIndex])
			self.loadedBuffer[hitIndex].dcmLoader.callForDestructor();
			self.loadedBuffer.splice(hitIndex,1);
			console.log(self.loadedBuffer)
			console.log(self)
		}
	}

	getImage(imageId){
		function getPixelData(){
			const signatureLocation1 = String(imageId).indexOf("://");
			if (signatureLocation1 === -1 ){
				console.log("failed to locate");
				return;
			}
			const currentId = parseInt(String(imageId).substring(signatureLocation1+3, String(imageId).length));
			const currentLoaderHint = String(imageId).substring(0,signatureLocation1)
			const currentIndex = GlobalDcmLoadManager.findSeries(currentLoaderHint);
			console.log("Accessing " + currentId + "-th image of "+ currentLoaderHint);
			if (currentIndex === null){
				console.log("Load series first");
			}
			else {
				return GlobalDcmLoadManager.loadedBuffer[currentIndex].dcmLoader.getSlice(currentId);
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
						color: true,
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
var controller = new AbortController();
var signal = controller.signal;

export var GlobalDcmLoadManager = new dcmManager(cornerstone)