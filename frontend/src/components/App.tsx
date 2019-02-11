import React from 'react';
import { Route, Switch, withRouter, RouteComponentProps} from "react-router-dom";
import { connect } from 'react-redux';

import 'bootstrap/dist/css/bootstrap.min.css';

import '../styling/index.scss';

import { loadAuthenticationAction, setLoginRedirectAction } from '../state/auth/actions'
import { isLoggedIn } from '..//state/auth/selectors';

import Login from './pages/login/Login';
import Home from './pages/home/Home';
import { ApplicationState } from '../state/state';

export interface AppProps {
  loadAuthentication: () => {
    type: string,
  },
  setLoginRedirect: (redirectUrl: string) => {
    type: string
  },
  pathname: string,
  search: string,
}
export interface AppState {
  loggedIn: boolean
}
class App extends React.Component<AppProps & RouteComponentProps, AppState> {

  componentDidMount() {
      const path = this.props.pathname;
      if (path !== '/login') {
        this.props.setLoginRedirect(this.props.pathname);
        this.props.loadAuthentication();
      }
  }

  render() {
    return (
      <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/login" component={Login} />
      </Switch>
    );
  }
} 

export default withRouter(connect( (state: ApplicationState) => ({
  loggedIn: isLoggedIn(state),
  pathname: state.router!.location.pathname,
  search: state.router!.location.search,
}), {
  loadAuthentication: loadAuthenticationAction,
  setLoginRedirect: setLoginRedirectAction
})(App));