import React from "react";

import {Button,Divider} from '@material-ui/core';
import {CloudUpload} from '@material-ui/icons'

import { withStyles } from '@material-ui/core/styles';
import Upload from './Upload';

const styles = theme => ({
  root: {
    // flexGrow: 1,
    zIndex: 1,
    // width: '100%',
    height: '100%',
    overflow: 'auto',
    // position: 'relative',
    // display: 'flex',
  },
  form:{
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.unit * 5,
    right: theme.spacing.unit * 5,
  },
});


class Images extends React.Component {
  constructor(props){
    super(props);
    this.state={
      upload:false,
    }
  }

  handleUploadOpen = () => {
    this.setState({ upload: true });
  };

  handleUploadClose = () =>{
    this.setState({upload:false});
  }

  render() {
    const {} = this.state
    const {classes} = this.props

    return (
      <div className={classes.root}>
        <form className={classes.form} noValidate autoComplete="off">
        hello
        </form>   
        <Divider />
        <Button variant="fab" color="secondary" className={classes.fab} onClick={this.handleUploadOpen}>
          <CloudUpload />
        </Button>
        
        <Upload open={this.state.upload} onClose={this.handleUploadClose}/>

      </div>
    );
  }
}

export default withStyles(styles)(Images);