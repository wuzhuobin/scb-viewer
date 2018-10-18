import React from "react";

import {Button, Divider, Typography, TextField, Grid, Table, TableBody, TableCell, TableHead, TableRow,
  Collapse, TableRowColumn} from '@material-ui/core';
import {ExpandMore, ExpandLess} from '@material-ui/icons'
import { withStyles } from '@material-ui/core/styles';
import PACS from "./PACS"

const styles = theme => ({
	root:{

	}
})

let id = 0;
function createData(BodyPart, Modality, ProtcolName, SeriesNumber, StationName) {
  id += 1;
  return { id, BodyPart, Modality, ProtcolName, SeriesNumber, StationName};
}

class Studies extends React.Component {
	constructor(props){
    	super(props);
    	this.state={
        open:false,
        series: [ createData("HEAD", "CT", "1HEADSeq", "1", "CT80879")
        ]
      }
	}

	handleSeriesOpen = (event)  => {
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

	handleSeriesDoubleClick = (event,id)=>{
		console.log('double click')
		console.log(event)
		console.log(id)
	}

    render() {
    	const {} = this.state
    	const {study, classes} = this.props

    	return(
    	    <React.Fragment>
                <TableRow 
                	hover
                	id={study.id} 
                	onClick={this.handleSeriesOpen}>
                  <TableCell>{study.Institution}</TableCell>
                  <TableCell>{study.Description}</TableCell>
                  <TableCell>{study.RequestedProcedure}</TableCell>
                  <TableCell>{study.StudyDate}</TableCell>
                  <TableCell>{study.StudyID}</TableCell>
                  <TableCell padding={'none'} colSpan={1} > 
                      {this.state.open ? <ExpandLess /> : <ExpandMore />}    
                  </TableCell>
                </TableRow>

                {this.state.open && (
                <TableRow>
                  <TableCell padding={'none'} colSpan={12}> 
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Body Part</TableCell>
                            <TableCell>Modality</TableCell>
                            <TableCell>Protcol Name</TableCell>
                            <TableCell>Series Number</TableCell>
                            <TableCell>Station Name</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                        	{this.state.series.map(series => {
                        		return (
                        			<TableRow id={series.id} hover onDoubleClick={event => this.handleSeriesDoubleClick(event, series.id)}>
			                          <TableCell>{series.BodyPart}</TableCell>
			                          <TableCell>{series.Modality}</TableCell>
			                          <TableCell>{series.ProtcolName}</TableCell>
			                          <TableCell>{series.SeriesNumber}</TableCell>
			                          <TableCell>{series.StationName}</TableCell>
			                        </TableRow>
			                )})}
                        </TableBody>
                      </Table>
                  </TableCell>
                </TableRow>
              )}
                </React.Fragment>

    	)
    }

}


export default withStyles(styles)(Studies);