import React from "react";

import {Button, Divider, Typography, TextField, Grid, Table, TableBody, TableCell, TableHead, TableRow,
  Collapse, TableRowColumn} from '@material-ui/core';
import {ExpandMore, ExpandLess} from '@material-ui/icons'
import { withStyles } from '@material-ui/core/styles';
import PACS from "orthanc"
import Studies from "./Studies"
import classNames from 'classnames';

const styles = theme => ({
	root:{

	},
  tableRow:{
    '&:hover': {backgroundColor: theme.palette.secondary.main,},
  },
  tableCell:{
    color: theme.palette.primary.contrastText,
  },
  tableRowOpen:{
    backgroundColor: theme.palette.secondary.main,
  },
  study:{
    '&:hover': {backgroundColor: theme.palette.primary.dark,},
  }
})

let id = 0;
function createData(Institution, Description, RequestedProcedure, StudyDate, StudyID) {
  id += 1;
  return { id, Institution, Description, RequestedProcedure, StudyDate, StudyID};
}

class Patients extends React.Component {
	constructor(props){
    	super(props);
    	this.state={
        open:false,
        studies: []
      }
	}

  handleStudyOpen = (event) => {
    this.setState({ open: !this.state.open });
    PACS.patientInfo(this.props.patient.id,
      function (json) {
        let studiesPromises = [];
        for (let i = 0; i < json.Studies.length; ++i) {
          studiesPromises.push(PACS.studyInfo(json.Studies[i]));
        }
        Promise.all(studiesPromises).then(
          function (studiesJsons) {
            let studies = [];
            for (let i = 0; i < studiesJsons.length; ++i) {
              let study = createData(
                studiesJsons[i].MainDicomTags.InstitutionName,
                studiesJsons[i].MainDicomTags.StudyDescription,
                studiesJsons[i].MainDicomTags.RequestedProcedureDescription,
                studiesJsons[i].MainDicomTags.StudyDate,
                studiesJsons[i].MainDicomTags.StudyID
              );
              study.id = json.Studies[i];
              studies.push(study);
            }
            this.setState({ studies: studies });
          }.bind(this)
        );
      }.bind(this)
    )
  }

    render() {
    	const {open, studies} = this.state
    	const {patient, onStudyClick, onStudyDoubleClick, classes} = this.props

    	return(
        <React.Fragment>
            <TableRow 
              className={classNames(classes.tableRow, {[classes.tableRowOpen]: open,})}
              id={patient.id} 
              onClick={this.handleStudyOpen}
              >
              <TableCell padding={'none'} colSpan={0} > 
                  {this.state.open ? <ExpandLess style={{color: 'white'}} /> : <ExpandMore style={{color: 'white'}} />}    
              </TableCell>
              <TableCell className={classes.tableCell}>{patient.name}</TableCell>
              <TableCell className={classes.tableCell}>{patient.patientId}</TableCell>
              <TableCell className={classes.tableCell}>{patient.birthDate}</TableCell>
              <TableCell className={classes.tableCell}>{patient.gender}</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>

            {this.state.open && (
              this.state.studies.map(study => {
                return (
                  <TableRow id={study.id} 
                    onClick={event => onStudyClick(event, study.id)} 
                    onDoubleClick={event => {
                      PACS.studyInfo(study.id).then((json)=>{
                        let series = json.Series;

                        onStudyDoubleClick(event, series);
                      });
                    }}
                    className={classes.study}>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell className={classes.tableCell}>{study.Description}</TableCell>
                    <TableCell className={classes.tableCell}>{study.Institution}</TableCell>
                    <TableCell className={classes.tableCell}>{study.RequestedProcedure}</TableCell>
                    <TableCell className={classes.tableCell}>{study.StudyDate}</TableCell>
                  </TableRow>
                  )}))}
        </React.Fragment>
    	)
    }

}


export default withStyles(styles)(Patients);