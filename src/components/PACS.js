var PACS = {
    URL: function () { 
        return "http://223.255.146.2:8042/orthanc"
    },
    allPatients: function (action){
        fetch(this.URL() + "/patients/").then(
            (res) => { return res.json(); }).then((json) => { action(json); })
    },
    patientInfo: function (id, action) {
        let ret = fetch(this.URL() + "/patients/" + id).then(
            function (res)  { return res.json(); });
        if(action == undefined){
            return ret;
        }
        ret.then(function(json) { action(json); });
    },
    studyInfo: function (id, action) {
        let ret = fetch(this.URL() + "/studies/" + id).then(
            function (res) { return res.json(); });
        if(action == undefined){
            return ret;
        }
        ret.then(function (json){ action(json); });
    },
    serieInfo: function (id, action) {
        let ret = fetch(this.URL() + "/series/" + id).then(
           function (res) { return res.json(); });
           if(action == undefined){
               return ret;
           }
        ret.then(function(json) { action(json); });
    },
    orderedSlice: function (id, action) {
        let ret = fetch(this.URL() + "/series/" + id + "/ordered-slices").then(
            function(res) { return res.json(); }).then(
                function (json) {
                    let paths = [];
                    json.Dicom.forEach(function (element) { paths.push(PACS.URL() + element); })
                    return paths;
                });
        if(action == undefined){
            return ret;
        }
        ret.then(function (paths) { action(paths); })
    }
}
module.exports = PACS;