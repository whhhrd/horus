import React, { PureComponent, Fragment } from "react";
import { withRouter, RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

import { getCurrentAccessToken } from "../../../api";

import { Row, Col } from "reactstrap";

import CoursePermissions from "../../../api/permissions";
import { getCoursePermissions } from "../../../state/auth/selectors";
import { ApplicationState } from "../../../state/state";
import {
    assignmentSetsAnyList,
    groupSetsAnyList,
    canExportData,
    labelAdmin,
    courseAdmin,
    suppRoleAdmin,
    participantsAdmin,
    canvasCourseSyncPerform,
} from "../../../state/auth/constants";
import {
    CourseRequestedAction,
    courseRequestedAction,
} from "../../../state/courses/action";
import { CourseDtoSummary } from "../../../api/types";
import { getCourse } from "../../../state/courses/selectors";
import {
    CanvasRefreshParticipantsRequestedAction,
    canvasRefreshParticipantsRequestedAction,
    canvasRefreshCourseRequestedAction,
    CanvasRefreshCourseRequestedAction,
} from "../../../state/canvas-settings/actions";

import { buildContent } from "../../pagebuilder";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTasks,
    faUsers,
    faTags,
    faUsersCog,
    faDownload,
    faSave,
    faInfo,
} from "@fortawesome/free-solid-svg-icons";
import { PATH_MANUAL } from "../../../routes";

interface CourseAdministrationProps {
    coursePermissions: CoursePermissions | null;

    course: (id: number) => CourseDtoSummary | null;
    fetchCourse: (id: number) => CourseRequestedAction;
    refreshParticipants: (
        courseId: number,
    ) => CanvasRefreshParticipantsRequestedAction;
    refreshCourse: (
        courseId: number,
    ) => CanvasRefreshCourseRequestedAction;
}

/**
 * A simplistic overview for different kinds of administrators.
 * Shows links to administration panels for permitted users.
 */
class CourseAdministration extends PureComponent<
    CourseAdministrationProps & RouteComponentProps<any>
    > {
    componentDidMount() {
        // Fetch course (for externalId checking)
        this.props.fetchCourse(this.props.match.params.cid);
    }

    render() {
        return buildContent("Course Administration", this.buildContent(), null);
    }

    buildContent() {
        const cid = this.props.match.params.cid;
        const permissions = this.props.coursePermissions!;
        const course = this.props.course(cid);

        const canListAssignmentSets = assignmentSetsAnyList.check(
            cid,
            permissions,
        );

        const isCourseAdmin = courseAdmin.check(cid, permissions);

        // If the user has no permission to view this page, return 404
        if (!isCourseAdmin) {
            return undefined;
        }

        const isRoleAdmin = suppRoleAdmin.check(cid, permissions);
        const isLabelAdmin = labelAdmin.check(cid, permissions);
        const canListGroupSets = groupSetsAnyList.check(cid, permissions);
        const canExport = canExportData.check(cid, permissions);

        const canRefreshParticipants = participantsAdmin.check(
            cid,
            permissions,
        );

        const canRefreshCourse = canvasCourseSyncPerform.check(
            cid,
            permissions,
        );

        const accessToken = getCurrentAccessToken();

        return (
            <Row>
                <Col xs="12">
                    <div className="w-100 lead">
                        {canListAssignmentSets && (
                            <Fragment>
                                <Link
                                    to={`/courses/${cid}/administration/assignmentsets`}
                                >
                                    <FontAwesomeIcon
                                        icon={faTasks}
                                        className="mr-2"
                                        size="sm"
                                        style={{ width: "30px" }}
                                    />
                                    Manage assignments
                                </Link>
                                <br />
                            </Fragment>
                        )}
                        {canListGroupSets && (
                            <Fragment>
                                <Link
                                    to={`/courses/${cid}/administration/groupsets`}
                                >
                                    <FontAwesomeIcon
                                        icon={faUsers}
                                        className="mr-2"
                                        size="sm"
                                        style={{ width: "30px" }}
                                    />
                                    View groups
                                </Link>
                                <br />
                            </Fragment>
                        )}
                        {isLabelAdmin && (
                            <Fragment>
                                <Link
                                    to={`/courses/${
                                        this.props.match.params.cid
                                        }/administration/labels`}
                                >
                                    <FontAwesomeIcon
                                        icon={faTags}
                                        className="mr-2"
                                        size="sm"
                                        style={{ width: "30px" }}
                                    />
                                    Manage course labels
                                </Link>
                                <br />
                            </Fragment>
                        )}
                        {isRoleAdmin && (
                            <Fragment>
                                <Link
                                    to={`/courses/${
                                        this.props.match.params.cid
                                        }/administration/roles`}
                                >
                                    <FontAwesomeIcon
                                        icon={faUsersCog}
                                        className="mr-2"
                                        size="sm"
                                        style={{ width: "30px" }}
                                    />
                                    Manage TA roles
                                </Link>
                                <br />
                            </Fragment>
                        )}
                        {canExport && accessToken != null && (
                            <Fragment>
                                <a
                                    href={`/api/courses/${
                                        this.props.match.params.cid
                                        }/export?token=${accessToken}`}
                                    target="_blank"
                                >
                                    <FontAwesomeIcon
                                        icon={faSave}
                                        className="mr-2"
                                        size="sm"
                                        style={{ width: "30px" }}
                                    />
                                    Export course data to spreadsheet
                                </a>
                                <br />
                            </Fragment>
                        )}
                        {canRefreshParticipants &&
                            course != null &&
                            course.externalId != null && (
                                <Fragment>
                                    <Link
                                        to={this.props.location.pathname}
                                        onClick={() => {
                                            this.props.refreshParticipants(
                                                course.id,
                                            );
                                        }}
                                    >
                                        <FontAwesomeIcon
                                            icon={faDownload}
                                            className="mr-2"
                                            size="sm"
                                            style={{ width: "30px" }}
                                        />
                                        Reload students and staff list from Canvas
                                    </Link>
                                    <br />
                                </Fragment>
                            )}
                        {canRefreshCourse &&
                            course != null &&
                            course.externalId != null && (
                                <Fragment>
                                    <Link
                                        to={this.props.location.pathname}
                                        onClick={() => {
                                            this.props.refreshCourse(
                                                course.id,
                                            );
                                        }}
                                    >
                                        <FontAwesomeIcon
                                            icon={faDownload}
                                            className="mr-2"
                                            size="sm"
                                            style={{ width: "30px" }}
                                        />
                                        Reload full course (including all groups) from Canvas
                                    </Link>
                                    <br />
                                </Fragment>
                            )}
                        <Fragment>
                            <Link
                                to={this.props.location.pathname}
                                onClick={() => window.open(PATH_MANUAL)}
                            >
                                <FontAwesomeIcon
                                    icon={faInfo}
                                    className="mr-2"
                                    size="sm"
                                    style={{ width: "30px" }}
                                />
                                Download user manual
                                </Link>
                        </Fragment>
                    </div>
                </Col>
            </Row>
        );
    }
}

export default withRouter(
    connect(
        (state: ApplicationState) => ({
            course: (id: number) => getCourse(state, id),
            coursePermissions: getCoursePermissions(state),
        }),
        {
            fetchCourse: courseRequestedAction,
            refreshParticipants: canvasRefreshParticipantsRequestedAction,
            refreshCourse: canvasRefreshCourseRequestedAction,
        },
    )(CourseAdministration),
);
