import React from "react";

import {Button, Divider, Typography, TextField, Grid, Table, TableBody, TableCell, TableHead, TableRow} from '@material-ui/core';
import {CloudUpload} from '@material-ui/icons'

import { withStyles } from '@material-ui/core/styles';
import Upload from './Upload';

function getToday(){
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();

  if(dd<10) {
      dd = '0'+dd
  } 

  if(mm<10) {
      mm = '0'+mm
  } 

  today = yyyy + '-' + mm + '-' + dd;
  return today
}


const styles = theme => ({
  root: {

    // flexGrow: 1,
    // zIndex: 1,
    // width: '100%',
    height: 'calc(100vh - 64px)',
    // overflow: 'auto',
    // position: 'relative',
    // display: 'flex',
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.unit * 5,
    right: theme.spacing.unit * 5,
  },
  textField: {
    margin: theme.spacing.unit,
    width: 150,
  },
  button: {
    margin: theme.spacing.unit*0,
  },
  Date: {

  },

  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    marginRight: theme.spacing.unit * 2,
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing.unit * 3,
      width: 'auto',
    },
  },

});


let id = 0;
function createData(name, patientId, birthDate, gender) {
  id += 1;
  return { id, name, patientId, birthDate, gender};
}

// const rows = ;
class PACS {
  
  static allPatients(action){
    fetch("http://223.255.146.2:8042/orthanc/patients/").
      then((res) => { return res.json(); }).
      then((json) => { action(json); });
  }
  static patientInfo(id, action) {
    fetch("http://223.255.146.2:8042/orthanc/patients/" + id).
      then((res) => { return res.json(); }).
      then((json) => { action(json); });
  }

  static studyInfo(id, action) {
    fetch("http://223.255.146.2:8042/orthanc/studies/" + id).
      then((res) => { return res.json(); }).
      then((json) => { action(json); });
  }

  static serieInfo(id, action) {
    fetch("http://223.255.146.2:8042/orthanc/series/" + id).
      then((res) => { return res.json(); }).
      then((json) => { action(json); });
  }

  static serieImages(id, action) {
    fetch("http://223.255.146.2:8042/orthanc/series/" + id).
      then((res) => { return res.json(); }).
      then((json) => {
        let paths = [];
        json.Instances.forEach(element => {
          paths.push("http://223.255.146.2:8042/orthanc/instances/" + element + "/file");
        });
        action(paths);
      });
  }
}

      // createData('A123456', 'Chan Tai Man', getToday(),'M'),
      // createData('B234567', 'Wong Siu Ming', getToday(), 'F'),
class Images extends React.Component {
  constructor(props){
    super(props);
    this.state={
      upload:false,
      patientName: '',
      patientId: null,
      startDate: '',
      endDate: '',
      modality: 'all',
      rows: [],
    }
    PACS.allPatients((json) => {
      for (let i = 0; i < json.length; ++i) {
        PACS.patientInfo(json[i], (json) => {
          let row = createData(json.MainDicomTags.PatientID, json.MainDicomTags.PatientName, json.MainDicomTags.PatientBirthDate, json.MainDicomTags.PatientSex);
          const rows = this.state.rows.slice();
          rows.push(row);
          this.setState({rows: rows});
        });
      }
    });
  }

  handleUploadOpen = () => {
  this.setState({ upload: true });
  };

  handleUploadClose = () =>{
    this.setState({upload:false});
  }

  handleQueryChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  }

  render() {
    const {} = this.state
    const {classes} = this.props

    return (
      <div className={classes.root}>
        <div className="text">
        <TextField
          id="patient-name"
          label="Patient Name"
          className={classes.textField}
          value={this.state.name}
          onChange={this.handleQueryChange('patientName')}
        />
        <TextField
          id="patient-id"
          label="Patient ID"
          className={classes.textField}
          value={this.state.name}
          onChange={this.handleQueryChange('patientId')}
        />
        <TextField
          id="start-date"
          label="Start Date"
          className={classes.textField}
          type="date"
          defaultValue='1900-01-01'
          onChange={this.handleQueryChange('startDate')}
        />
        <TextField
          id="end-date"
          label="End Date"
          className={classes.textField}
          type="date"
          defaultValue={getToday()}
          onChange={this.handleQueryChange('startDate')}
        />


          <div>
            <Button variant='outlined' color="primary" className={classes.button}>
              All
            </Button>
            <Button variant='outlined' color="primary" className={classes.button}>
              1y
            </Button>
             <Button variant='outlined' color="primary" className={classes.button}>
              1m
            </Button>
             <Button variant='outlined' color="primary" className={classes.button}>
              1w
            </Button>
             <Button variant='outlined' color="primary" className={classes.button}>
              3d
            </Button>
            <Button variant='outlined' color="primary" className={classes.button}>
              1d
            </Button>
          </div>    
        </div>


        <Divider />
        
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>Patient ID</TableCell>
              <TableCell>Patient Name</TableCell>
              <TableCell>Birth Date</TableCell>
              <TableCell>Gender</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.state.rows.map( row => {
              console.log(row)
              return (
                <TableRow id={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.patientId}</TableCell>
                  <TableCell>{row.birthDate}</TableCell>
                  <TableCell>{row.gender}</TableCell>
                </TableRow>
                )
            })
            }
          </TableBody>
        </Table>


        <Button variant="fab" color="secondary" className={classes.fab} onClick={this.handleUploadOpen}>
          <CloudUpload />
        </Button>
        
        <Upload open={this.state.upload} onClose={this.handleUploadClose}/>
      </div>



    );
  }
}

export default withStyles(styles)(Images);