import React, { Component } from 'react';
import NavBar from './components/NavBar';
import Login from './components/Login';
import DicomViewer from "./dicom-viewer";
import { createMuiTheme, MuiThemeProvider  } from '@material-ui/core/styles'

import './App.css';

class App extends Component {
  state = {
    auth: false
  }

  render() {
    const {auth} = this.state

    return (
      <MuiThemeProvider>
      <div>
        <NavBar auth={auth}/>

        <Login auth={auth} />

      </div>
      </MuiThemeProvider>
    );
  }
}

export default App;

        // <DicomViewer />