import React from "react";

import {Grid, Paper, CardContent, Typography} from '@material-ui/core';
import {ExpandMore, ExpandLess} from '@material-ui/icons'
import { withStyles } from '@material-ui/core/styles';
import PACS from "orthanc";

const styles = theme => ({
	root:{
    paddingLeft:8,
    height: 170,
    width: '100%',
	},
  demo:{
    height: 170,
    width: '100%',
    justify: "center",
    flexWrap: 'nowrap',
    overflow: "auto",
    marginTop: 1,
  },
  paper:{
    backgroundColor: theme.palette.secondary.main,
    width: 140,
    height: 140,
    borderStyle: 'solid',
    borderColor: theme.palette.secondary.light,
    '&:hover': {borderColor: theme.palette.primary.main,},
  },
  item: {
  },
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

let id = 0;
function createData(bodyPart, modality, protcolName, seriesNumber, stationName) {
  id += 1;
  return { id, bodyPart, modality, protcolName, seriesNumber, stationName};
}

class SeriesPreview extends React.Component {
	constructor(props){
    	super(props);
    	this.state={
        open:false,
        series: [],
        imgs: [],
      };
	}

  componentWillReceiveProps(nextProps) {
      if (this.props.study !== nextProps.study && nextProps.study!=null) {
        this.updateSeries(nextProps.study)
      }
    }

	handleSeriesOpen = (event)  => {
    this.setState({open: !this.state.open})
    
	}

	handleSeriesDoubleClick = (event,seriesId)=>{
    this.props.onSelectSeries(event,seriesId)

	}


  updateSeries = (study)=>{
           PACS.studyInfo(study,
          function (json) {
            let seriesPromises = [];
            for (let i = 0; i < json.Series.length; ++i) {
              seriesPromises.push(PACS.serieInfo(json.Series[i]));
            }
            // console.log(json);
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
                // console.log(series)
                this.setState({ series: series });
              }.bind(this)
            );
          }.bind(this)
        )
        // update images 
        // this.setState({imgs: []});
        this.state.imgs = [];
        PACS.studyInfo(study, (json)=>{
          for (let i = 0; i < json.Series.length; ++i) {
            PACS.seriesPreview(json.Series[i], (str)=>{
              let imgs = this.state.imgs.slice(); 
              imgs.push(str);
              this.setState({imgs: imgs});
            } );
          } 
        });
  }
   
    render() {
    	const {series, imgs} = this.state
    	const {onSelectSeries, study, classes} = this.props

    	return(
    	    <Grid container className={classes.root}>
            <Grid item xs={12}>
              <Grid
                container
                spacing={8}
                className={classes.demo}
                alignItems='center'
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
                      </div>
                    </Paper>
                  </Grid>
                ))}
             </Grid> 
            </Grid>
          </Grid>
    	)
    }

}


export default withStyles(styles)(SeriesPreview);

          // <Grid item xs={12} >
          //     <Grid container className={classes.demo} justify="left" spacing={8}>
          //       {[0, 1, 2,3,4,5,6,7,8,9,10].map(value => (
          //         <Grid key={value} item>
          //           <Card className={classes.card}>
          //             hello
          //           </Card>
          //         </Grid>
          //       ))}
          //     </Grid>
          // </Grid>

             // <Grid item xs={12}>
             //    <Grid container className={classes.demo} justify="center" spacing={Number(spacing)}>
             //      {[0, 1, 2].map(value => (
             //        <Grid key={value} item>
             //          <Paper className={classes.paper} />
             //        </Grid>
             //      ))}
             //    </Grid>

// <TableRow 
//                   hover
//                   id={study.id} 
//                   onClick={this.handleSeriesOpen}>

//                   <TableCell style={{color: 'white'}}>{study.Institution}</TableCell>
//                   <TableCell style={{color: 'white'}}>{study.Description}</TableCell>
//                   <TableCell style={{color: 'white'}}>{study.RequestedProcedure}</TableCell>
//                   <TableCell style={{color: 'white'}}>{study.StudyDate}</TableCell>
//                   <TableCell style={{color: 'white'}}>{study.StudyID}</TableCell>
//                   <TableCell padding={'none'} colSpan={1} > 
//                       {this.state.open ? <ExpandLess style={{color: 'white'}} /> : <ExpandMore style={{color: 'white'}}/>}    
//                   </TableCell>
//                 </TableRow>

//                 {this.state.open && (
//                 <TableRow>
//                   <TableCell padding={'none'} colSpan={12}> 
//                       <Table>
//                         <TableHead>
//                           <TableRow>
//                             <TableCell style={{color: 'white'}}>Body Part</TableCell>
//                             <TableCell style={{color: 'white'}}>Modality</TableCell>
//                             <TableCell style={{color: 'white'}}>Protcol Name</TableCell>
//                             <TableCell style={{color: 'white'}}>Series Number</TableCell>
//                             <TableCell style={{color: 'white'}}>Station Name</TableCell>
//                           </TableRow>
//                         </TableHead>
//                         <TableBody>
//                           {this.state.series.map(series => {
//                             return (
//                               <TableRow id={series.id} hover onDoubleClick={event => this.handleSeriesDoubleClick(event, series.id)}>
//                                 <TableCell>{series.BodyPart}</TableCell>
//                                 <TableCell>{series.Modality}</TableCell>
//                                 <TableCell>{series.ProtcolName}</TableCell>
//                                 <TableCell>{series.SeriesNumber}</TableCell>
//                                 <TableCell>{series.StationName}</TableCell>
//                               </TableRow>
//                       )})}
//                         </TableBody>
//                       </Table>
//                   </TableCell>
//                 </TableRow>
//               )}