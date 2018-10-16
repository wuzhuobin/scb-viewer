import React, { Component } from 'react';
import NavBar from './components/NavBar';
import Login from './components/Login';
import Content from './components/Content';
import DicomViewer from "./dicom-viewer";

import {withStyles} from '@material-ui/core/styles'
import classNames from 'classnames';

import { createMuiTheme, MuiThemeProvider  } from '@material-ui/core/styles'

import {blue, grey, red} from '@material-ui/core/colors';
import './App.css';

const MyTheme = createMuiTheme({
    palette: {
        primary: {
          light: blue[300],
          main: blue[500],
          dark: blue[800],
        },
        secondary: {
          light: grey[300],
          main: grey[800],
          dark: grey[900],
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

const theme = theme=>({
}
)

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

  handleDrawerOpen = () =>{
    this.setState({open:true});
    }

  handleDrawerClose = () =>{
    this.setState({open:false});
  }

  render() {
    const {classes, theme} = this.props
    const {auth, open} = this.state

    return (
      <MuiThemeProvider theme={MyTheme}>
      <div className={classes.root}>
        <div className={classes.navBar}>
          <NavBar auth={auth} open={open} onDrawerOpen={this.handleDrawerOpen}/>
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