
import React from "react";
import { Switch, withRouter, RouteComponentProps } from "react-router-dom";
import { connect } from "react-redux";

import "bootstrap/dist/css/bootstrap.min.css";

import "../styling/index.scss";

import { loadAuthenticationAction, setLoginRedirectAction } from "../state/auth/actions";
import { isLoggedIn } from "../state/auth/selectors";

import Login from "./pages/login/Login";
import CourseSelection from "./pages/course-selection/CourseSelection";
import NavigationBar from "./pages/navigationBar/NavigationBar";
import CourseDashboard from "./pages/course-dashboard/CourseDashboard";
import CourseAdministration from "./pages/admin/CourseAdministration";
import AssignmentSetManager from "./pages/assignments/assignmentSetManager/AssignmentSetManager";
import GroupSetManager from "./pages/admin/groups/groupSets/GroupSetManager";
import CanvasCourseImport from "./pages/canvas-settings/CanvasCourseImport";
import CanvasTokenForm from "./pages/canvas-settings/CanvasTokenForm";

import { ApplicationState } from "../state/state";
import NotificationList from "./notifications/NotificationList";
import RouteExtension from "./RouteExtension";
import { ActiveTabEnum } from "../state/navigationBar/types";

import {
    PATH_LOGIN,
    PATH_ASSIGNMENT_SET_MANAGER,
    PATH_GROUP_SET_MANAGER,
    PATH_COURSES,
    PATH_DASHBOARD,
    PATH_COURSE_ADMINISTRATION,
    PATH_GROUP_SET_GROUPS_MANAGER,
    PATH_CANVAS_TOKEN,
    PATH_CANVAS_IMPORT, PATH_SIGNOFF,
} from "../routes";
import GroupManager from "./pages/admin/groups/groups/GroupManager";
import SignoffSearch from "./pages/signoff/SignOffSearch";

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

                            <RouteExtension exact path={PATH_COURSE_ADMINISTRATION} component={CourseAdministration}
                                setActiveTab={ActiveTabEnum.ADMINISTRATION} />

                            <RouteExtension exact path={PATH_ASSIGNMENT_SET_MANAGER} component={AssignmentSetManager}
                                setActiveTab={ActiveTabEnum.ADMINISTRATION} />

                            <RouteExtension exact path={PATH_GROUP_SET_MANAGER} component={GroupSetManager}
                                setActiveTab={ActiveTabEnum.ADMINISTRATION} />

                            <RouteExtension exact path={PATH_GROUP_SET_GROUPS_MANAGER} component={GroupManager}
                                setActiveTab={ActiveTabEnum.ADMINISTRATION} />

                            <RouteExtension exact path={["", "/", PATH_COURSES]} component={CourseSelection}
                                setActiveTab={ActiveTabEnum.COURSES} />

                            <RouteExtension exact path={PATH_DASHBOARD} component={CourseDashboard}
                                setActiveTab={ActiveTabEnum.DASHBOARD} />
                            <RouteExtension exact path={PATH_CANVAS_TOKEN} component={CanvasTokenForm}
                                            setActiveTab={ActiveTabEnum.NONE}/>
                            <RouteExtension exact path={PATH_CANVAS_IMPORT} component={CanvasCourseImport}
                                            setActiveTab={ActiveTabEnum.NONE}/>

                            <RouteExtension exact path={PATH_SIGNOFF} component={SignoffSearch}
                                            setActiveTab={ActiveTabEnum.SIGNOFF}/>
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
        setLoginRedirect: setLoginRedirectAction,
    })(App));
