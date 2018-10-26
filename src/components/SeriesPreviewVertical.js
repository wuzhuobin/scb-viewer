import React from "react";
import classNames from 'classnames';
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
		// height: '100%',
		// justify: "center",
		// flexWrap: 'nowrap',
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
  },
  paperSelected:{
    borderColor: theme.palette.primary.main,
  },
  text:{
    color: theme.palette.primary.light,
    fontSize: '2px',
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
		for (let i = 0;i< this.props.series.length; i++)
		{
			PACS.serieInfo(this.props.series[i], (json)=>{
				let serie = createData(
		            json.MainDicomTags.BodyPartExamined,
		            json.MainDicomTags.Modality,
		            json.MainDicomTags.ProtocolName,
		            json.MainDicomTags.SeriesNumber,
		            json.MainDicomTags.StationName
		          );
		    serie.id = this.props.series[i];
		    serie.slicesCount = json.Instances.length;

				const seriesInfo = this.state.seriesInfo.slice();
				seriesInfo.push(serie);
				this.setState({seriesInfo: seriesInfo})  
				PACS.seriesPreview(this.props.series[i], (str)=>{
			let imgs = this.state.imgs.slice(); 
			imgs.push(str);
			this.setState({imgs: imgs});
		    } );    		
		});
      }
	}

	componentWillReceiveProps(nextProps) {
		// console.log("willrecieveVertical")
  //     	// update series info
		// this.setState({seriesInfo: []})
		// this.setState({imgs: []})

		// console.log(this.props)
		// console.log(nextProps)

		
    }

    handleSelectSeries(event, seriesId){
    	let id = seriesId
    	this.props.onSelectSeries(event, id);
    }

	render() {
		const {seriesInfo, imgs, selectedId} = this.state
    	const {selectedSeries, selectedSeriesonSelectSeries, study, classes} = this.props

		return(
			<div className={classes.root}>
				<Grid container className={classes.gridContainer1}>
		            <Grid item xs={12}>
		              <Grid
		                container
		                spacing={8}
		                className={classes.demo}
		                direction="column"
		                alignItems='center'
		              >
		                {seriesInfo.map((serie, index) => (
		                  <Grid key={serie.id} item>
		                  <Paper className={classNames(classes.paper, {[classes.paperSelected]: serie.id==this.props.selectedSeries})} 
		                  onClick={event => this.handleSelectSeries(event, serie.id)}>
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