import React, { Component } from 'react';
import NavBar from './components/NavBar';
import Login from './components/Login';
import Content from './components/Content';
import DicomViewer from "./dicom-viewer";

import { createMuiTheme, MuiThemeProvider  } from '@material-ui/core/styles'

import './App.css';

class App extends Component {
  state = {
    auth: true,
  }

  handleLogin(auth) {
    var foo = null;
    if (auth)
    {
      foo = <Content />;
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

  render() {
    const {auth} = this.state

    return (
      <MuiThemeProvider>
      <div>
        <NavBar />
        

      </div>
      </MuiThemeProvider>
    );
  }
}

export default App;

// {this.handleLogin(this.state.auth)}        