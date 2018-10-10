import React, { Component } from 'react';
import NavBar from './components/NavBar';
import Login from './components/Login';
import ImageManagement from './components/ImageManagement';
import DicomViewer from "./dicom-viewer";
import { createMuiTheme, MuiThemeProvider  } from '@material-ui/core/styles'

import './App.css';

class App extends Component {
  state = {
    auth: false
  }

  handleAuth = event =>{
    this.setState({auth:true})
    console.log("handle auth")
  }

  render() {
    const {auth} = this.state

    return (
      <MuiThemeProvider>
      <div>
        <NavBar auth={auth}/>
        <ImageManagement />
      </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
// <DicomViewer />
        // <Login onAuth={this.handleAuth} />
        