
import React from "react";
import { Route, Switch, withRouter, RouteComponentProps } from "react-router-dom";
import { connect } from "react-redux";

import "bootstrap/dist/css/bootstrap.min.css";

import "../styling/index.scss";

import { loadAuthenticationAction, setLoginRedirectAction } from "../state/auth/actions"
import { isLoggedIn } from "../state/auth/selectors";

import Login from "./pages/login/Login";
import Home from "./pages/home/Home";
import Assignments from "./pages/assignments/Assignments";
import CourseSelection from "./pages/course-selection/CourseSelection";
import Dashboard from "./pages/dashboard/Dashboard";

import NotificationList from './notifications/NotificationList';
import { ApplicationState } from "../state/state";

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
const PATH_ASSIGNMENT_SET = "/courses/:cid/assignmentsets";
const PATH_COURSES = "/courses";
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
                <NotificationList />
                <div className="d-flex">
                    {this.props.pathname !== PATH_LOGIN &&
                        <div className="navigation-bar" />
                    }
                    <div className="main-body flex-fill">
                        <Switch>
                            <Route exact path="/" component={Home} />
                            <Route exact path={PATH_LOGIN} component={Login} />
                            <Route exact path={PATH_ASSIGNMENT_SET} component={Assignments} />
                            <Route exact path={PATH_COURSES} component={CourseSelection} />
                            <Route exact path={`${PATH_COURSES}/:id`} component={Dashboard} />
                        </Switch>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(connect((state: ApplicationState) => ({
    loggedIn: isLoggedIn(state),
    pathname: state.router!.location.pathname,
    search: state.router!.location.search,
}), {
        loadAuthentication: loadAuthenticationAction,
        setLoginRedirect: setLoginRedirectAction
    })(App));
