import React, { Component } from 'react';
import theme from 'assets/react-toolbox/theme';
import ThemeProvider from 'react-toolbox/lib/ThemeProvider';
import Button from 'react-toolbox/lib/button/Button';

import logo from './logo.svg';
import firebase from 'firebase';
import config from './config.json';
import './App.css';

class App extends Component {
  componentDidMount() {
    this.firebase = firebase.initializeApp(config.firebase); 
    this.database = firebase.database();
    window.aaaa = this.auth = firebase.auth();
  }
  render() {
    return (
      <ThemeProvider theme={theme}>
        <div className="App">
          <div className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h2>Welcome to React</h2>
          </div>
          <p className="App-intro">
            To get started, edit <code>src/App.js</code> and save to reload.
          </p>
          <Button>Hello</Button>
        </div>
      </ThemeProvider>
    );
  }
}

export default App;
