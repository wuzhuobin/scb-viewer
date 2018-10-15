import React from "react";
import { withStyles } from '@material-ui/core/styles';
import axios from 'axios';

import {Dialog, DialogTitle, DialogActions, List, ListItem, ListItemText, CircularProgress, Button} from '@material-ui/core';
import {Close, Add} from '@material-ui/icons'

const styles = theme => ({
  root: {
  	
  },
  dialog:{
  },
  progress:{

  },
  button:{
  	margin: theme.spacing.unit,
  },
  dialogActions:{
  	justifyContent: 'center'
  },
  input: {
    display: 'none',
  },
});

class Upload extends React.Component {
  constructor(props){
    super(props);
    this.state={
    	uploadTasks: [
        ],
    }
  }

  onChangeUploadDir(event){
  	var output=[];
  	for (let i=0;i<event.target.files.length; i++){
  		output.push(event.target.files[i])
  	}

  	this.setState((prevState, props)=>(
  		{
  		uploadTasks: [...prevState.uploadTasks,
  			{
  				id: Date.now(),
  				info: {seriesName: 'new series', progress: 0},
  				files: output
  			}]
  		}
  	),	()=>{this.handleUpload()}
  	)
  }


  handleUpload = () =>{
  	var numOfTasks = this.state.uploadTasks.length
  	const uploadTasks = this.state.uploadTasks
  	const uploadTask = this.state.uploadTasks[numOfTasks-1]
  	var successCount = 0;
  	var failCount = 0;

  	for (var i =0;i< uploadTask.files.length;i++)
  	{
  		const formData = new FormData();
	  	formData.append('file', uploadTask.files[i])
	  	formData.append('headers', {'Access-Control-Allow-Origin': '*'})

	  	axios.post('http://192.168.1.126:3000/orthanc/instances', formData)
	      .then(res => {
	      	// console.log(this.state.uploadTasks[numOfTasks-1].info)
	        // console.log(res.data);
	        if (res.data.Status == "Success" || res.data.Status == "AlreadyStored")
	        {
	        	successCount++;
	        }
	        else
	        {
	        	failCount++;	
	        }

	        var progress = (successCount + failCount)/uploadTask.files.length*100;

	        uploadTasks[numOfTasks-1].info.progress = progress;

	        this.setState({uploadTasks,})

	      }).catch((error)=>{
	      	console.log(error)
	      })
  	}
  }

  render() {
    const {uploadTasks} = this.state
    const {open, onClose, classes} = this.props
    return (
      <div className={classes.root}>
        <Dialog
        	open={open}
        	onClose={onClose}
        	aria-labelledby="form-dialog-title"
        	autoScrollBodyContent = {true}
        	className={classes.dialog}
        	fullWidth={true}
        	maxWidth = {'xs'}
        >
        	<DialogTitle id="form-dialog-title" >Upload DICOM</DialogTitle>
        	<List>
          		{uploadTasks.map(({id,info})=>
            		<ListItem key={id}>
              		<ListItemText primary={info.seriesName} secondary={info.progress + "%"}/>
               			<CircularProgress className={classes.progress} variant="static" value={info.progress} />
               		</ListItem>
            	)}
       	 	</List>
       	 	<DialogActions className={classes.dialogActions}>
       	 	<input
		        className={classes.input}
		        id="dcmDir"
		        type="file" 
		        webkitdirectory="true"
		        mozdirectory="true"
		        directory="true"
		        multiple="true"
		        value={''}
		        onChange={event=>this.onChangeUploadDir(event)}
		     />
       	 	<label htmlFor="dcmDir">
       	 		<Button variant='raised' className={classes.button} color="primary" component="span">
       	 		Upload
       	 		</Button>
       	 	</label>
       	 	<Button variant='raised' className={classes.button} color="primary" onClick={onClose}>
       	 	Finish
       	 	</Button>
       	 	</DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default withStyles(styles)(Upload);