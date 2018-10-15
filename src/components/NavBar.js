import React from 'react'
import {AppBar, Toolbar, Typography, IconButton, Divider, Drawer} from '@material-ui/core'
import {AccountCircle, Menu, ChevronRight, ChevronLeft} from '@material-ui/icons';
import {withStyles} from '@material-ui/core/styles'
import classNames from 'classnames';
import DrawerMenu from './DrawerMenu';

const drawerWidth = 240;

const styles = theme=> ({
    root:{
        flexGrow: 1,    
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
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
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        
        marginTop: 64,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    contentShift: {
        marginLeft: drawerWidth,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
    }),
  },
})

class NavBar extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            auth: true,
            open: false,
        };
    }

    componentWillRecieveProps(props){
        this.setState({tab: props.tab});
    }

    render(){
        const {auth, open, onDrawerOpen, classes, theme} = this.props
          
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



// <DrawerMenu onDrawerClose={this.handleDrawerClose} open={open} />
//             <main 
//                 className={classNames(classes.content,{
//                     [classes.contentShift]: open,
//                 })}
//             >

//                 helloWorld
//             </main>