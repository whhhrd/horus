import React, { Component } from "react";

import logoWhite from "../../images/university_of_twente_logo_black.png";
import { Link, withRouter, RouteComponentProps } from "react-router-dom";
import ListGroup from "reactstrap/lib/ListGroup";
import {
    faTachometerAlt,
    faTasks,
    faBook,
    faSignOutAlt,
    faTools,
    faStoreAlt,
} from "@fortawesome/free-solid-svg-icons";
import { connect } from "react-redux";
import { NavigationBarItem } from "./NavigationBarItem";
import { ActiveTabEnum } from "../../state/navigationBar/types";
import CoursePermissions from "../../api/permissions";
import { ApplicationState } from "../../state/state";
import { getActiveTab } from "../../state/navigationBar/selectors";
import { getCoursePermissions } from "../../state/auth/selectors";
import {
    courseAdmin,
    signoffAssignmentsView,
    signoffAssignmentsPerform,
} from "../../state/auth/constants";
import { logoutRequestedAction } from "../../state/auth/actions";
import { Action } from "redux";

interface NavigationBarProps {
    // userPermissions: boolean | null; // TODO
    activeTab: ActiveTabEnum | null;
    coursePermissions: CoursePermissions | null;
    onPhone: boolean;
    visibleOnPhone: boolean;
    requestLogout: () => Action<string>;
}

export class NavigationBar extends Component<
    NavigationBarProps & RouteComponentProps<any>
> {
    buildContent() {
        const { activeTab, match, onPhone, visibleOnPhone } = this.props;

        const courseId = Number(match.params.cid);
        const inCourse: boolean =
            courseId != null && !isNaN(courseId) && courseId > 0;
        const permissions = this.props.coursePermissions!;

        const hasAdmin = courseAdmin.check(courseId, permissions);
        const canViewSignoffs = signoffAssignmentsPerform.check(
            courseId,
            permissions,
        );
        const canSignoff = signoffAssignmentsView.check(courseId, permissions);

        const deviceClass = onPhone
            ? "NavigationBarSm shadow-lg"
            : "NavigationBar";

        if (!onPhone || visibleOnPhone) {
            return (
                <div id="NavigationBar">
                    <div
                        className={`${deviceClass} bg-light border-top border-bottom border-right`}
                    >
                        <div className="d-flex align-items-start flex-column h-100">
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
                            <div className="w-100">
                                <ListGroup
                                    flush
                                    className={!onPhone ? "border-top" : ""}
                                >
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
                                        onClick={() =>
                                            this.props.requestLogout()
                                        }
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

    render() {
        return this.buildContent();
    }
}

export default withRouter(
    connect(
        (state: ApplicationState) => ({
            activeTab: getActiveTab(state),
            coursePermissions: getCoursePermissions(state),
        }),
        {
            requestLogout: logoutRequestedAction,
        },
    )(NavigationBar),
);
