import React from "react";

import {Button, Divider, Typography, TextField, Table, TableBody, TableCell, TableHead, TableRow, TablePagination,
TableSortLabel, IconButton,} from '@material-ui/core';
import {CloudUpload, ExpandMore, LastPage, FirstPage, KeyboardArrowRight, KeyboardArrowLeft} from '@material-ui/icons'

import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Upload from './Upload';
import Patients from './Patients';
import SeriesPreview from './SeriesPreview';
import PACS from 'orthanc';

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
    overflow: 'auto',
    backgroundColor: theme.palette.secondary.dark,
    color: theme.palette.secondary.contrastText,
    // position: 'relative',
    // display: 'flex',
    borderColor:theme.palette.primary.dark,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.unit * 5,
    right: theme.spacing.unit * 5,
    backgroundColor: theme.palette.primary.dark,
    '&:hover': {
        backgroundColor: theme.palette.primary.main,
    },
  },
  textField: {
    margin: theme.spacing.unit,
    width: 10,
  },
  button: {
    margin: theme.spacing.unit*0,
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
  table: {
    overflow: 'auto',
    color: theme.palette.secondary.contrastText,
  },
  tableWrapper: {
    overflow: 'auto',
    color: theme.palette.secondary.contrastText,
    backgroundColor: theme.palette.secondary.main,
    height: 'calc(100% - 172px)'
  },
  tablePagination: {
  },
  tablePaginationCaption: {
    color: theme.palette.primary.contrastText
  },
  tablePaginationSelectIcon: {
    color: theme.palette.primary.contrastText
  },
  tablePaginationSelect: {
    color: theme.palette.primary.contrastText
  },
  tablePaginationActions: {
    color: 'white',

  },
  seriesPreview:{
    height: '170px',
  },
  divider:{
    backgroundColor: theme.palette.secondary.dark,
    height:"2px",
  },

  tableCell:{
    color: theme.palette.primary.main,
  }
});

const tableHeadStyles = theme => ({
  root: {

    // flexGrow: 1,
    // zIndex: 1,
    // width: '100%',
    height: 'calc(100vh - 64px)',
    overflow: 'auto',
    backgroundColor: theme.palette.secondary.dark,
    color: theme.palette.secondary.contrastText
    // position: 'relative',
    // display: 'flex',
  },
});

let id = 0;
function createPatientData(name, patientId, birthDate, gender) {
  id += 1;
  return { id, name, patientId, birthDate, gender};
}



class EnhancedTableHead extends React.Component{
    constructor(props){
      super(props);
      this.state={
      }
    }

    render(){
      const {} = this.state
      const {classes} = this.props
      
      return(
        <TableHead >
            <TableRow>
              <TableCell key='patientName' numeric={false} sortDirection='asc'>
                <TableSortLabel
                  active={true}
                  style={{color: '#6fcbff'}}
                  >
                  Patient ID
                </TableSortLabel>
              </TableCell>
              <TableCell style={{color: '#6fcbff'}}>Patient Name</TableCell>
              <TableCell style={{color: '#6fcbff'}}>Date of Birth</TableCell>
              <TableCell style={{color: '#6fcbff'}}>Gender</TableCell>
              <TableCell style={{color: '#6fcbff'}}>Study</TableCell>
              <TableCell style={{color: '#6fcbff'}}>Institution</TableCell>
              <TableCell style={{color: '#6fcbff'}}>Requested Procedure</TableCell>
              <TableCell style={{color: '#6fcbff'}}>Study Date</TableCell>
            </TableRow>       
          </TableHead>
          )
    }
}

EnhancedTableHead = withStyles(tableHeadStyles)(EnhancedTableHead);

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
      patients: [createPatientData("patienid", "chan tai man", "20180101", "M"),],
      study: null,
    }
    // PACS.allPatients((patientIdjsons) => {
    //   let promises = [];
    //   for (let i = 0; i < patientIdjsons.length; ++i) {
    //     promises.push(PACS.patientInfo(patientIdjsons[i]));
    //     // PACS.patientInfo(json[i], (json) => {
    //     //   let patient = createPatientData(json.MainDicomTags.PatientID, json.MainDicomTags.PatientName, json.MainDicomTags.PatientBirthDate, json.MainDicomTags.PatientSex);
    //     //   const patients = this.state.patients.slice();
    //     //   patients.push(patient);
    //     //   this.setState({patients: patients});
    //   }
    //   Promise.all(promises).then((patientInfoJsons)=>{
    //     let patients = [];
    //     for(let i in patientInfoJsons){
    //       let patient = createPatientData(patientInfoJsons[i].MainDicomTags.PatientID, patientInfoJsons[i].MainDicomTags.PatientName, patientInfoJsons[i].MainDicomTags.PatientBirthDate, patientInfoJsons[i].MainDicomTags.PatientSex);
    //       patient.id = patientIdjsons[i];
    //       patients.push(patient);
    //     }
    //     this.setState({patients: patients});
    //   });
    // });

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

  handleChangePage = (event, page) => {
    // this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    // this.setState({ rowsPerPage: event.target.value });
  };

  handleStudyClick = (event, study) =>{
    this.setState({study: study})
  }

  render() {
    const {study} = this.state
    const {onSelectSeries, classes} = this.props

    console.log(this.state.patients)

    return (
      <div className={classes.root}>
        <div className={classes.tableWrapper}>
          <TablePagination
              component="div"
              colSpan={20}
              count={this.state.patients.length}
              rowsPerPage={5}
              page={0}
              onChangePage={this.handleChangePage}
              onChangeRowsPerPage={this.handleChangeRowsPerPage}
              labelRowsPerPage='Patients per page:'
              classes={{
                root: classes.tablePagination,
                caption: classes.tablePaginationCaption,
                selectIcon: classes.tablePaginationSelectIcon,
                select: classes.tablePaginationSelect,
                actions: classes.tablePaginationActions,
              }}
              // ActionsComponent={TablePaginationActionsWrapped}
            />

          <Table className={classes.table}>
            <EnhancedTableHead />
            <TableBody >
              {this.state.patients.map( patient => {return (<Patients patient={patient} onStudyClick={this.handleStudyClick} onStudyDoubleClick={onSelectSeries}/>)})}
            </TableBody>
          </Table>
        </div>

        <Divider className={classes.divider}/>
        <div className={classes.seriesPreview}>
          <SeriesPreview study={study} onSelectSeries={onSelectSeries}/>
        </div>

        <Button variant="fab" color="secondary" className={classes.fab} onClick={this.handleUploadOpen}>
          <CloudUpload />
        </Button>
        
        <Upload open={this.state.upload} onClose={this.handleUploadClose}/>
      </div>
    );
  }
}

export default withStyles(styles)(Images);


        // <div className="text">
        //   <TextField
        //     id="patient-name"
        //     label="Patient Name"
        //     className={classes.textField}
        //     value={this.state.name}
        //     onChange={this.handleQueryChange('patientName')}
        //   />
        //   <TextField
        //     id="patient-id"
        //     label="Patient ID"
        //     className={classes.textField}
        //     value={this.state.name}
        //     onChange={this.handleQueryChange('patientId')}
        //   />
        //   <TextField
        //     id="start-date"
        //     label="Start Date"
        //     className={classes.textField}
        //     type="date"
        //     defaultValue='1900-01-01'
        //     onChange={this.handleQueryChange('startDate')}
        //   />
        //   <TextField
        //     id="end-date"
        //     label="End Date"
        //     className={classes.textField}
        //     type="date"
        //     defaultValue={getToday()}
        //     onChange={this.handleQueryChange('startDate')}
        //   />


        //     <div>
        //       <Button variant='outlined' color="primary" className={classes.button}>
        //         All
        //       </Button>
        //       <Button variant='outlined' color="primary" className={classes.button}>
        //         1y
        //       </Button>
        //        <Button variant='outlined' color="primary" className={classes.button}>
        //         1m
        //       </Button>
        //        <Button variant='outlined' color="primary" className={classes.button}>
        //         1w
        //       </Button>
        //        <Button variant='outlined' color="primary" className={classes.button}>
        //         3d
        //       </Button>
        //       <Button variant='outlined' color="primary" className={classes.button}>
        //         1d
        //       </Button>
        //     </div>    
        // </div>

        // <Divider />