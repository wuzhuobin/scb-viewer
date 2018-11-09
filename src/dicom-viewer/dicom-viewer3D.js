import React from "react";
import Hammer from "hammerjs";
import classNames from 'classnames';
import {withStyles} from '@material-ui/core/styles'
import {AppBar,Toolbar, Button, Grid}  from '@material-ui/core';
import SeriesPreviewVertical from '../components/SeriesPreviewVertical'
import {NavigationOutlined} from '@material-ui/icons';
import MprViewer from './MprViewer'
import ThreeDViewer from './threeDViewer'

const styles = theme=> ({
    root:{    
        width: 'calc(100vw)',
        height: 'calc(100vh - 64px)',
    },
    appBar:{
      flexGrow: 1,    
      zIndex: 1,
      overflow: 'auto',
      position: 'relative',
      height: '64px',
      justifyContent: 'center',
      background: theme.palette.secondary.main,
    },
    drawerOpen:{
        width: 'calc(100vw - 240px)',
        height: 'calc(100vh - 64px)',
    },
    label: {
    // Aligns the content of the button vertically.
      flexDirection: 'column',
      textTransform: 'none',
      // fontSize: '3px',
      color: theme.palette.primary.contrastText,
      '&:hover': {
          color: theme.palette.secondary.contrastText,
          },
    },
    gridRoot: {
      width: 'calc(100vw - 170px)',
      height: 'calc(100vh - 64px - 64px)',
      borderColor: theme.palette.primary.main,
      borderStyle: "solid",
      borderWidth: 1,
    },
    drawerOpenGrid:{
      width: 'calc(100vw - 240px - 170px)',
    },
})

class DicomViewer3D extends React.Component {
  constructor(props)
  {
    super(props);
    this.state = {
      selectedSeries: null,
   	};
  }

    render() {
      const {drawerOpen, series, classes} = this.props
      console.log('drawerOpen:' + drawerOpen)
    	return(
        <div className={classNames(classes.root, {[classes.drawerOpen]: this.props.drawerOpen,})}>
            <AppBar className={classes.appBar}>
              <Toolbar>
                  <Button classes={{label: classes.label}} color="inherit" >
                    <NavigationOutlined />
                    Navigate
                  </Button>
              </Toolbar>
          </AppBar>

          <SeriesPreviewVertical series={series} selectedSeries={this.state.selectedSeries} />
            <Grid container className={classNames(classes.gridRoot, {[classes.drawerOpenGrid]: this.props.drawerOpen,})}>
              <Grid container spacing={0}>
                <Grid item xs={6}>
                  <MprViewer orientation={"Axial"} drawerOpen={drawerOpen}/>
                </Grid>
                <Grid item xs={6}>
                  <MprViewer orientation={"Sagittal"} drawerOpen={drawerOpen}/>
                </Grid>
                <Grid item xs={6}>
                  <ThreeDViewer drawerOpen={drawerOpen}/>
                </Grid>
                <Grid item xs={6}>
                  <MprViewer orientation={"Coronal"} drawerOpen={drawerOpen}/>
                </Grid>
                
              </Grid>
            </Grid>
        </div>
        );
    };
}

export default withStyles(styles)(DicomViewer3D);