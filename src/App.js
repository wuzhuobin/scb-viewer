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

  changeTab(b) {
    var foo = <Login onAuth={this.handleAuth} />;
    if (b)
    {
      foo = <DicomViewer />;
    }
    else
    {

    }    
    return(foo)
  }

  handleAuth = event =>{
    this.setState({auth:true})
    console.log("handle auth " + this.state.auth)
  }

  render() {
    const {auth} = this.state

    return (
      <MuiThemeProvider>
      <div>
        <NavBar auth={auth}/>
        {this.changeTab(this.state.auth)}        
      </div>
      </MuiThemeProvider>
    );
  }
}

export default App;

        // <DicomViewer />