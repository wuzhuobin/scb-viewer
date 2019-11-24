import React from "react";
import classNames from 'classnames';
import {GridList, GridListTile, Paper, Typography} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
// import PACS from "orthanc";

const styles = theme => ({
	root:{
		width: 170,
		height: 'calc(100vh - 64px - 64px)',
		position: "relative",
		float: "left",
		background: theme.palette.secondary.main,
		overflow: 'auto',
	},
	gridContainer1:{
		width: 170,
		height: '100%',
		display:'unset',
		
	},
	demo:{
		width: 170,
		overflow: "auto",
		margin: 0,
	},
  paper:{
    backgroundColor: theme.palette.secondary.main,
    width: 140,
    height: 140,
    borderStyle: 'solid',
    borderWidth: '2px',
    borderColor: theme.palette.secondary.light,
    '&:hover': {borderColor: theme.palette.primary.light,},
    MozUserSelect:'none',
	WebkitUserSelect:'none',
	msUserSelect:'none',
  },
  paperSelected:{
    borderColor: theme.palette.primary.main,
  },
  text:{
    color: theme.palette.primary.light,
    // fontSize: '2px',
  },
  seriesContent:{
    paddingLeft: 5,
    paddingBottom: 5,
    transform: "translateY(-100%)",
    position: 'relative'
  },
})

let id = 0;
function createData(bodyPart, modality, protcolName, seriesNumber, stationName) {
  id += 1;
  return { id, bodyPart, modality, protcolName, seriesNumber, stationName};
}

class SeriesPreviewVertical extends React.Component {
	constructor(props){
    	super(props);
    	this.state={
    		seriesInfo: [],
        	imgs: [],
      };
	}

	componentDidMount(){
		if (this.props.series)
		{
			let promises = [];
			for (let i = 0; i < this.props.series.length; i++) {
				// promises.push(PACS.serieInfo(this.props.series[i]));
				// promises.push(PACS.seriesPreview(this.props.series[i]));
			}
			Promise.all(promises).then((jsons)=>{
				let seriesInfo = [];
				let imgs = [];
				for(let i = 0; i < jsons.length; i+=2)
				{
					let serie = createData(
						jsons[i].MainDicomTags.BodyPartExamined,
						jsons[i].MainDicomTags.Modality,
						jsons[i].MainDicomTags.ProtocolName,
						jsons[i].MainDicomTags.SeriesNumber,
						jsons[i].MainDicomTags.StationName
					);
					serie.id = this.props.series[i/2];
					serie.slicesCount = jsons[i].Instances.length;	
					seriesInfo.push(serie);
					imgs.push(jsons[i+1]);
				}
				this.setState({seriesInfo: seriesInfo, imgs: imgs});
			})
    }
	}

	componentWillReceiveProps(nextProps) {
    }

	render() {
		const {seriesInfo, imgs} = this.state
    	const {classes} = this.props

		return(
		    <div className={classes.root}>
		      <GridList cellHeight={160} className={classes.gridContainer1} cols={1}>
				{seriesInfo.map((serie, index) => (
                  <GridListTile key={serie.id} item>
	                  <Paper className={classNames(classes.paper, {[classes.paperSelected]: serie.id===this.props.selectedSeries})} 
	                  	onClick={event => this.props.onSelectSeries(event, serie.id)}
	                  	onContextMenu={event=>{event.preventDefault()}}>
	                    <img src={imgs[index]} height="140px" width="140px" alt=""></img>
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
                  </GridListTile>
		        ))}
		      </GridList>
		    </div>
		)
	}
}

export default withStyles(styles)(SeriesPreviewVertical);

			// <div className={classes.root}>
			// 	<Grid container className={classes.gridContainer1}>
		 //            <Grid item xs={12}>
		 //              <Grid
		 //                container
		 //                spacing={8}
		 //                className={classes.demo}
		 //                direction="column"
		 //                alignItems='center'
		 //              >
		 //                {seriesInfo.map((serie, index) => (
		 //                  <Grid key={serie.id} item>
		 //                  <Paper className={classNames(classes.paper, {[classes.paperSelected]: serie.id==this.props.selectedSeries})} 
		 //                  onClick={event => this.props.onSelectSeries(event, serie.id)}>
		 //                    <img src={imgs[index]} height="140px" width="140px"></img>
		 //                    <div className={classes.seriesContent}>
		 //                        <Typography className={classes.text}>
		 //                          {serie.bodyPart}
		 //                        </Typography>
		 //                        <Typography className={classes.text}>
		 //                          {serie.modality}
		 //                        </Typography>
		 //                        <Typography className={classes.text}>
		 //                          {serie.protcolName}
		 //                        </Typography>
		 //                        <Typography className={classes.text}>
		 //                          Slices: {serie.slicesCount}
		 //                        </Typography>
		 //                      </div>
		 //                    </Paper>
		 //                  </Grid>
		 //                ))}
		 //             </Grid> 
		 //            </Grid>
		 //          </Grid>
			// </div>