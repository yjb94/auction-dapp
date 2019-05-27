import React, { Component } from "react";
import { DrizzleProvider } from "drizzle-react";
import {LoadingContainer} from "drizzle-react-components";
import { Router } from 'react-router';

import "./App.css";
import drizzleOptions from "./drizzleOptions";
import store, {history} from "./store";
import Home from "./Home";

class App extends Component {
  render() {
    return (
      <DrizzleProvider options={drizzleOptions} store={store}>
        <LoadingContainer>
            <Router history={history}>
                <Home/>
            </Router>
        </LoadingContainer>
      </DrizzleProvider>
    );
  }
}

export default App;
