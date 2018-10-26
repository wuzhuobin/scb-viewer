import React from "react";

import {Grid, Paper, CardContent, Typography} from '@material-ui/core';
import {ExpandMore, ExpandLess} from '@material-ui/icons'
import { withStyles } from '@material-ui/core/styles';
import PACS from "orthanc";

const styles = theme => ({
	root:{
		width: 170,
		height: 'calc(100vh - 64px - 64px)',
		// top: 64,
		position: "relative",
		float: "left"
	},
})

class SeriesPreviewVertical extends React.Component {
	constructor(props){
    	super(props);
    	this.state={
      };
	}

	render() {
		const {} = this.state
    	const {classes} = this.props

		return(
			<div className={classes.root}>
				hello
			</div>
		)
	}
}

export default withStyles(styles)(SeriesPreviewVertical);