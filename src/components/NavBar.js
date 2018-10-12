import React from 'react'
import {AppBar, Toolbar, Typography, IconButton} from '@material-ui/core'
import {AccountCircle} from '@material-ui/icons';
import {withStyles} from '@material-ui/core/styles'



const styles = theme=> ({
    root:{
        flexGrow: 1,    
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
    },
    iconButton: {
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    appBar:{
        // zIndex: theme.zIndex.drawer + 1,
    },
    tabs:{
        width:"100%",
    },
     grow: {
        flexGrow: 1,
     },
})

class NavBar extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            tab: 0,
        };
    }

    componentWillRecieveProps(props){
        this.setState({tab: props.tab});
    }

    handleChange = (event, value) => {
        console.log("hanleChange:" + value)
        this.setState({tab: value});
    };

    render(){
        const {auth, classes, onTab} = this.props
        const {tab} = this.state

        return(
        <div className={classes.root}>
            <AppBar position="static" className={classes.appBar} style={styles.appBar} containerStyle={{height: 'calc(100% - 64px)', top: 64}}>
                <Toolbar>
                    <Typography variant="title" color="inherit" className={classes.grow}>
                        Sucabot WebViewer
                    </Typography>

                    { auth && (
                        <div>
                            <IconButton
                                className={classes.iconButton}
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

