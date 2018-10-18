import React from "react";

import {Button, Divider, Typography, TextField, Grid, Table, TableBody, TableCell, TableHead, TableRow,
  Collapse, TableRowColumn} from '@material-ui/core';
import {ExpandMore, ExpandLess} from '@material-ui/icons'
import { withStyles } from '@material-ui/core/styles';
import PACS from "./PACS"
import Studies from "./Studies"
import classNames from 'classnames';

const styles = theme => ({
	root:{

	},
  tableRow:{
    '&:hover': {backgroundColor: theme.palette.secondary.main,},
  },
  tableCell:{
    color: 'white',
  },
  seriesHeader:{
    backgroundColor: theme.palette.secondary.main
  },
  tableRowOpen:{
    backgroundColor: theme.palette.secondary.main,
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
        studies: [createData(
          "The Affiliated Hospital of Hangzhou Normal University", 
          "", 
          "Specials PolyTrauma (Adult)",
          "Thursday, April 26, 2018",
          "1")
        ]
      }
	}

	 handleStudyOpen = (event)  => {
    this.setState({open: !this.state.open})
     // PACS.patientInfo(this.props.patient.id,
     //    (json) =>{
     //     let studiesPromises = [];
     //     for (let i = 0; i < json.Studies.length; ++i) {
     //       studiesPromises.push(PACS.studyInfo(json.Studies[i]));
     //     }
     //     // console.log(studiesPromises);
     //     Promise.all(studiesPromises).then(
     //        (studiesJsons) => {
     //         let seriesPromises = [];
     //         for (let i = 0; i < studiesJsons.length; ++i) {
     //           for (let j = 0; j < studiesJsons[i].Series.length; ++j) {
     //             seriesPromises.push(PACS.serieInfo(studiesJsons[i].Series[j]));
     //           }
     //         }
     //         Promise.all(seriesPromises).then(
     //           (seriesJsons)=> {
     //             let series = [];
     //             for (let i in seriesJsons) {
     //               series.push(createData(
     //                 seriesJsons[i].MainDicomTags.StationName,
     //                 seriesJsons[i].MainDicomTags.SeriesDate,
     //                 seriesJsons[i].ParentStudy,
     //                 seriesJsons[i].MainDicomTags.Modality,
     //                 seriesJsons[i].MainDicomTags.SeriesNumber
     //               ));
     //               this.setState({series:series});
     //             }
     //           }
     //         );
     //       }
     //     )
     //   }
     // );
   
	  }

    render() {
    	const {open} = this.state
    	const {patient, classes} = this.props

    	return(
        <React.Fragment>
            <TableRow 
              className={classNames(classes.tableRow, {[classes.tableRowOpen]: open,})}
              id={patient.id} 
              onClick={this.handleStudyOpen}
              >
              <TableCell className={classes.tableCell}>{patient.name}</TableCell>
              <TableCell className={classes.tableCell}>{patient.patientId}</TableCell>
              <TableCell className={classes.tableCell}>{patient.birthDate}</TableCell>
              <TableCell className={classes.tableCell}>{patient.gender}</TableCell>
              <TableCell padding={'none'} colSpan={0} > 
                  {this.state.open ? <ExpandLess style={{color: 'white'}} /> : <ExpandMore style={{color: 'white'}} />}    
              </TableCell>
            </TableRow>

              {this.state.open && (
              <TableRow className={classes.tableRowOpen}>
                <TableCell padding={'none'} colSpan={12}> 
                    <Table>
                      <TableBody>
                      	{this.state.studies.map(study => {return (<Studies study={study}/>)})}
                      </TableBody>
                    </Table>
                </TableCell>
              </TableRow>
            )}
        </React.Fragment>

    	)
    }

}


export default withStyles(styles)(Patients);

                      // <TableHead>
                      //   <TableRow className={classes.seriesHeader}>
                      //     <TableCell></TableCell>
                      //     <TableCell style={{color: 'white'}}>Institution</TableCell>
                      //     <TableCell style={{color: 'white'}}>Description</TableCell>
                      //     <TableCell style={{color: 'white'}}>Requested Procedure</TableCell>
                      //     <TableCell style={{color: 'white'}}>Study Date</TableCell>
                      //     <TableCell style={{color: 'white'}}>Study ID</TableCell>
                      //     <TableCell></TableCell>
                      //   </TableRow>
                      // </TableHead>