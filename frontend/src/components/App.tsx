import React from "react";
import { Switch, withRouter, RouteComponentProps } from "react-router-dom";
import { connect } from "react-redux";
import { Action } from "redux";
import { push, Push } from "connected-react-router";

import "bootstrap/dist/css/bootstrap.min.css";

import "../styling/index.scss";

import {
    loadAuthenticationAction,
    setLoginRedirectAction,
    SetLoginRedirectAction,
    logoutRequestedAction,
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
    PATH_PROJECTOR_MODE,
    PATH_PROJECTOR_PROMPT,
    PATH_JOBS,
    PATH_JOBS_ALT,
    PATH_HOME,
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
import NotFound from "./pages/NotFound";

export interface AppProps {
    push: Push;
    pathname: string;
    search: string;
    loggedIn: boolean;

    loadAuthentication: () => Action;
    setLoginRedirect: (redirectUrl: string) => SetLoginRedirectAction;
    requestLogout: () => Action;
}

/**
 * The core component of the application. Makes sure that
 * the user is logged in before visiting any page that requires
 * authentication. Once authenticated, the Switch component determines
 * which component (pages) to display, based on the URL.
 */
class App extends React.PureComponent<AppProps & RouteComponentProps> {

    componentDidMount() {
        let pathname = this.props.pathname;
        const {
            setLoginRedirect,
            loadAuthentication,
            location: { hash, search },
        } = this.props;

        // When an empty URL is provided with a slash, redirect to HOME_PATH
        if (pathname === "/") {
            this.props.push(PATH_HOME);
            pathname = PATH_HOME;
        }

        // Set the redirect to the page they attempted
        // to visit, so that once logged in they will be redirected there
        if (
            !(pathname === PATH_LOGIN ||
            pathname.startsWith(PATH_PROJECTOR_PROMPT))
        ) {
            setLoginRedirect(`${pathname}${search}${hash}`);
        }

        // Load authentication except for when the user
        // attempts to visit the beamer prompt page
        if (!pathname.startsWith(PATH_PROJECTOR_PROMPT)) {
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

        // If in beamer prompt, do nothing
        if (pathname.startsWith(PATH_PROJECTOR_PROMPT)) {
            return;
        }

        // If the user is not logged in and the path is login,
        // set the redirect URL to target their current page.
        // Brings the user to the login page and, once logged in,
        // redirect the user to the page they intended to go to
        if (!loggedIn && pathname !== PATH_LOGIN) {
            setLoginRedirect(`${pathname}${search}${hash}`);
            this.props.push(PATH_LOGIN);
            loadAuthentication();
        }

        // If the user attempts to visit the login page but is
        // already logged in, redirects the user to the HOME_PATH
        if (loggedIn && pathname === PATH_LOGIN) {
            this.props.push(PATH_HOME);
        }
    }

    render() {

        // Seperate the Login component from the rest of the web-
        // application. If the current path is not PATH_LOGIN, use
        // the switch to determine which component to render.
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
        const {
            pathname,
            loggedIn,
        } = this.props;
        if (pathname.startsWith(PATH_PROJECTOR_PROMPT)) {
            return (
                <Switch>
                    <RouteExtension
                        exact
                        path={PATH_PROJECTOR_MODE}
                        component={ProjectorQueuingPage}
                        setActiveTab={ActiveTabEnum.NONE}
                    />

                    <RouteExtension
                        exact
                        path={PATH_PROJECTOR_PROMPT}
                        component={ProjectorRoomPromptPage}
                        setActiveTab={ActiveTabEnum.NONE}
                    />

                    <RouteExtension
                        path="*"
                        component={NotFound}
                        setActiveTab={ActiveTabEnum.NONE}
                    />
                </Switch>
            );
        } else if (!loggedIn) {
            return null;
        }
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

                {/* Must be the last element in the switch! */}
                <RouteExtension
                    path="*"
                    component={NotFound}
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
            requestLogout: logoutRequestedAction,
            push,
        },
    )(App),
);
