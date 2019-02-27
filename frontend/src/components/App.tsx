
import React from "react";
import { Switch, withRouter, RouteComponentProps } from "react-router-dom";
import { connect } from "react-redux";

import "bootstrap/dist/css/bootstrap.min.css";

import "../styling/index.scss";

import { loadAuthenticationAction, setLoginRedirectAction } from "../state/auth/actions"
import { isLoggedIn } from "../state/auth/selectors";

import Login from "./pages/login/Login";
import CourseSelection from "./pages/course-selection/CourseSelection";
import NavigationBar from "./pages/navigationBar/NavigationBar";
import CourseDashboard from "./pages/course-dashboard/CourseDashboard";
import AssignmentSetManager from "./pages/assignments/assignmentSetManager/AssignmentSetManager";

import { ApplicationState } from '../state/state';
import NotificationList from './notifications/NotificationList';
import RouteExtension from "./RouteExtension";
import { ActiveTabEnum } from "../state/navigationBar/types";
import { PATH_LOGIN, PATH_ASSIGNMENT_SET_MANAGER, PATH_COURSES, PATH_DASHBOARD } from "../routes";

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
                        <NavigationBar />
                    }
                    <div className="main-body flex-fill">
                        <Switch>
                            <RouteExtension exact path={PATH_LOGIN} component={Login}
                                setActiveTab={ActiveTabEnum.NONE} />

                            <RouteExtension exact path={PATH_ASSIGNMENT_SET_MANAGER} component={AssignmentSetManager}
                                setActiveTab={ActiveTabEnum.ADMINISTRATION} />

                            <RouteExtension exact path={["", "/", PATH_COURSES]} component={CourseSelection}
                                setActiveTab={ActiveTabEnum.COURSES} />

                            <RouteExtension exact path={PATH_DASHBOARD} component={CourseDashboard}
                                setActiveTab={ActiveTabEnum.DASHBOARD} />
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
