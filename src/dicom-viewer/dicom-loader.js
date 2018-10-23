import daikon from "daikon";

const httpGetAsync = (theUrl, callback) => {
  const xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = () => {
    // if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
    //   console.log('anotherabc');
    //   callback(xmlHttp.response);
    // }
    if (xmlHttp.readyState === 4) {
      if (xmlHttp.status === 200){
        callback(xmlHttp.response);
      }
      else {
        console.log('404');
        callback(null);
      }
    }
  };
  xmlHttp.open("GET", theUrl, true); // true for asynchronous
  xmlHttp.responseType = "arraybuffer";
  xmlHttp.send(null);
};

function computeImageMinMax(a){
  const dataArray = a.getInterpretedData();
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



const dicomLoader = (cs,imageArray, loaderHint) => {
  const num_dcm = imageArray.length;
  const cacheLoaderHint = loaderHint;
  var imageSeries = [];
  var maxQueryedId = 0;
  for (var i=0;i<num_dcm;i++){
    imageSeries.push(null);
  }
  var failedSeries = [];
  var onceReadSeries = [];
  const BatchReadSize = 100;
  const CacheBuffer = 50;//Must be smaller than BatchReadSize

  function BatchLoadImage(InputArray){
    console.log("Reading id of ");
    console.log(InputArray);
    for (var i=0;i<InputArray.length;i++){
      const imageId = InputArray[i];
      onceReadSeries.push(imageId);

      failedSeries = failedSeries.filter(item => item !== imageId);
      if (imageSeries[imageId]!==null){
        console.log("rewritng "+imageId+" -th image to null");
        imageSeries[imageId] = null;
      }
      imageSeries[imageId] = new Promise(function(resolve,reject){
        httpGetAsync(imageArray[imageId], response => {
          if(response===null){
            failedSeries.push(imageId);
            reject("Get image failed");
          }
          else {
            const data = new DataView(response);
            const image = daikon.Series.parseImage(data);
            const spacing = image.getPixelSpacing();
            var imageMin, imageMax, colSpacing=1, rowSpacing=1, imageDir= [1,0,0,0,1,0], imagePos = [0,0,0], name = "";
            if (image.getImageMin() && image.getImageMax()){
              imageMin = image.getImageMin();
              imageMax = image.getImageMax();
            }
            else {
              const range = computeImageMinMax(image);
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
            minPixelValue: imageMin,
            maxPixelValue: imageMax,
            patientPos: imagePos,
            patientOri: imageDir,
            patientName: name,
            windowCenter: image.getWindowCenter(),
            windowWidth: image.getWindowWidth(),
            getPixelData: () => image.getInterpretedData(),
            rows: image.getRows(),
            columns: image.getCols(),
            height: image.getCols(),
            width: image.getRows(),
            color: false,
            columnPixelSpacing: colSpacing,
            rowPixelSpacing: rowSpacing,
            sizeInBytes: image.getRows() * image.getCols() * 2,
          });
      } //else(response null) end
    });

      });
    }

  }


  BatchLoadImage([...Array(Math.min(num_dcm, BatchReadSize)).keys()]);


  function UpdateImagesData(){
    const numFailed = failedSeries.length;
    if (numFailed){
      console.log(numFailed + " image(s) is not loaded properly, namely ");
      for (var i=0;i<numFailed;i++){
        console.log(failedSeries[i]);
      }
      BatchLoadImage(failedSeries);
    }

    if (onceReadSeries.length){
      var minMax = getArrayMinMax(onceReadSeries);
      if (maxQueryedId > minMax[1]-CacheBuffer){
        const currentMaxRead = minMax[1];
        const numAdditionalRead = Math.min(num_dcm-1-currentMaxRead, BatchReadSize);
        var toReadArray = [];
        for (var j=0;j<numAdditionalRead;j++){
          toReadArray.push(currentMaxRead+j+1);
        }
        if(numAdditionalRead){
          BatchLoadImage(toReadArray);
        }
      }

    }

  }
 
  
  function getImageI(imageId) {
    // const width = 256;
    // const height = 256;

    function getPixelData() {
      const loaderHintLength = cacheLoaderHint.length;
      if (String(imageId).substring(0,loaderHintLength+3) === cacheLoaderHint+"://"){
        const id = parseInt(String(imageId).substring(loaderHintLength+3,String(imageId).length));
        console.log("Accessing " + id + "-th image out of " + imageSeries.length + " images");
        if (id>maxQueryedId){
          maxQueryedId = id;
        }

        if (failedSeries.includes(id)){
          alert("The " + id + "-th image is not loaded");
        }
        UpdateImagesData();

        return imageSeries[id];
      }
      else {
        console.log("Received unknown request starting from " + imageId);
        throw new Error("unknown imageId");
      }
    }

    return {
      promise: new Promise(resolve =>
        getPixelData()
        .then(pixelData =>
          resolve({
            imageId,
            minPixelValue: pixelData.minPixelValue,
            maxPixelValue: pixelData.maxPixelValue,
            slope: 1.0,
            intercept: 0,
            windowCenter: 127,
            windowWidth: 256,
            rows: pixelData.height,
            columns: pixelData.width,
            // height,
            // width,
            color: false,
            // columnPixelSpacing: 0.8984375,
            // rowPixelSpacing: 0.8984375,
            // sizeInBytes: width * height * 2,
            ...pixelData
          })
          )

        ),
      cancelFn: undefined
    };
  }

  // register our imageLoader plugin with cornerstone
  cs.registerImageLoader(cacheLoaderHint, getImageI);
};

export default dicomLoader;