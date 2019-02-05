import React from 'react';
import { Route, Switch } from "react-router-dom";

import 'bootstrap/dist/css/bootstrap.min.css';

import '../styling/index.scss';

import Login from './pages/login/Login';
import Home from './pages/home/Home';

export const App = () => (
  <Switch>
      <Route exact path="/" component={Home} />
      <Route path="/login" component={Login} />
  </Switch>
);
