import React, { Component } from 'react';
import NavBar from './components/NavBar';
import Login from './components/Login';
import DicomViewer from "./dicom-viewer";
import DrawerMenu from "./components/DrawerMenu";
import {withStyles} from '@material-ui/core/styles'
import classNames from 'classnames';

import { createMuiTheme, MuiThemeProvider  } from '@material-ui/core/styles'

import './App.css';

const styles = theme=> ({
    root:{
        
        height: '100vh'
    },
    navBar:{
        flexGrow: 1,    
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
    }
})

class App extends Component {
  constructor(props){
        super(props);
        this.state = {
            auth: false,
            open: false,
        };
    }

  handleLogin(auth) {
    var foo = null;
    if (auth)
    {
      console.log(this.state.open)
      foo = <DrawerMenu open={this.state.open} onDrawerClose={this.handleDrawerClose}/>;
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
      <MuiThemeProvider>
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