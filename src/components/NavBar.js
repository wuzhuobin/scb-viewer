import React from 'react'
import {AppBar, Toolbar, Typography, IconButton} from '@material-ui/core'
import {AccountCircle, Menu} from '@material-ui/icons';
import {withStyles} from '@material-ui/core/styles'
import classNames from 'classnames';

import MenuItem from '@material-ui/core/MenuItem';
import Menu2 from '@material-ui/core/Menu';

const drawerWidth = 240;

const styles = theme=> ({
    root:{
        flexGrow: 1,    
        zIndex: 1,
        overflow: 'hidden',
        position: 'static',
        display: 'flex',
        height: '64px'
    },
    iconButton: {
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    appBar:{
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        background:theme.palette.secondary.dark,
    },
    appBarShift: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth, 
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
     grow: {
        flexGrow: 1,
     },
    menuButton:{
        marginLeft: -12,
        marginRight: 20,
    },
    hide:{
        display: 'none'
    },
})

class NavBar extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            auth: true,
            open: false,
            anchorEl: null,
        };
    }

    handleMenu = event =>{
        this.setState({anchorEl: event.currentTarget });
    };

    handleClose = () =>{
        this.setState({ anchorEl: null });
    }

    handleLogout = () => {
        console.log("Enter Handle Close");
        this.setState({ anchorEl: null });
        this.props.offAuth();
    };

    render(){
        const {auth, open, onDrawerOpen, classes, theme} = this.props
        const meunOpen = Boolean(this.state.anchorEl);
        return(
        <div className={classes.root}>
            <AppBar 
                position="absolute" 
                className={classNames(classes.appBar, {[classes.appBarShift]: open,})}
                style={styles.appBar} 
                containerStyle={{height: 'calc(100% - 64px)', top: 64}}>
                <Toolbar>
                    { auth && (<IconButton 
                                className={classNames(classes.menuButton, open && classes.hide)} 
                                color='inherit' 
                                aria-label='Menu'
                                onClick={onDrawerOpen}
                            >
                                <Menu />
                            </IconButton>
                        )
                    }
                    <Typography variant="title" color="inherit" className={classes.grow}>
                        Sucabot WebViewer (Alpha)
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
                            <Menu2
                                id="menu-appbar"
                                anchorEl= {this.state.anchorEl}
                                 anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                                open={meunOpen}
                                onClose={this.handleClose}
                            >
                            <MenuItem onClick={this.handleLogout}>Logout</MenuItem>
                            </Menu2>
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