import React, { Component } from 'react';
import NavBar from './components/NavBar';
import Login from './components/Login';
import Content from './components/Content';

import {withStyles} from '@material-ui/core/styles'

import { createMuiTheme, MuiThemeProvider  } from '@material-ui/core/styles'

import {red} from '@material-ui/core/colors';
import './App.css';

const MyTheme = createMuiTheme({
    // palette: {
    //     primary: {
    //       light: '#6fcbff',
    //       main: '#1d9bff',
    //       dark: '#006dcb',
    //       contrastText: "white",
    //     },
    //     secondary: {      
    //       light: '#3d3d3d',
    //       main: '#2d2d2d',
    //       dark: '#1b1b1b',
    //       contrastText: "white",
    //     },
    //     error: {
    //       light: red[400],
    //       main: red['A700'],
    //       dark: red[900],
    //     },
    // },}

      palette: {
        primary: {
          light: '#6fcbff',
          main: '#1d9bff',
          dark: '#006dcb',
          contrastText: "#aab1bd",
        },
        secondary: {      
          light: '#151a1f',
          main: '#0e1216',
          dark: '#000000',
          contrastText: '#ffffff',
        },
        error: {
          light: red[400],
          main: red['A700'],
          dark: red[900],
        },
        },}
    )

const styles = theme=> ({
    root:{
        height: '100%'
    },
    navBar:{
        flexGrow: 1,    
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
    },
    palette: {
      primary: {
          // light: will be calculated from palette.primary.main,
          main: '#212121',
          // dark: will be calculated from palette.primary.main,
          // contrastText: will be calculated to contrast with palette.primary.main
          },
      secondary: {
          light: '#0066ff',
          main: '#0044ff',
          // dark: will be calculated from palette.secondary.main,
          contrastText: '#ffcc00',
      },
    },
})

class App extends Component {
  constructor(props){
        super(props);
        this.state = {
            auth: true,
            open: false,
        };
    }

  handleLogin(auth) {
    var foo = null;
    if (auth)
    {
      foo = <Content open={this.state.open} onDrawerClose={this.handleDrawerClose}/>
    }
    else
    {
      foo = <Login onAuth={this.handleAuth} />;
    }    
    return(foo)
  }

  handleAuth = event =>{
    this.setState({auth:true})
  }

  handleAuthOff = event =>{
    this.setState({auth:false, open:false})
  }

  handleDrawerOpen = () =>{
    this.setState({open:true});
    }

  handleDrawerClose = () =>{
    this.setState({open:false});
  }

  render() {
    const {classes} = this.props
    const {auth, open} = this.state

    return (
      <MuiThemeProvider theme={MyTheme}>
      <div className={classes.root}>
        <div className={classes.navBar}>
          <NavBar auth={auth} open={open} onDrawerOpen={this.handleDrawerOpen} offAuth={this.handleAuthOff} />
        </div>
        <div>
          {this.handleLogin(this.state.auth)}
        </div>
      </div>
      </MuiThemeProvider>
    );
  }
}

export default withStyles(styles)(App);