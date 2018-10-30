import React from "react";
import Hammer from "hammerjs";
import classNames from 'classnames';
import {withStyles} from '@material-ui/core/styles'

const styles = theme=> ({
    root:{    
        width: '100vw',
        height: 'calc(100vh - 128px)',
        // overflow: 'auto',
        // flexGrow: 1,
    },
})

class DicomViewer3D extends React.Component {
  constructor(props)
  {
    super(props);
    this.state=
    {

   	};
  }

    render() {
    	return(<div />);
    };
}

export default withStyles(styles)(DicomViewer3D);

