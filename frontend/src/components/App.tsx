import React from "react";
import { Route, Switch, withRouter, RouteComponentProps} from "react-router-dom";
import { connect } from "react-redux";

import "bootstrap/dist/css/bootstrap.min.css";

import "../styling/index.scss";

import { loadAuthenticationAction, setLoginRedirectAction } from "../state/auth/actions"
import { isLoggedIn } from "..//state/auth/selectors";

import Login from './pages/login/Login';
import Home from './pages/home/Home';
import CourseSelection from './pages/course-selection/CourseSelection';

import { ApplicationState } from '../state/state';
import Dashboard from './pages/dashboard/Dashboard';

export interface AppProps {
  loadAuthentication: () => {
    type: string,
  };
  setLoginRedirect: (redirectUrl: string) => {
    type: string,
  };
  pathname: string;
  search: string;
}
export interface AppState {
  loggedIn: boolean;
}

const PATH_LOGIN = "/login";

class App extends React.Component<AppProps & RouteComponentProps, AppState> {

  componentDidMount() {
      const path = this.props.pathname;
      if (path !== PATH_LOGIN) {
        this.props.setLoginRedirect(this.props.pathname);
        this.props.loadAuthentication();
      }
  }

  render() {
    return (
      <div>
        { this.props.pathname !== PATH_LOGIN &&
          <div className="navigation-bar" />
        }
        <div className="main-body">
          <Switch>
              <Route exact path="/" component={Home} />
              <Route path={PATH_LOGIN} component={Login} />
              <Route exact path="/courses" component={CourseSelection} />
              <Route path="/courses/:id" component={Dashboard} />
          </Switch>
        </div>
      </div>
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
