import React from "react";

import {Button, Divider, Typography, TextField, Grid, Table, TableBody, TableCell, TableHead, TableRow,
  Collapse, TableRowColumn} from '@material-ui/core';
import {ExpandMore, ExpandLess} from '@material-ui/icons'
import { withStyles } from '@material-ui/core/styles';
import PACS from "orthanc"


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
        series: [ ]
      }
	}

	handleSeriesOpen = (event)  => {
    this.setState({open: !this.state.open})
    PACS.studyInfo(this.props.study.id,
      function (json) {
        let seriesPromises = [];
        for (let i = 0; i < json.Series.length; ++i) {
          seriesPromises.push(PACS.serieInfo(json.Series[i]));
        }
        console.log(json);
        Promise.all(seriesPromises).then(
          function (seriesJsons) {
            let series = [];
            for (let i = 0; i < seriesJsons.length; ++i) {
              let serie = createData(
                seriesJsons[i].MainDicomTags.BodyPartExamined,
                seriesJsons[i].MainDicomTags.Modality,
                seriesJsons[i].MainDicomTags.ProtocolName,
                seriesJsons[i].MainDicomTags.SeriesNumber,
                seriesJsons[i].MainDicomTags.StationName
              );
              serie.id = json.Series[i];
              series.push(serie);
            }
            this.setState({ series: series });
          }.bind(this)
        );
      }.bind(this)
    )
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

                  <TableCell style={{color: 'white'}}>{study.Institution}</TableCell>
                  <TableCell style={{color: 'white'}}>{study.Description}</TableCell>
                  <TableCell style={{color: 'white'}}>{study.RequestedProcedure}</TableCell>
                  <TableCell style={{color: 'white'}}>{study.StudyDate}</TableCell>
                  <TableCell style={{color: 'white'}}>{study.StudyID}</TableCell>
                  <TableCell padding={'none'} colSpan={1} > 
                      {this.state.open ? <ExpandLess style={{color: 'white'}} /> : <ExpandMore style={{color: 'white'}}/>}    
                  </TableCell>
                </TableRow>

                {this.state.open && (
                <TableRow>
                  <TableCell padding={'none'} colSpan={12}> 
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell style={{color: 'white'}}>Body Part</TableCell>
                            <TableCell style={{color: 'white'}}>Modality</TableCell>
                            <TableCell style={{color: 'white'}}>Protcol Name</TableCell>
                            <TableCell style={{color: 'white'}}>Series Number</TableCell>
                            <TableCell style={{color: 'white'}}>Station Name</TableCell>
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