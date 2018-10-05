import React, { Component } from 'react';
import NavBar from './components/NavBar';
import DicomViewer from "./dicom-viewer";

import './App.css';

class App extends Component {
  render() {
    return (
      <div>
        <NavBar />
        <DicomViewer />
      </div>
    );
  }
}

export default App;
