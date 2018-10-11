import daikon from "daikon";

const httpGetAsync = (theUrl, callback) => {
  const xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = () => {
    if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
      callback(xmlHttp.response);
    }
  };
  xmlHttp.open("GET", theUrl, true); // true for asynchronous
  xmlHttp.responseType = "arraybuffer";
  xmlHttp.send(null);
};

function computeImageMinMax(a){
  const dataArray = a.getInterpretedData();
  // const numPixel = dataArray.length;
  var min = dataArray[0];
  var max = dataArray[0];
  var i;
  for (i=0;i<dataArray.length;i++){
    if (min>dataArray[i]){
      min = dataArray[i];
    }
    if (max<dataArray[i]){
      max = dataArray[i];
    }
  }
  return [min,max];
};

const dicomLoader = (cs,imageArray) => {
  const num_dcm = imageArray.length;
  var series = new Array(num_dcm);

  for (var ctr in imageArray){
    series[ctr] = new Promise(resolve=>{
    httpGetAsync(imageArray[ctr], response => {

      const data = new DataView(response);
      const image = daikon.Series.parseImage(data);
      const spacing = image.getPixelSpacing();
      // console.log(String(image.getImageNumber()-1)+'-th image has the follwing data');
      // console.log(image.getInterpretedData());
      if (image.getImageMin()){
        console.log("Type1");
        resolve({
          minPixelValue: image.getImageMin(),
          maxPixelValue: image.getImageMax(),
          // slope: image.getDataScaleSlope(),
          // intercept: image.getDataScaleIntercept(),
          windowCenter: image.getWindowCenter(),
          windowWidth: image.getWindowWidth(),
          getPixelData: () => image.getInterpretedData(),
          rows: image.getRows(),
          columns: image.getCols(),
          height: image.getCols(),
          width: image.getRows(),
          color: false,
          columnPixelSpacing: spacing[1],
          rowPixelSpacing: spacing[0],
          sizeInBytes: image.getRows() * image.getCols() * 2
        });
      }
      else {
        const range = computeImageMinMax(image);
        console.log("Type2");
        resolve({
          minPixelValue: range[0],
          maxPixelValue: range[1],
            // slope: image.getDataScaleSlope(),
            // intercept: image.getDataScaleIntercept(),
            windowCenter: image.getWindowCenter(),
            windowWidth: image.getWindowWidth(),
            getPixelData: () => image.getInterpretedData(),
            rows: image.getRows(),
            columns: image.getCols(),
            height: image.getCols(),
            width: image.getRows(),
            color: false,
            columnPixelSpacing: spacing[1],
            rowPixelSpacing: spacing[0],
            sizeInBytes: image.getRows() * image.getCols() * 2
          });
      }

    });

    });
  }

 
  
  function getImageI(imageId) {
    const width = 256;
    const height = 256;

    function getPixelData() {
      if (String(imageId).substring(0,10) === "example://"){
        const id = String(imageId).substring(10,String(imageId).length);
        console.log("Accessing " + id + "-th image out of " + series.length + " images");
        // console.log(series[id]);
        return series[id];
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
            minPixelValue: 0,
            maxPixelValue: 257,
            slope: 1.0,
            intercept: 0,
            windowCenter: 127,
            windowWidth: 256,
            rows: height,
            columns: width,
            height,
            width,
            color: false,
            columnPixelSpacing: 0.8984375,
            rowPixelSpacing: 0.8984375,
            sizeInBytes: width * height * 2,
            ...pixelData
          })
          )
        ),
      cancelFn: undefined
    };
  }

  // register our imageLoader plugin with cornerstone
  cs.registerImageLoader("example", getImageI);
};

export default dicomLoader;