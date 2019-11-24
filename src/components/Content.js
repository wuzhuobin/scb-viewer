import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Images from './Images';
import DicomViewer from "../dicom-viewer";
import DicomViewer3D from "../dicom-viewer/dicom-viewer3D";
import classNames from 'classnames';
import DrawerMenu from "./DrawerMenu";

const drawerWidth = 240;

const styles = theme => ({
  root: {
    display: 'flex',
    backgroundColor: "black"
  },
  drawerPaper: {
    position: 'relative',
    width: drawerWidth,
    height: 'calc(100% - 64px)',
  },
  content: {
    position: 'relative',
    height: 'calc(100vh - 64px)',
    width: '100%',
    backgroundColor: theme.palette.background.default,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  contentShift: {
    marginLeft: drawerWidth,
    width: 'calc(100vw - 240px)',
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    })
  }
})

class Content extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      series: null,
      socket: null,
    };
  }

  handleChangePage = (value) => {
    this.setState({ page: value });
  }

  onSelectSeries = (event, series, viewer) => {
    this.setState({ series: series })
    switch (viewer) {
      case "planar":
        this.setState({ page: 1 })
        break;
      case "mpr":
        this.setState({ page: 2 })
        break;
      default:
        this.setState({ page: 0 })
        break;
    }
  }

  render() {
    const { open, onDrawerClose, classes } = this.props
    const { page, socket } = this.state

    return (
      <div className={classes.root}>
        <DrawerMenu open={open} onDrawerClose={onDrawerClose} onChangePage={this.handleChangePage} />
        <main
          className={classNames(classes.content, {
            [classes.contentShift]: open,
          })}
        >
          {page === 0 && <Images onSelectSeries={this.onSelectSeries} />}
          {page === 1 && <DicomViewer series={this.state.series} drawerOpen={this.props.open} />}
          {page === 2 && <DicomViewer3D series={this.state.series} drawerOpen={this.props.open} socket={socket} />}
        </main>
      </div>
    );
  }
}
export default withStyles(styles)(Content);