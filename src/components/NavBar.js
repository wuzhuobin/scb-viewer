import React from 'react'
import {AppBar, Toolbar, Typography, Tab, Tabs, IconButton} from '@material-ui/core'
import {AccountCircle} from '@material-ui/icons';
import {withStyles} from '@material-ui/core/styles'

function TabContainer(props){
    return(
        props.children
        )
};

const styles = theme=> (
{
    root:{
        flexGrow: 1,    
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        // height: '10vh',
    },
    appBar:{
        zIndex: theme.zIndex.drawer + 1,
    },
    tabs:{
        width:"100%",
    },
})

class NavBar extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            value:0,
        };
    }

    handleChange = (event, value) => {
        this.setState({value});
    };

    render(){
        const {value} = this.state
        const {auth, classes} = this.props
        console.log(styles)

        return(
        <div className={classes.root}>
            <AppBar position="static" className={classes.appBar} style={styles.appBar}>
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