import React, { Component } from "react";
import { Link, withRouter, RouteComponentProps } from "react-router-dom";
import { connect } from "react-redux";
import { Action } from "redux";

import { ListGroup } from "reactstrap";

import { BatchJobDto } from "../../api/types";
import { getJobs } from "../../state/jobs/selectors";
import { jobsFetchRequestedAction } from "../../state/jobs/action";
import {
    courseAdmin,
    signoffAssignmentsView,
    signoffAssignmentsPerform,
} from "../../state/auth/constants";
import {
    logoutRequestedAction,
    setLoginRedirectAction,
    SetLoginRedirectAction,
} from "../../state/auth/actions";
import { ActiveTabEnum } from "../../state/navigationBar/types";
import CoursePermissions from "../../api/permissions";
import { ApplicationState } from "../../state/state";
import { getActiveTab } from "../../state/navigationBar/selectors";
import { getCoursePermissions } from "../../state/auth/selectors";

import logoWhite from "../../images/university_of_twente_logo_black.png";
import { NavigationBarItem } from "./NavigationBarItem";
import {
    faTachometerAlt,
    faTasks,
    faBook,
    faSignOutAlt,
    faTools,
    faStoreAlt,
    faHourglassHalf,
} from "@fortawesome/free-solid-svg-icons";

interface NavigationBarProps {
    activeTab: ActiveTabEnum | null;
    coursePermissions: CoursePermissions | null;
    onPhone: boolean;
    visibleOnPhone: boolean;
    jobs: BatchJobDto[] | null;

    requestLogout: () => Action;
    fetchJobs: () => Action;
    setLoginRedirect: (redirectUrl: string) => SetLoginRedirectAction;
}

/**
 * A class that renders a navigation bar. A different view of the navigation bar
 * is shown depending on whether the user uses the application on a small device
 * or on a desktop. On a mobile view, the navigationbar is collapsed by a hamburger
 * menu, whereas on desktop the navigationbar is always displayed on the left of
 * the screen.
 */
export class NavigationBar extends Component<
    NavigationBarProps & RouteComponentProps<any>
> {
    componentDidMount() {
        this.props.fetchJobs();
    }

    render() {
        const { activeTab, match, onPhone, visibleOnPhone, jobs } = this.props;

        // Check whether the user is in a course
        // This is needed to determine which buttons
        // to display on the screen
        const courseId = Number(match.params.cid);
        const inCourse: boolean =
            courseId != null && !isNaN(courseId) && courseId > 0;

        // Get the permissions of the user
        const permissions = this.props.coursePermissions!;
        const hasAdmin = courseAdmin.check(courseId, permissions);
        const canSignoff = signoffAssignmentsView.check(courseId, permissions);
        const canViewSignoffs = signoffAssignmentsPerform.check(
            courseId,
            permissions,
        );

        // Determine the class of the navigation bar, depending on device
        const deviceClass = onPhone
            ? "NavigationBarSm shadow-lg"
            : "NavigationBar";

        // Display the navigation bar when *not* on phone or
        // when it's visible on phone (after clicking hamburger menu)
        if (!onPhone || visibleOnPhone) {
            return (
                <div id="NavigationBar">
                    <div
                        className={`${deviceClass} bg-light border-top border-bottom border-right`}
                    >
                        <div className="d-flex align-items-start flex-column h-100">
                            {/* The logo displayed in the navigation bar
                                The logo is not shown on mobile views */}
                            {!onPhone && (
                                <div>
                                    <Link
                                        className="NavigationBarLogo py-3"
                                        to={
                                            inCourse
                                                ? `/courses/${match.params.cid}`
                                                : "/courses"
                                        }
                                    >
                                        <img src={logoWhite} />
                                    </Link>
                                </div>
                            )}

                            {/* The button wrapper; contains listgroup with
                                the course-specific buttons displayed on the
                                navigation bar */}
                            <div className="mb-auto w-100">
                                <ListGroup flush className="border-top">
                                    {inCourse && (
                                        <NavigationBarItem
                                            title={
                                                canViewSignoffs
                                                    ? "Dashboard"
                                                    : "My Progress"
                                            }
                                            icon={
                                                canViewSignoffs
                                                    ? faTachometerAlt
                                                    : faTasks
                                            }
                                            active={
                                                activeTab ===
                                                ActiveTabEnum.DASHBOARD
                                            }
                                            url={`/courses/${match.params.cid}`}
                                        />
                                    )}
                                    {inCourse && canSignoff && (
                                        <NavigationBarItem
                                            title="Sign-off"
                                            icon={faTasks}
                                            active={
                                                activeTab ===
                                                ActiveTabEnum.SIGNOFF
                                            }
                                            url={`/courses/${
                                                match.params.cid
                                            }/signoff`}
                                        />
                                    )}
                                    {inCourse && (
                                        <NavigationBarItem
                                            title="Rooms"
                                            icon={faStoreAlt}
                                            active={
                                                activeTab ===
                                                ActiveTabEnum.ROOMS
                                            }
                                            url={`/courses/${
                                                match.params.cid
                                            }/rooms`}
                                        />
                                    )}
                                    {inCourse && hasAdmin && (
                                        <NavigationBarItem
                                            title="Admin"
                                            icon={faTools}
                                            active={
                                                activeTab ===
                                                ActiveTabEnum.ADMINISTRATION
                                            }
                                            url={`/courses/${
                                                match.params.cid
                                            }/administration`}
                                        />
                                    )}
                                </ListGroup>
                            </div>

                            {/* The non-course-specific button wrapper. Contains
                                the listgroup with buttons that are not course-specific,
                                like logout and the course selection menu button. */}
                            <div className="w-100">
                                <ListGroup
                                    flush
                                    className={!onPhone ? "border-top" : ""}
                                >
                                    {jobs != null && jobs.length > 0 && (
                                        <NavigationBarItem
                                            id="TasksButton"
                                            title="Tasks"
                                            icon={faHourglassHalf}
                                            active={
                                                activeTab === ActiveTabEnum.JOBS
                                            }
                                            url={`${
                                                inCourse
                                                    ? "/courses/" +
                                                      this.props.match.params
                                                          .cid
                                                    : ""
                                            }/self/jobs`}
                                        />
                                    )}
                                    <NavigationBarItem
                                        title="Courses"
                                        icon={faBook}
                                        active={
                                            activeTab === ActiveTabEnum.COURSES
                                        }
                                        url="/courses"
                                    />
                                    <NavigationBarItem
                                        title="Logout"
                                        icon={faSignOutAlt}
                                        onClick={() => {
                                            this.props.setLoginRedirect(
                                                "/courses",
                                            );
                                            this.props.requestLogout();
                                            return {};
                                        }}
                                        active={false}
                                        url="/login"
                                    />
                                </ListGroup>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }
}

export default withRouter(
    connect(
        (state: ApplicationState) => ({
            activeTab: getActiveTab(state),
            coursePermissions: getCoursePermissions(state),
            jobs: getJobs(state),
        }),
        {
            requestLogout: logoutRequestedAction,
            fetchJobs: jobsFetchRequestedAction,
            setLoginRedirect: setLoginRedirectAction,
        },
    )(NavigationBar),
);
