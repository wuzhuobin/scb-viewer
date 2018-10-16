var PACS = {
    URL: function () { 
        return "http://223.255.146.2:8042/orthanc"
    },
    allPatients: function (action){
        fetch(this.URL() + "/patients/").then(
            (res) => { return res.json(); }).then((json) => { action(json); })
    },
    patientInfo: function (id, action) {
        fetch(this.URL() + "/patients/" + id).then(
            (res) => { return res.json(); }).then(
                (json) => { action(json); });
    },
    studyInfo: function (id, action) {
        fetch(this.URL() + "/studies/" + id).then(
            (res) => { return res.json(); }).then(
                (json) => { action(json); });
    },
    serieInfo: function (id, action) {
        fetch(this.URL() + "/series/" + id).then(
            (res) => { return res.json(); }).then(
                (json) => { action(json); });
    },
    serieImages: function (id, action) {
        fetch(this.URL() + "/series/" + id).then(
            (res) => { return res.json(); }).then(
                (json) => {
                    let paths = [];
                    json.Instances.forEach(element => {
                        paths.push(this.URL() + "/instances/" + element + "/file");
                    });
                    action(paths);
            });
    },
    orderedSlice: function (id, action) {
        fetch(this.URL() + "/series/" + id + "/ordered-slices").then(
            (res) => { return res.json(); }).then(
                (json) => {
                    let paths = [];
                    json.Dicom.forEach((element) => {
                        paths.push(this.URL() + element);
                    })
                });
    }
}
module.exports = PACS;