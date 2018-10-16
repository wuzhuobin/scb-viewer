import React from "react";

import {Button, Divider, Typography, TextField, Grid, Table, TableBody, TableCell, TableHead, TableRow,
  Collapse, TableRowColumn} from '@material-ui/core';
import {ExpandMore} from '@material-ui/icons'
import { withStyles } from '@material-ui/core/styles';
import PACS from "./PACS"
console.log(PACS.URL());
const styles = theme => ({
	root:{

	}
})

let id = 0;
function createData(Institution, StudyDate, StudyID, Modality, SeriesNumber) {
  id += 1;
  return { id, Institution, StudyDate, StudyID, Modality, SeriesNumber};
}

const series = [
	createData('Sucabot', '2018-01-01', 'A1234567', 'CT', 'SeriesNumbbbbbbb'),
	createData('Sucabot(Int)', '2018-01-02', 'B123451234', 'MR', 'SeriesNumbbbbbbbb')
]

class Patients extends React.Component {
	constructor(props){
    	super(props);
    	this.state={
	      open:false,
    	}
	}

	 handleSeriesOpen = (event)  => {
	    console.log("hello")
	    console.log(event)
	    console.log(event.target.getAttribute('patientId'))
	    console.log(event.target.getAttribute('openSeries'))
	    this.setState({open: !this.state.open})
	  }

    render() {
    	const {} = this.state
    	const {patient, classes} = this.props

    	return(
    	    <React.Fragment>
                <TableRow id={patient.id}>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{patient.patientId}</TableCell>
                  <TableCell>{patient.birthDate}</TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell padding={'none'} colSpan={1} > 
                     <ExpandMore onClick={this.handleSeriesOpen}/>
                  </TableCell>
                </TableRow>

                {this.state.open && (
                <TableRow>
                  <TableCell padding={'none'} colSpan={12}> 
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Institution</TableCell>
                            <TableCell>Study Date</TableCell>
                            <TableCell>Study ID</TableCell>
                            <TableCell>Modality</TableCell>
                            <TableCell>Series Number</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                        	{series.map( series => {
                        		return (
                        			<React.Fragment>
                        			<TableRow id={series.id}>
                        				<TableCell>{series.Institution}</TableCell> 
                        				<TableCell>{series.StudyDate}</TableCell> 
                        				<TableCell>{series.StudyID}</TableCell> 
                        				<TableCell>{series.Modality}</TableCell> 
                        				<TableCell>{series.SeriesNumber}</TableCell> 
                        			</TableRow>
                        			</React.Fragment>)})}
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