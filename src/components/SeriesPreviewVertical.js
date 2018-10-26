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
		float: "left",
		background: theme.palette.secondary.main,
	},
	gridContainer1:{
		width: 170,
		height: '100%'
	},
	  demo:{
	    width: 170,
	    height: '100%',
	    justify: "center",
	    // flexWrap: 'nowrap',
	    overflow: "auto",
	    // marginTop: 1,
	  },
  paper:{
    backgroundColor: theme.palette.secondary.main,
    width: 140,
    height: 140,
    borderStyle: 'solid',
    borderColor: theme.palette.secondary.light,
    '&:hover': {borderColor: theme.palette.primary.main,},
  },
 //  item: {
 //  },
  text:{
    color: "yellow",
  },
  seriesContent:{
    // top: "100%",
    paddingLeft: 5,
    paddingBottom: 5,
    transform: "translateY(-100%)",
    position: 'relative'
  },
})

class SeriesPreviewVertical extends React.Component {
	constructor(props){
    	super(props);
    	this.state={
    		series: [{id: 1, text: "hello", bodyPart: "head", modality: "CT", protcolName:"0000", slicesCount: 9999},
    		{id: 2, text: "hello", bodyPart: "head", modality: "CT", protcolName:"0000", slicesCount: 9999},
    		{id: 3, text: "hello", bodyPart: "head", modality: "CT", protcolName:"0000", slicesCount: 9999},
    		{id: 4, text: "hello", bodyPart: "head", modality: "CT", protcolName:"0000", slicesCount: 9999},
    		{id: 5, text: "hello", bodyPart: "head", modality: "CT", protcolName:"0000", slicesCount: 9999},
    		{id: 6, text: "hello", bodyPart: "head", modality: "CT", protcolName:"0000", slicesCount: 9999},
    		{id: 7, text: "hello", bodyPart: "head", modality: "CT", protcolName:"0000", slicesCount: 9999},
    		{id: 8, text: "hello", bodyPart: "head", modality: "CT", protcolName:"0000", slicesCount: 9999},
    		{id: 9, text: "hello", bodyPart: "head", modality: "CT", protcolName:"0000", slicesCount: 9999},
    		{id: 10, text: "hello", bodyPart: "head", modality: "CT", protcolName:"0000", slicesCount: 9999},],
        	imgs: [],
      };
	}

	render() {
		const {series, imgs} = this.state
    	const {onSelectSeries, study, classes} = this.props

		return(
			<div className={classes.root}>
				<Grid container className={classes.gridContainer1}>
		            <Grid item xs={12}>
		              <Grid
		                container
		                spacing={8}
		                className={classes.demo}
		                // direction="column"
		                // alignItems='center'
		              >
		                {series.map((serie, index) => (
		                  <Grid key={serie.id} item>
		                  <Paper className={classes.paper} onDoubleClick={event => this.handleSeriesDoubleClick(event, serie.id)}>
		                    <img src={imgs[index]} height="140px" width="140px"></img>
		                    <div className={classes.seriesContent}>
		                        <Typography className={classes.text}>
		                          {serie.bodyPart}
		                        </Typography>
		                        <Typography className={classes.text}>
		                          {serie.modality}
		                        </Typography>
		                        <Typography className={classes.text}>
		                          {serie.protcolName}
		                        </Typography>
		                        <Typography className={classes.text}>
		                          Slices: {serie.slicesCount}
		                        </Typography>
		                      </div>
		                    </Paper>
		                  </Grid>
		                ))}
		             </Grid> 
		            </Grid>
		          </Grid>
			</div>
		)
	}
}

export default withStyles(styles)(SeriesPreviewVertical);