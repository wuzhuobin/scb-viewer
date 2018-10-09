import React from 'react'
import {AppBar, Toolbar, Typography, Tab, Tabs, IconButton} from '@material-ui/core'
import {AccountCircle} from '@material-ui/icons';
import {withStyles} from '@material-ui/core/styles'

function TabContainer(props){
    return(
        props.children
        )
};

var styles = {
    appBar:{
        // flexWrap: 'wrap',
    },
    tabs:{
        width:"100%",
    },
}

class NavBar extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            value:0,
            auth: false,
        };
    }

    handleChange = (event, value) => {
        this.setState({value});
    };

    render(){
        const {value, auth} = this.state

        return(
        <div>
        <AppBar position="static" style={styles.appBar}>
            <Toolbar>
                <Typography variant="title" color="inherit">
                Sucabot WebViewer
                </Typography>
                <Tabs style={styles.tabs} onChange={this.handleChange}>
                    <Tab label="Image Management" />
                    <Tab label="Viewer" />
                </Tabs>
                { auth && (
                    <div>
                        <IconButton 
                            aria-haspopup="true"
                            onClick={this.handleMenu}
                            color="inherit"
                        >
                            <AccountCircle />
                        </IconButton>
                    </div> 
                    )
                }
            </Toolbar>
        </AppBar>
        </div>
    );
}
}
export default withStyles(styles)(NavBar);