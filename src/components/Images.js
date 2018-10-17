import React from "react";

import {Button, Divider, Typography, TextField, Grid, Table, TableBody, TableCell, TableHead, TableRow,
  Collapse, TableRowColumn} from '@material-ui/core';
import {CloudUpload, ExpandMore} from '@material-ui/icons'

import { withStyles } from '@material-ui/core/styles';
import Upload from './Upload';
import Patients from './Patients';
import PACS from './PACS';

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
  images:{
    width: '100%'
  }

});


let id = 0;
function createPatientData(name, patientId, birthDate, gender) {
  id += 1;
  return { id, name, patientId, birthDate, gender};
}


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
      patients: []
    }
    PACS.allPatients((patientIdjsons) => {
      let promises = [];
      for (let i = 0; i < patientIdjsons.length; ++i) {
        promises.push(PACS.patientInfo(patientIdjsons[i]));
        // PACS.patientInfo(json[i], (json) => {
        //   let patient = createPatientData(json.MainDicomTags.PatientID, json.MainDicomTags.PatientName, json.MainDicomTags.PatientBirthDate, json.MainDicomTags.PatientSex);
        //   const patients = this.state.patients.slice();
        //   patients.push(patient);
        //   this.setState({patients: patients});
      }
      Promise.all(promises).then((patientInfoJsons)=>{
        let patients = [];
        for(let i in patientInfoJsons){
          let patient = createPatientData(patientInfoJsons[i].MainDicomTags.PatientID, patientInfoJsons[i].MainDicomTags.PatientName, patientInfoJsons[i].MainDicomTags.PatientBirthDate, patientInfoJsons[i].MainDicomTags.PatientSex);
          patient.id = patientIdjsons[i];
          patients.push(patient);
        }
        this.setState({patients: patients});
      });
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
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.state.patients.map( patient => {return (<Patients patient={patient}/>)})}
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



                    //   {this.state.images.map(images=>{
                    // console.log(images)
                    // return(
                    //   null
                    // )

                //                     <Table>
                //   <TableHead>
                //     <TableRow>
                //       <TableCell>Institution</TableCell>
                //       <TableCell></TableCell>
                //       <TableCell>Study Date</TableCell>
                //       <TableCell>Study ID</TableCell>
                //       <TableCell>Modality</TableCell>
                //       <TableCell>Modality</TableCell>
                //       <TableCell>Series Number</TableCell>
                //       <TableCell>Station Name</TableCell>
                //   </TableRow>
                //   </TableHead>
                // </Table>