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
    color: theme.palette.primary.contrastText,
  },

  study: {
    // '&:nth-of-type(odd)': {
    //   backgroundColor: theme.palette.secondary.light,
    //},
    '&:hover': {backgroundColor: "#272727"},
  },
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

// let patienid = 0;
// function createPatientData(name, patientId, birthDate, gender) {
//   id += 1;
//   return { id, name, patientId, birthDate, gender};
// }

let id = 0;
function createStudyData(name, patientId, birthDate, gender, institution, description, requestedProcedure, studyDate, studyID)
{
  id += 1;
  return {id, name, patientId, birthDate, gender, institution, description, requestedProcedure, studyDate, studyID}
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
      studies: [],
      selectedStudy: null,
    }
  }

  componentDidMount(){

    let patients = [];
    PACS.allPatients((patientIdjsons) => {
      let patientPromises = [];
      for (let i = 0; i < patientIdjsons.length; ++i) {
        patientPromises.push(PACS.patientInfo(patientIdjsons[i]));
      }

      let studies = []
      Promise.all(patientPromises).then((patientInfoJsons)=>{
        let promises = [];
        for(let i in patientInfoJsons){
          let studiesID = patientInfoJsons[i].Studies; 
          for(let j in studiesID){
            promises.push(PACS.studyInfo(studiesID[j]));
            studies.push(
              createStudyData(
                patientInfoJsons[i].MainDicomTags.PatientName,
                patientInfoJsons[i].MainDicomTags.PatientID,
                patientInfoJsons[i].MainDicomTags.PatientBirthDate, 
                patientInfoJsons[i].MainDicomTags.PatientSex,
                null,
                null,
                null,
                null,
                null
              )
            )
            studies[studies.length-1].id = studiesID[j];
          }
        }
        Promise.all(promises).then((studiesInfoJsons)=>{
          for(let i in studiesInfoJsons){
            studies[i].institution = studiesInfoJsons[i].MainDicomTags.InstitutionName;
            studies[i].description = studiesInfoJsons[i].MainDicomTags.StudyDescription;
            studies[i].requestedProcedure =  studiesInfoJsons[i].MainDicomTags.RequestedProcedureDescription;
            studies[i].studyDate = studiesInfoJsons[i].MainDicomTags.StudyDate;
            studies[i].studyID = studiesInfoJsons[i].MainDicomTags.StudyID;
          }
          this.setState({studies: studies});
        });
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

  handleChangePage = (event, page) => {
    // this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    // this.setState({ rowsPerPage: event.target.value });
  };

  handleStudyClick = (event, study) =>{
    this.setState({selectedStudy: study})
  }

  render() {
    const {selectedStudy, studies} = this.state
    const {onSelectSeries, classes} = this.props

    return (
      <div className={classes.root}>
        <div className={classes.tableWrapper}>
          <TablePagination
              component="div"
              colSpan={20}
              count={this.state.studiesCount}
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
            {this.state.studies.map(study =>{
              return(
                <TableRow 
                    id={study.id} 
                    className={classes.study}
                    onClick={event=>{this.handleStudyClick(event, study.id)}}
                    onDoubleClick={event => {
                      PACS.studyInfo(study.id).then((json)=>{
                        let series = json.Series;
                        onSelectSeries(event, series);
                      })}}>
                    <TableCell className={classes.tableCell}>{study.patientId}</TableCell>
                    <TableCell className={classes.tableCell}>{study.name}</TableCell>
                    <TableCell className={classes.tableCell}>{study.birthDate}</TableCell>
                    <TableCell className={classes.tableCell}>{study.gender}</TableCell>
                    <TableCell className={classes.tableCell}>{study.description}</TableCell>
                    <TableCell className={classes.tableCell}>{study.institution}</TableCell>
                    <TableCell className={classes.tableCell}>{study.requestedProcedure}</TableCell>
                    <TableCell className={classes.tableCell}>{study.studyDate}</TableCell>
                  </TableRow>
                )
            })}
            </TableBody>
          </Table>
        </div>

        <Divider className={classes.divider}/>
        <div className={classes.seriesPreview}>
          <SeriesPreview study={selectedStudy} onSelectSeries={onSelectSeries}/>
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