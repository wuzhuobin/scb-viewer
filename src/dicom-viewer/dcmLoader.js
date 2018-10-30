import daikon from "daikon";
import pngjs from "pngjs";

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
  for (var i=0;i<numElement;i++){
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


function httpFetch(url, requestMethod, inputHeader, inputContentBody){
  const fetch = require('node-fetch');
  var responseHeader = null;
  var output;

  output = fetch(url,{
    method:requestMethod,
    // method:"POST",
    mode:"no-cors",
    cache:"no-cache",
    headers:inputHeader,
    redirect:"follow",
    referrer: "no-referrer",
    body:inputContentBody,
  }).then(response=>{responseHeader = response.headers; return response.json()}).then(res=>{return {header:responseHeader, body:res};});

  return output;
}


class dcmLoader(){
	constructor(inputCs, inputImagePathArray, inputLoaderHint){
		this.numDcm = inputImageArray.length;
		this.imagePathArray = inputImagePathArray;
		this.cs = inputCs;
		this.loaderHint = inputLoaderHint;
		this.maxQueriedId = 0;
		this.minQueriedId = inputImageArray.length;
		this.imageSeries = [];
		for (var i=0;i<this.numDcm;i++){
			this.imageSeries.push(null);
		}
		this.failedSeries = [];
		this.onceReadSeries = [];
		this.bufferSize = 30;
		this.cacheBuffer = 5;
	}

	function BatchLoadImage(inputArray){//The input array is expected to contain only number, corresponding to the n-th slice of the required
		const self = this;
		for (var i=0;i<inputArray.length;i++){
			const imageId = inputArray[i];
			onceReadSeries.push(imageId);

			this.failedSeries = this.failedSeries.filter(item=>item!==imageId);
			if (this.imageSeries[imageId]!== null){
				console.log("rewriting " + imageId + " -th image to null");
				this.imageSeries[imageId] = null;
			}
			this.imageSeries[imageId] = httpFetch(this.imagePathArray[imageId],"GET",null,"")
			.then(response=>{
				if (response===null){
					this.failedSeries.push(imageId);
					reject("Get image failed");
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
						resolve({
							minPixelValue:imageMin,
							maxPixelValue: imageMax,
							patientPos: imagePos,
							patientOri: imageDir,
							patientName:name,
							windowCenter: image.getWindowCenter(),
							windowWidth: image.getWindowWidth(),
							getPixelData: () => image.getInterpretedData(),
							rows: image.getRows(),
							columns: image.getCols,
							height: image.getCols(),
							width: image.getRows(),
							color:fakse,
							columnPixelSpacing: colSpacing,
							rowPixelSpacing: rowSpacing,
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
					}//else (isDicom) end
				}//else (response null) end
			});
		}//for(imageSeries) end
	}//function BatchLoadImage() end


	UpdateImagesData(inputId){
		const numFailed = this.failedSeries.length;
		if (numFailed){
			console.log(numFailed+" image(s) is not loaded properly");
			BatchLoadImage(failedSeries);
		}
		if (this.onceReadSeries.length){
			var minMax = getArrayMinMax(onceReadSeries);
			if (this.maxQueriedId > minMax[1] - this.cacheBuffer){
				const currentMaxRead = minMax[1];
				const numAdditionalRead = Math.min(this.numDcm-1-currentMaxRead, this.bufferSize);
				var toReadArray = [];
				for (var j=0;j<numAdditionalRead;j++){
					toReadArray.push(currentMaxRead+j+1);
				}
				if (numAdditionalRead){
					BatchLoadImage(toReadArray);
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
					BatchLoadImage(toReadArray);
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
		if (this.failedSeries.includes(id)){
			alert("The " + id + "-th image is not loaded");
		}
		this.UpdateImagesData(sliceId);
		return this.imageSeries[sliceId];
	}
}








class dcmManager(){
	//The manage should store some instances of dcmLoader, relative to its hint
	constructor(cornerStone){
		this.loadedBuffer = [];
		this.cs = cornerStone;
	}

	loadSeries(inputImagePathArray, inputLoaderHint){
		if (this.findSeries(inputLoaderHint)){
			console.log('The series '+inputLoaderHint+' is already loaded');
			return;
		}
		else {
			//then we should "new" a dcm loader and use a object to contain it
			this.loadedBuffer.push({
				loaderHint: inputLoaderHint,
				dcmLoader: new dcmLoader(this.cs, inputImagePathArray,inputLoaderHint),
			});
			this.cs.registerImageLoader(inputLoaderHint, getImage);
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

	removeSeries(inputLoaderHint){
		const hitIndex = this.findSeries
		if (hitIndex === null){
			console.log("no need to delete");
		}
		else {
			this.loadedBuffer[i].dcmLoader.callForDestructor();
			this.loadedBuffer = this.loadedBuffer.splice(i,1);
		}
	}

	getImage(imageId){
		function getPixelData(){
			console.log(imageId);
			const signatureLocation1 = String(imageId).indexOf("://");
			if (signatureLocation1 === -1 ){
				console.log("failed to locate");
				return;
			}
			const currentId = parseInt(String(imageId).substring(signatureLocation1+3, String(imageId).length));
			const currentLoaderHint = String(imageId).substring(0,signatureLocation1)
			const currentIndex = findSeries(currentLoaderHint);
			console.log("Accessing " + currentId + "-th image of "+ currentLoaderHint);
			if (currentIndex === null){
				console.log("Load series first");
			}
			else {
				return {
					promise: this.loadedBuffer[currentIndex].getSlice(currentId),
					cancelFn: undefined
				};
			}
		}
	}



}
