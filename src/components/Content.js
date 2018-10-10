import React from 'react'
import {Tab, Tabs, AppBar} from '@material-ui/core'
import {withStyles} from '@material-ui/core/styles'
import ImageManagement from './ImageManagement';
import DicomViewer from "../dicom-viewer";

const styles = theme=> ({
    root:{
        flexGrow: 1,    
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
    },
})

class Content extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            tab: 0,
        };
    }

    handleChangeTab = (event, value)=>{
    	this.setState({tab: value});
  }

    render(){
        const {classes, onTab} = this.props
        const {tab} = this.state

        return(
        <div>
        <AppBar position="static">
        	<Tabs value={tab} onChange={this.handleChangeTab} fullWidth>
	            <Tab label="Image Management" />
	            <Tab label="Viewer" />
        	</Tabs>
        	{(tab === 0) && (<ImageManagement />)}
        	{(tab === 1) && (<DicomViewer />)}
        </AppBar>
        </div>
    );
}
}
export default withStyles(styles)(Content);