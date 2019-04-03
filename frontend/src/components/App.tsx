import React from "react";
import { Switch, withRouter, RouteComponentProps } from "react-router-dom";
import { connect } from "react-redux";
import { push, Push } from "connected-react-router";

import "bootstrap/dist/css/bootstrap.min.css";

import "../styling/index.scss";

import {
    loadAuthenticationAction,
    setLoginRedirectAction,
} from "../state/auth/actions";
import { isLoggedIn } from "../state/auth/selectors";

import Login from "./pages/login/Login";
import CourseSelection from "./pages/course-selection/CourseSelection";
import CourseDashboard from "./pages/course-dashboard/CourseDashboard";
import CourseAdministration from "./pages/admin/CourseAdministration";
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
    PATH_DASHBOARD,
    PATH_COURSES,
    PATH_COURSE_ADMINISTRATION,
    PATH_GROUP_SET_GROUPS_MANAGER,
    PATH_CANVAS_TOKEN,
    PATH_CANVAS_IMPORT,
    PATH_SIGNOFF,
    PATH_SIGNOFF_OVERVIEW,
    PATH_QUEUE,
    PATH_COURSE_LABEL_MANAGER,
    PATH_COURSE_ROLES_MANAGER,
    PATH_ROOMS,
    PATH_BEAMER_MODE,
    PATH_BEAMER_PROMPT,
    PATH_JOBS,
    PATH_JOBS_ALT,
} from "../routes";
import SignoffTable from "./pages/sign-off/SignoffTable";
import GroupManager from "./pages/admin/groups/groups/GroupManager";
import AssignmentSetManager from "./pages/admin/assignmentSetManager/AssignmentSetManager";
import SignOffOverview from "./pages/sign-off-overview/SignOffOverview";
import QueuingPage from "./pages/queuing/QueuingPage";
import LabelManager from "./pages/admin/labels/LabelManager";
import RolesManager from "./pages/admin/supplementaryroles/RolesManager";
import Rooms from "./pages/rooms/Rooms";
import ProjectorQueuingPage from "./pages/queuing/ProjectorQueuingPage";
import ProjectorRoomPromptPage from "./pages/queuing/ProjectorRoomPromptPage";
import Jobs from "./pages/admin/Jobs";

export interface AppProps {
    loadAuthentication: () => {
        type: string;
    };
    setLoginRedirect: (
        redirectUrl: string,
    ) => {
        type: string;
    };
    push: Push;
    pathname: string;
    search: string;
    loggedIn: boolean;
}

class App extends React.Component<AppProps & RouteComponentProps> {
    static HOME_PATH = PATH_COURSES;

    componentDidMount() {
        let pathname = this.props.pathname;
        const {
            setLoginRedirect,
            loadAuthentication,
            location: { hash, search },
        } = this.props;
        if (pathname === "/") {
            this.props.push(App.HOME_PATH);
            pathname = App.HOME_PATH;
        }
        if (
            pathname === PATH_LOGIN ||
            pathname.startsWith(PATH_BEAMER_PROMPT)
        ) {
            setLoginRedirect(App.HOME_PATH);
        } else {
            setLoginRedirect(`${pathname}${search}${hash}`);
        }
        if (!pathname.startsWith(PATH_BEAMER_PROMPT)) {
            loadAuthentication();
        }
    }

    componentDidUpdate() {
        const {
            pathname,
            loadAuthentication,
            setLoginRedirect,
            loggedIn,
            location: { hash, search },
        } = this.props;
        if (pathname.startsWith(PATH_BEAMER_PROMPT)) {
            return;
        }
        if (!loggedIn && pathname !== PATH_LOGIN) {
            setLoginRedirect(`${pathname}${search}${hash}`);
            this.props.push(PATH_LOGIN);
            loadAuthentication();
        }
        if (loggedIn && pathname === PATH_LOGIN) {
            this.props.push(App.HOME_PATH);
        }
    }

    render() {
        if (this.props.pathname !== PATH_LOGIN) {
            return (
                <div>
                    <NotificationList />
                    {this.switch()}
                </div>
            );
        } else {
            return (
                <div>
                    <NotificationList />
                    <Login />
                </div>
            );
        }
    }

    /** Returns the Switch component. Was extracted from the render method for readability. */
    switch() {
        return (
            <Switch>
                <RouteExtension
                    exact
                    path={PATH_COURSE_ADMINISTRATION}
                    component={CourseAdministration}
                    setActiveTab={ActiveTabEnum.ADMINISTRATION}
                />

                <RouteExtension
                    exact
                    path={PATH_ASSIGNMENT_SET_MANAGER}
                    component={AssignmentSetManager}
                    setActiveTab={ActiveTabEnum.ADMINISTRATION}
                />

                <RouteExtension
                    exact
                    path={PATH_GROUP_SET_MANAGER}
                    component={GroupSetManager}
                    setActiveTab={ActiveTabEnum.ADMINISTRATION}
                />

                <RouteExtension
                    exact
                    path={PATH_COURSE_LABEL_MANAGER}
                    component={LabelManager}
                    setActiveTab={ActiveTabEnum.ADMINISTRATION}
                />

                <RouteExtension
                    exact
                    path={PATH_COURSE_ROLES_MANAGER}
                    component={RolesManager}
                    setActiveTab={ActiveTabEnum.ADMINISTRATION}
                />

                <RouteExtension
                    exact
                    path={PATH_GROUP_SET_GROUPS_MANAGER}
                    component={GroupManager}
                    setActiveTab={ActiveTabEnum.ADMINISTRATION}
                />

                <RouteExtension
                    exact
                    path={PATH_JOBS}
                    component={Jobs}
                    setActiveTab={ActiveTabEnum.JOBS}
                />

                <RouteExtension
                    exact
                    path={PATH_JOBS_ALT}
                    component={Jobs}
                    setActiveTab={ActiveTabEnum.JOBS}
                />

                <RouteExtension
                    exact
                    path={PATH_COURSES}
                    component={CourseSelection}
                    setActiveTab={ActiveTabEnum.COURSES}
                />

                <RouteExtension
                    exact
                    path={PATH_DASHBOARD}
                    component={CourseDashboard}
                    setActiveTab={ActiveTabEnum.DASHBOARD}
                />

                <RouteExtension
                    exact
                    path={PATH_CANVAS_TOKEN}
                    component={CanvasTokenForm}
                    setActiveTab={ActiveTabEnum.NONE}
                />

                <RouteExtension
                    exact
                    path={PATH_CANVAS_IMPORT}
                    component={CanvasCourseImport}
                    setActiveTab={ActiveTabEnum.NONE}
                />

                <RouteExtension
                    exact
                    path={PATH_CANVAS_TOKEN}
                    component={CanvasTokenForm}
                    setActiveTab={ActiveTabEnum.NONE}
                />

                <RouteExtension
                    exact
                    path={PATH_CANVAS_IMPORT}
                    component={CanvasCourseImport}
                    setActiveTab={ActiveTabEnum.NONE}
                />

                <RouteExtension
                    exact
                    path={PATH_SIGNOFF}
                    component={SignoffTable}
                    setActiveTab={ActiveTabEnum.SIGNOFF}
                />

                <RouteExtension
                    exact
                    path={PATH_SIGNOFF_OVERVIEW}
                    component={SignOffOverview}
                    setActiveTab={ActiveTabEnum.DASHBOARD}
                />
                <RouteExtension
                    exact
                    path={PATH_QUEUE}
                    component={QueuingPage}
                    setActiveTab={ActiveTabEnum.ROOMS}
                />

                <RouteExtension
                    exact
                    path={PATH_ROOMS}
                    component={Rooms}
                    setActiveTab={ActiveTabEnum.ROOMS}
                />

                <RouteExtension
                    exact
                    path={PATH_BEAMER_MODE}
                    component={ProjectorQueuingPage}
                    setActiveTab={ActiveTabEnum.NONE}
                />

                <RouteExtension
                    exact
                    path={PATH_BEAMER_PROMPT}
                    component={ProjectorRoomPromptPage}
                    setActiveTab={ActiveTabEnum.NONE}
                />
            </Switch>
        );
    }
}

export default withRouter(
    connect(
        (state: ApplicationState) => ({
            loggedIn: isLoggedIn(state),
            pathname: state.router!.location.pathname,
            search: state.router!.location.search,
        }),
        {
            loadAuthentication: loadAuthenticationAction,
            setLoginRedirect: setLoginRedirectAction,
            push,
        },
    )(App),
);
