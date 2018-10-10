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

  // var http = require('http'); 
  // var request = require('request');
  // http.get('http://127.0.0.1:8081/GetDicom', function(err, result){
  //   var res = [];
  //   result.on('data', function (chunk) {
  //       res.write(chunk);
  //   });
  //   result.on('end', function () {
  //       res.end();
  //   });
  //   console.log(res);
  // });


  return [min,max];
}

const dicomLoader = cs => {
  // const image1PixelData = new Promise(resolve => {
  //   httpGetAsync("assets/dicom-image", response => {
  //     const data = new DataView(response);
  //     const image = daikon.Series.parseImage(data);
  //     const spacing = image.getPixelSpacing();
  //     console.log(image.getImageMax());
  //     resolve({
  //       minPixelValue: image.getImageMin(),
  //       maxPixelValue: image.getImageMax(),
  //       // slope: image.getDataScaleSlope(),
  //       // intercept: image.getDataScaleIntercept(),
  //       windowCenter: image.getWindowCenter(),
  //       windowWidth: image.getWindowWidth(),
  //       getPixelData: () => image.getInterpretedData(),
  //       rows: image.getRows(),
  //       columns: image.getCols(),
  //       height: image.getCols(),
  //       width: image.getRows(),
  //       color: false,
  //       columnPixelSpacing: spacing[1],
  //       rowPixelSpacing: spacing[0],
  //       sizeInBytes: image.getRows() * image.getCols() * 2
  //     });
  //   });
  // });

  var HardCodeArray = [];
  const num_dcm = 3;
  for (var i=0;i<num_dcm;i++){
    HardCodeArray.push("assets/Test1/0"+String((i-i%100)/100)+String((i-(i-i%100)-i%10)/10)+String(i%10)+".dcm");
  }
  console.log(HardCodeArray);
  var series = new daikon.Series();


  const image1PixelData = new Promise(resolve => {

    // var num_completed = 0;

    for (var ctr in HardCodeArray){
      console.log(HardCodeArray[ctr]);
      httpGetAsync(HardCodeArray[ctr], response => {
        const data = new DataView(response);
        const image = daikon.Series.parseImage(data);
        const spacing = image.getPixelSpacing();

        if (image.getImageMin()){
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
        if (image ==null){
          console.log('imagei null');
        }
        else {
          console.log('imagei good');
        }
        series.addImage(image);
        // num_completed++;
      });
    }

    setTimeout(function(){
      if (series.images[0] == null){
        console.log('abc1');
      }
      else {
        console.log('abc2');
      }

      series.buildSeries();
      // output some header info
      console.log("Number of images read is " + series.images.length);
      console.log("Each slice is " + series.images[0].getCols() + " x " + series.images[0].getRows());
      console.log("Each voxel is " + series.images[0].getBitsAllocated() + " bits, " + 
        (series.images[0].littleEndian ? "little" : "big") + " endian");

            // concat the image data into a single ArrayBuffer
            series.concatenateImageData(null, function (imageData) {
              console.log("Total image data size is " + imageData.byteLength + " bytes");
            });
          },2000);



  });
  function getExampleImage(imageId) {
    const width = 256;
    const height = 256;

    function getPixelData() {
      if (imageId === "example://1") {
        return image1PixelData;
      }

      throw new Error("unknown imageId");
    }

    return {
      promise: new Promise(resolve =>
        getPixelData().then(pixelData =>
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
  cs.registerImageLoader("example", getExampleImage);
};

export default dicomLoader;