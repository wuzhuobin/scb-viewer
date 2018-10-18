import React from "react";

import {Button, Divider, Typography, TextField, Grid, Table, TableBody, TableCell, TableHead, TableRow,
  Collapse, TableRowColumn} from '@material-ui/core';
import {ExpandMore, ExpandLess} from '@material-ui/icons'
import { withStyles } from '@material-ui/core/styles';
import PACS from "./PACS"
import Studies from "./Studies"

const styles = theme => ({
	root:{

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
    	const {} = this.state
    	const {patient, classes} = this.props

    	return(
        <React.Fragment>
            <TableRow 
              hover
              id={patient.id} 
              onClick={this.handleStudyOpen}>
              <TableCell>{patient.name}</TableCell>
              <TableCell>{patient.patientId}</TableCell>
              <TableCell>{patient.birthDate}</TableCell>
              <TableCell>{patient.gender}</TableCell>
              <TableCell padding={'none'} colSpan={0} > 
                  {this.state.open ? <ExpandLess /> : <ExpandMore />}    
              </TableCell>
            </TableRow>

              {this.state.open && (
              <TableRow>
                <TableCell padding={'none'} colSpan={12}> 
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Institution</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Requested Procedure</TableCell>
                          <TableCell>Study Date</TableCell>
                          <TableCell>Study ID</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableHead>
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